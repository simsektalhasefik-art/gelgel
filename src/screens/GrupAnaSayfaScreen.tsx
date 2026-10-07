import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { Avatar } from '../components/Avatar';
import { CircleIconButton } from '../components/CircleIconButton';
import { GearIcon } from '../components/GearIcon';
import { getGroup, listGroupMembers } from '../lib/groups';
import type { GroupMember, GroupSummary } from '../lib/groups';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'GrupAnaSayfa'>;

const ROLE_LABELS: Record<GroupMember['rol'], string> = {
  yonetici: 'Yönetici',
  uye: 'Üye',
  stk_sorumlusu: 'STK sorumlusu',
};

export function GrupAnaSayfaScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [members, setMembers] = useState<GroupMember[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    return Promise.all([getGroup(groupId), listGroupMembers(groupId)])
      .then(([groupData, memberData]) => {
        setGroup(groupData);
        setMembers(memberData);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      load().catch(() => {
        if (!cancelled) setGroup(null);
      });
      return () => {
        cancelled = true;
      };
    }, [load])
  );

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerTitle: group?.ad ?? 'Grup',
        headerRight: () => (
          <CircleIconButton icon={<GearIcon />} onPress={() => navigation.navigate('GrupAyarlari', { groupId })} />
        ),
      });
    }, [navigation, group, groupId])
  );

  const handleShare = async () => {
    if (!group) return;
    const link = Linking.createURL(`katil/${group.invite_code}`);
    await Share.share({
      message: `Gelgel'de "${group.ad}" grubuna katıl! Bağlantı: ${link}\nAçılmazsa uygulamada "Davet koduyla katıl" deyip şu kodu yaz: ${group.invite_code}`,
    });
  };

  if (loading || !group) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.coralDark} style={styles.loading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.inviteCard}>
        <Text style={styles.inviteLabel}>Davet kodu</Text>
        <Text style={styles.inviteCode} selectable>
          {group.invite_code}
        </Text>
        <Text style={styles.inviteHint} onPress={handleShare} suppressHighlighting>
          WhatsApp'a gönder
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Üyeler</Text>
      <FlatList
        data={members ?? []}
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
          </View>
        )}
      />
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
  inviteCard: {
    margin: 24,
    marginBottom: 12,
    backgroundColor: colors.coralLight,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  inviteLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  inviteCode: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.coralDark,
    letterSpacing: 2,
    marginTop: 6,
  },
  inviteHint: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.coralDark,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.text,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  memberList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
});
