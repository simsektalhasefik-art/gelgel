import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Avatar } from '../components/Avatar';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAuth } from '../context/AuthContext';
import {
  leaveGroup,
  listGroupMembers,
  regenerateInviteCode,
  transferGroupAdmin,
} from '../lib/groups';
import type { GroupMember } from '../lib/groups';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { showAppAlert } from '../ui/dialog';
import { showToast } from '../ui/toast';

type Props = NativeStackScreenProps<RootStackParamList, 'GrupAyarlari'>;

const ROLE_LABELS: Record<GroupMember['rol'], string> = {
  yonetici: 'Yönetici',
  uye: 'Üye',
  stk_sorumlusu: 'STK sorumlusu',
};

export function GrupAyarlariScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const { session } = useAuth();
  const [members, setMembers] = useState<GroupMember[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    return listGroupMembers(groupId)
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const myRole = members?.find((m) => m.user_id === session?.user.id)?.rol;
  const isAdmin = myRole === 'yonetici';

  const handleTransfer = (member: GroupMember) => {
    showAppAlert(
      'Yöneticiliği devret',
      `${member.first_name} ${member.last_name} grubun yeni yöneticisi olsun mu?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Devret',
          onPress: async () => {
            setBusy(true);
            try {
              await transferGroupAdmin(groupId, member.user_id);
              await load();
              showToast('Yöneticilik devredildi.');
            } catch (e) {
              showAppAlert('Olmadı', e instanceof Error ? e.message : 'Devredilemedi.');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  const handleRegenerateCode = () => {
    showAppAlert('Davet kodunu yenile', 'Eski kod geçersiz olur, bunu bilerek devam et.', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Yenile',
        onPress: async () => {
          setBusy(true);
          try {
            const newCode = await regenerateInviteCode(groupId);
            showAppAlert('Yeni davet kodu', newCode);
          } catch (e) {
            showAppAlert('Olmadı', e instanceof Error ? e.message : 'Kod yenilenemedi.');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const handleLeave = () => {
    showAppAlert('Gruptan ayrıl', 'Bu gruptan ayrılmak istediğine emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Ayrıl',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await leaveGroup(groupId);
            navigation.navigate('Gruplarim');
            showToast('Gruptan ayrıldın.');
          } catch (e) {
            showAppAlert('Olmadı', e instanceof Error ? e.message : 'Ayrılamadın.');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (loading || !members) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.coralDark} style={styles.loading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Text style={styles.sectionTitle}>Üyeler</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.user_id}
        style={styles.memberList}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Avatar avatarPath={item.avatar_url} firstName={item.first_name} lastName={item.last_name} size={44} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {item.first_name} {item.last_name}
              </Text>
              <Text style={styles.memberRole}>{ROLE_LABELS[item.rol]}</Text>
            </View>
            {isAdmin && item.user_id !== session?.user.id && (
              <Pressable onPress={() => handleTransfer(item)} disabled={busy} style={busy && styles.disabled}>
                <Text style={styles.transferLink}>Yöneticiliği devret</Text>
              </Pressable>
            )}
          </View>
        )}
      />

      {isAdmin && (
        <View style={styles.regenerateWrap}>
          <SecondaryButton
            label="Buluşma ayarları"
            onPress={() => navigation.navigate('BulusmaAyarlari', { groupId })}
            disabled={busy}
          />
        </View>
      )}

      {isAdmin && (
        <View style={styles.regenerateWrap}>
          <SecondaryButton label="Davet kodunu yenile" onPress={handleRegenerateCode} disabled={busy} />
        </View>
      )}

      <Pressable style={[styles.leaveButton, busy && styles.disabled]} onPress={handleLeave} disabled={busy}>
        {busy ? <ActivityIndicator color={colors.textSecondary} /> : <Text style={styles.leaveButtonText}>Gruptan ayrıl</Text>}
      </Pressable>
      {isAdmin && (
        <Text style={styles.leaveHint}>
          Yönetici olarak ayrılmadan önce yukarıdan birine yöneticiliği devretmen gerekiyor.
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  loading: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.text,
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 8,
  },
  memberList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 24,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
  },
  memberRole: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transferLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.coralDark,
    textDecorationLine: 'underline',
    maxWidth: 90,
    textAlign: 'right',
  },
  regenerateWrap: {
    marginHorizontal: 24,
    marginTop: 8,
  },
  leaveButton: {
    marginHorizontal: 24,
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  disabled: {
    opacity: 0.5,
  },
  leaveHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: -4,
    marginBottom: 16,
    lineHeight: 17,
  },
});
