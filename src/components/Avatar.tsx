import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  avatarPath: string | null;
  firstName: string;
  lastName: string;
  size?: number;
};

export function Avatar({ avatarPath, firstName, lastName, size = 96 }: Props) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!avatarPath) {
      setSignedUrl(null);
      return;
    }
    supabase.storage
      .from('avatars')
      .createSignedUrl(avatarPath, 60 * 60 * 24)
      .then(({ data }) => {
        if (!cancelled) {
          setSignedUrl(data?.signedUrl ?? null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [avatarPath]);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (signedUrl) {
    return <Image source={{ uri: signedUrl }} style={[styles.image, dimensionStyle]} />;
  }

  return (
    <View style={[styles.fallback, dimensionStyle]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.coralLight,
  },
  fallback: {
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
    fontFamily: fonts.heading,
  },
});
