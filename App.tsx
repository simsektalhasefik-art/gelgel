import {
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/baloo-2';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
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

function RootContent() {
  const { session, initializing } = useAuth();
  const [screen, setScreen] = useState<AuthScreen>('login');

  if (initializing) {
    return <LoadingView />;
  }

  if (session) {
    return <ProfileScreen />;
  }

  if (screen === 'signup') {
    return <SignUpScreen onNavigateToLogin={() => setScreen('login')} />;
  }

  return <LoginScreen onNavigateToSignUp={() => setScreen('signup')} />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <LoadingView />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootContent />
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
