import {
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/baloo-2';
import { NavigationContainer } from '@react-navigation/native';
import type { NavigationContainerRef } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { extractInviteCodeFromUrl, setPendingInviteCode } from './src/lib/pendingInvite';
import { AppNavigator } from './src/navigation/AppNavigator';
import type { RootStackParamList } from './src/navigation/types';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { colors } from './src/theme/colors';

type AuthScreen = 'login' | 'signup';

function LoadingView() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.coralDark} size="large" />
    </View>
  );
}

function RootContent({
  navigationRef,
}: {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}) {
  const { session, initializing } = useAuth();
  const [screen, setScreen] = useState<AuthScreen>('login');

  if (initializing) {
    return <LoadingView />;
  }

  if (!session) {
    if (screen === 'signup') {
      return <SignUpScreen onNavigateToLogin={() => setScreen('login')} />;
    }
    return <LoginScreen onNavigateToSignUp={() => setScreen('signup')} />;
  }

  return <AppNavigator navigationRef={navigationRef} />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_800ExtraBold,
  });
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    const handleUrl = (url: string) => {
      const code = extractInviteCodeFromUrl(url);
      if (!code) return;
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate('GrubaKatil', { code });
      } else {
        setPendingInviteCode(code);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) {
    return <LoadingView />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <RootContent navigationRef={navigationRef} />
        </NavigationContainer>
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
});
