import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/Avatar';
import { FloatingTabBar } from '../components/FloatingTabBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { PrivacyNoticeModal } from '../components/PrivacyNoticeModal';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { compressToUnder200KB } from '../utils/image';

type Props = NativeStackScreenProps<RootStackParamList, 'Profil'>;

export function ProfileScreen({ navigation }: Props) {
  const { session, profile, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  const startEditing = () => {
    setFirstName(profile?.first_name ?? '');
    setLastName(profile?.last_name ?? '');
    setNewAvatarUri(null);
    setError(null);
    setEditing(true);
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Fotoğraf çekmek için kamera izni vermelisin.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9 });
    if (!result.canceled && result.assets[0]) {
      setNewAvatarUri(await compressToUnder200KB(result.assets[0].uri));
    }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Galeriden seçmek için izin vermelisin.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9 });
    if (!result.canceled && result.assets[0]) {
      setNewAvatarUri(await compressToUnder200KB(result.assets[0].uri));
    }
  };

  const handlePickAvatar = () => {
    Alert.alert('Profil fotoğrafı', 'Fotoğrafını nasıl değiştirmek istersin?', [
      { text: 'Kameradan çek', onPress: pickFromCamera },
      { text: 'Galeriden seç', onPress: pickFromGallery },
      { text: 'Vazgeç', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError('Ad ve soyad zorunlu.');
      return;
    }
    setSaving(true);
    const { error: saveError } = await updateProfile({ firstName, lastName, avatarLocalUri: newAvatarUri });
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setEditing(false);
  };

  if (!profile || !session) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profilim</Text>

        <Pressable
          style={styles.avatarWrap}
          onPress={editing ? handlePickAvatar : undefined}
          disabled={!editing}
        >
          {newAvatarUri ? (
            <Image source={{ uri: newAvatarUri }} style={styles.avatarImage} />
          ) : (
            <Avatar avatarPath={profile.avatar_url} firstName={profile.first_name} lastName={profile.last_name} size={108} />
          )}
          {editing && <Text style={styles.avatarLabel}>Fotoğrafı değiştir</Text>}
        </Pressable>

        {editing ? (
          <View style={styles.form}>
            <TextField label="Ad" value={firstName} onChangeText={setFirstName} textContentType="givenName" />
            <TextField label="Soyad" value={lastName} onChangeText={setLastName} textContentType="familyName" />
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.row}>
              <View style={styles.rowButton}>
                <PrimaryButton label="Kaydet" onPress={handleSave} loading={saving} />
              </View>
            </View>
            <Pressable onPress={() => setEditing(false)} style={styles.linkWrap}>
              <Text style={styles.linkText}>Vazgeç</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.name}>
              {profile.first_name} {profile.last_name}
            </Text>
            <Text style={styles.email}>{session.user.email}</Text>

            <Pressable style={styles.editButton} onPress={startEditing}>
              <Text style={styles.editButtonText}>Bilgileri düzenle</Text>
            </Pressable>
          </View>
        )}

        {!editing && (
          <>
            <Pressable style={styles.linkWrap} onPress={() => setPrivacyModalVisible(true)}>
              <Text style={styles.linkText}>Aydınlatma metnini oku</Text>
            </Pressable>
            <Pressable style={styles.signOutButton} onPress={signOut}>
              <Text style={styles.signOutText}>Çıkış yap</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
      <PrivacyNoticeModal visible={privacyModalVisible} onClose={() => setPrivacyModalVisible(false)} />
      <FloatingTabBar active="Profil" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 96,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.heading,
    color: colors.teal,
    marginBottom: 24,
  },
  avatarWrap: {
    alignItems: 'center',
  },
  avatarImage: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.coralLight,
  },
  avatarLabel: {
    marginTop: 10,
    color: colors.coralDark,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  infoCard: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 22,
    fontFamily: fonts.heading,
    color: colors.text,
  },
  email: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.textSecondary,
    marginTop: 4,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: colors.coralLight,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  editButtonText: {
    color: colors.coralDark,
    fontFamily: fonts.bodySemiBold,
  },
  form: {
    width: '100%',
    marginTop: 24,
  },
  error: {
    color: colors.coralDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    marginBottom: 8,
  },
  row: {
    marginTop: 8,
  },
  rowButton: {
    width: '100%',
  },
  linkWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
  },
  signOutButton: {
    marginTop: 36,
  },
  signOutText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
});
