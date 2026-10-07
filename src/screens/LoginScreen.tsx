import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormScreen } from '../components/FormScreen';
import { LogoBadge } from '../components/LogoBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function LoginScreen({ onNavigateToSignUp }: { onNavigateToSignUp: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('E-posta ve şifreni gir.');
      return;
    }
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) {
      setError('Giriş yapılamadı. E-posta veya şifre hatalı olabilir.');
    }
  };

  return (
    <FormScreen>
      <LogoBadge />
      <Text style={styles.title}>Geliyo musun?</Text>
      <Text style={styles.subtitle}>Hesabına giriş yap.</Text>

      <View style={styles.form}>
        <TextField
          label="E-posta"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          placeholder="ornek@eposta.com"
        />
        <TextField
          label="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          autoComplete="password"
          placeholder="••••••••"
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.buttonWrap}>
        <PrimaryButton label="Giriş yap" onPress={handleLogin} loading={loading} />
      </View>

      <Pressable onPress={onNavigateToSignUp} style={styles.linkWrap}>
        <Text style={styles.linkText}>Hesabın yok mu? Kayıt ol</Text>
      </Pressable>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontFamily: fonts.heading,
    color: colors.teal,
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    marginTop: 32,
  },
  error: {
    color: colors.coralDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    marginTop: 4,
  },
  buttonWrap: {
    marginTop: 12,
  },
  linkWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: colors.coralDark,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
});
