import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { FormScreen } from '../components/FormScreen';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { createGroup } from '../lib/groups';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'GrupOlustur'>;

export function GrupOlusturScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Grup adı boş olamaz.');
      return;
    }
    setSaving(true);
    try {
      const group = await createGroup(name);
      navigation.replace('GrupAnaSayfa', { groupId: group.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Grup oluşturulamadı.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormScreen>
      <Text style={styles.title}>Grup oluştur</Text>
      <Text style={styles.subtitle}>Grubuna bir ad ver, buluşma ve üye ayarlarını sonra düzenleyebilirsin.</Text>
      <TextField
        label="Grup adı"
        value={name}
        onChangeText={setName}
        placeholder="Ör. Perşembe Sohbetleri"
        autoFocus
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton label="Grubu oluştur" onPress={handleCreate} loading={saving} />
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
