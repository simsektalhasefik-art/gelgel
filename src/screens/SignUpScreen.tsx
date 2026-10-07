import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { EyeIcon } from '../components/EyeIcon';
import { FormScreen } from '../components/FormScreen';
import { PrimaryButton } from '../components/PrimaryButton';
import { PrivacyNoticeModal } from '../components/PrivacyNoticeModal';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { compressToUnder200KB } from '../utils/image';

export function SignUpScreen({ onNavigateToLogin }: { onNavigateToLogin: () => void }) {
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [ageConfirmedAt, setAgeConfirmedAt] = useState<string | null>(null);
  const [consentGivenAt, setConsentGivenAt] = useState<string | null>(null);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword &&
    ageConfirmedAt !== null &&
    consentGivenAt !== null;

  const toggleAgeConfirmed = () => {
    setAgeConfirmedAt((prev) => (prev ? null : new Date().toISOString()));
  };

  const toggleConsentGiven = () => {
    setConsentGivenAt((prev) => (prev ? null : new Date().toISOString()));
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Fotoğraf çekmek için kamera izni vermelisin.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const compressed = await compressToUnder200KB(result.assets[0].uri);
      setAvatarUri(compressed);
    }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Galeriden seçmek için izin vermelisin.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const compressed = await compressToUnder200KB(result.assets[0].uri);
      setAvatarUri(compressed);
    }
  };

  const handlePickAvatar = () => {
    Alert.alert('Profil fotoğrafı', 'Fotoğrafını nasıl eklemek istersin?', [
      { text: 'Kameradan çek', onPress: pickFromCamera },
      { text: 'Galeriden seç', onPress: pickFromGallery },
      { text: 'Vazgeç', style: 'cancel' },
    ]);
  };

  const handleSignUp = async () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError('Ad ve soyad zorunlu.');
      return;
    }
    if (!email.trim() || !password) {
      setError('E-posta ve şifreni gir.');
      return;
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (!ageConfirmedAt || !consentGivenAt) {
      setError('Devam etmek için aşağıdaki iki kutuyu da işaretlemelisin.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp({
      email: email.trim(),
      password,
      firstName,
      lastName,
      avatarLocalUri: avatarUri,
      ageConfirmedAt,
      consentGivenAt,
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
    }
  };

  return (
    <FormScreen>
      <Text style={styles.title}>Aramıza katıl</Text>
      <Text style={styles.subtitle}>Birkaç bilgiyle hesabını oluştur.</Text>

      <Pressable style={styles.avatarWrap} onPress={handlePickAvatar}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>
              {`${firstName.charAt(0) || '?'}${lastName.charAt(0) || ''}`.toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.avatarLabel}>{avatarUri ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle (isteğe bağlı)'}</Text>
      </Pressable>

      <View style={styles.form}>
        <TextField label="Ad" value={firstName} onChangeText={setFirstName} placeholder="Adın" textContentType="givenName" />
        <TextField label="Soyad" value={lastName} onChangeText={setLastName} placeholder="Soyadın" textContentType="familyName" />
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
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          autoComplete="password-new"
          placeholder="En az 8 karakter"
          errorText={passwordTooShort ? 'Şifre en az 8 karakter olmalı.' : null}
          rightAccessory={
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <EyeIcon open={showPassword} />
            </Pressable>
          }
        />
        <TextField
          label="Şifre tekrar"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          textContentType="newPassword"
          autoComplete="password-new"
          placeholder="Şifreni tekrar gir"
          errorText={passwordMismatch ? 'Şifreler eşleşmiyor.' : null}
          rightAccessory={
            <Pressable onPress={() => setShowConfirmPassword((v) => !v)} hitSlop={8}>
              <EyeIcon open={showConfirmPassword} />
            </Pressable>
          }
        />
      </View>

      <View style={styles.consentGroup}>
        <View style={styles.checkRow}>
          <Pressable
            onPress={toggleConsentGiven}
            style={[styles.checkbox, consentGivenAt && styles.checkboxChecked]}
            hitSlop={8}
          >
            {consentGivenAt && <Text style={styles.checkmark}>✓</Text>}
          </Pressable>
          <Text style={styles.checkLabel}>
            <Text style={styles.checkLabelLink} onPress={() => setPrivacyModalVisible(true)}>
              Aydınlatma metnini
            </Text>
            {' okudum, kişisel verilerimin işlenmesine açık rıza veriyorum.'}
          </Text>
        </View>
        <View style={styles.checkRow}>
          <Pressable
            onPress={toggleAgeConfirmed}
            style={[styles.checkbox, ageConfirmedAt && styles.checkboxChecked]}
            hitSlop={8}
          >
            {ageConfirmedAt && <Text style={styles.checkmark}>✓</Text>}
          </Pressable>
          <Text style={styles.checkLabel}>18 yaşından büyüğüm.</Text>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.buttonWrap}>
        <PrimaryButton label="Kayıt ol" onPress={handleSignUp} loading={loading} disabled={!canSubmit} />
      </View>

      <Pressable onPress={onNavigateToLogin} style={styles.linkWrap}>
        <Text style={styles.linkText}>Zaten hesabın var mı? Giriş yap</Text>
      </Pressable>

      <PrivacyNoticeModal visible={privacyModalVisible} onClose={() => setPrivacyModalVisible(false)} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontFamily: fonts.heading,
    color: colors.teal,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: 24,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.coralLight,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 32,
  },
  avatarLabel: {
    marginTop: 10,
    color: colors.coralDark,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  form: {
    marginTop: 20,
  },
  consentGroup: {
    marginTop: 4,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.coralDark,
    borderColor: colors.coralDark,
  },
  checkmark: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 13,
  },
  checkLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  checkLabelLink: {
    color: colors.coralDark,
    fontFamily: fonts.bodySemiBold,
    textDecorationLine: 'underline',
  },
  error: {
    color: colors.coralDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    marginTop: 12,
  },
  buttonWrap: {
    marginTop: 12,
  },
  linkWrap: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: {
    color: colors.coralDark,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
});
