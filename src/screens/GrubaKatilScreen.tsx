import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { FormScreen } from '../components/FormScreen';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { joinGroupWithCode } from '../lib/groups';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'GrubaKatil'>;

export function GrubaKatilScreen({ navigation, route }: Props) {
  const [code, setCode] = useState(route.params?.code ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setError(null);
    if (!code.trim()) {
      setError('Davet kodunu yazmalısın.');
      return;
    }
    setSaving(true);
    try {
      const group = await joinGroupWithCode(code);
      navigation.replace('GrupAnaSayfa', { groupId: group.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Katılma başarısız oldu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen>
      <Text style={styles.title}>Davet koduyla katıl</Text>
      <Text style={styles.subtitle}>Seni davet eden kişinin WhatsApp'tan gönderdiği kodu yaz.</Text>
      <TextField
        label="Davet kodu"
        value={code}
        onChangeText={(text) => setCode(text.toUpperCase())}
        placeholder="Ör. A2B9K7MX"
        autoCapitalize="characters"
        autoCorrect={false}
        autoFocus
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton label="Katıl" onPress={handleJoin} loading={saving} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: fonts.heading,
    color: colors.teal,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  error: {
    color: colors.coralDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    marginBottom: 12,
  },
});
