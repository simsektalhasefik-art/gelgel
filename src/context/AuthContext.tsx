import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { supabase } from '../lib/supabase';

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  age_confirmed: boolean;
  consent_given: boolean;
  reminders_enabled: boolean;
};

type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatarLocalUri: string | null;
  ageConfirmedAt: string;
  consentGivenAt: string;
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  initializing: boolean;
  signUp: (params: SignUpParams) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (changes: { firstName: string; lastName: string; avatarLocalUri: string | null }) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const path = `${userId}/avatar.jpg`;
  const response = await fetch(localUri);
  const blob = await response.blob();
  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) {
    throw error;
  }
  return path;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initializing, setInitializing] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) {
        await loadProfile(data.session.user.id);
      }
      setInitializing(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp: AuthContextValue['signUp'] = async ({
    email,
    password,
    firstName,
    lastName,
    avatarLocalUri,
    ageConfirmedAt,
    consentGivenAt,
  }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { error: error.message };
    }
    const userId = data.user?.id;
    if (!userId) {
      return { error: 'Kayıt tamamlanamadı, lütfen tekrar dene.' };
    }

    let avatarPath: string | null = null;
    if (avatarLocalUri) {
      try {
        avatarPath = await uploadAvatar(userId, avatarLocalUri);
      } catch {
        avatarPath = null;
      }
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      avatar_url: avatarPath,
      age_confirmed: true,
      age_confirmed_at: ageConfirmedAt,
      consent_given: true,
      consent_given_at: consentGivenAt,
    });
    if (profileError) {
      return { error: profileError.message };
    }

    if (data.session) {
      setSession(data.session);
      await loadProfile(userId);
    }

    return { error: null };
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (session) {
      await loadProfile(session.user.id);
    }
  };

  const updateProfile: AuthContextValue['updateProfile'] = async ({ firstName, lastName, avatarLocalUri }) => {
    if (!session) {
      return { error: 'Oturum bulunamadı.' };
    }

    let avatarPath = profile?.avatar_url ?? null;
    if (avatarLocalUri) {
      try {
        avatarPath = await uploadAvatar(session.user.id, avatarLocalUri);
      } catch (e) {
        return { error: e instanceof Error ? e.message : 'Fotoğraf yüklenemedi.' };
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ first_name: firstName.trim(), last_name: lastName.trim(), avatar_url: avatarPath })
      .eq('id', session.user.id);

    if (error) {
      return { error: error.message };
    }

    await refreshProfile();
    return { error: null };
  };

  const value = useMemo(
    () => ({
      session,
      profile,
      initializing,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [session, profile, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalı.');
  }
  return ctx;
}
