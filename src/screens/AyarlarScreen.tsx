import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrivacyNoticeModal } from '../components/PrivacyNoticeModal';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Ayarlar'>;

export function AyarlarScreen({}: Props) {
  const { signOut } = useAuth();
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.card}>
        <Pressable style={styles.row} onPress={() => setPrivacyModalVisible(true)}>
          <Text style={styles.rowText}>Aydınlatma metni</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Pressable style={styles.row} onPress={signOut}>
          <Text style={styles.signOutText}>Çıkış yap</Text>
        </Pressable>
      </View>

      <PrivacyNoticeModal visible={privacyModalVisible} onClose={() => setPrivacyModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  card: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  rowText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.text,
  },
  chevron: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.coralDark,
  },
  signOutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
