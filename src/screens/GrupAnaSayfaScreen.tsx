import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { Avatar } from '../components/Avatar';
import { CircleIconButton } from '../components/CircleIconButton';
import { GearIcon } from '../components/GearIcon';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAuth } from '../context/AuthContext';
import { addMeetingToCalendar, syncCalendarEventSilently } from '../lib/calendarReminder';
import { getGroup, listGroupMembers } from '../lib/groups';
import type { GroupMember, GroupSummary } from '../lib/groups';
import type { Meeting } from '../lib/meetings';
import { getUpcomingMeeting } from '../lib/meetings';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { showAppAlert } from '../ui/dialog';
import { showToast } from '../ui/toast';
import { formatMeetingWhen, formatSaat } from '../utils/datetime';

type Props = NativeStackScreenProps<RootStackParamList, 'GrupAnaSayfa'>;

const ROLE_LABELS: Record<GroupMember['rol'], string> = {
  yonetici: 'Yönetici',
  uye: 'Üye',
  stk_sorumlusu: 'STK sorumlusu',
};

const UC_GUN_MS = 3 * 24 * 60 * 60 * 1000;

export function GrupAnaSayfaScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const { session } = useAuth();
  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [members, setMembers] = useState<GroupMember[] | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  const isAdmin = members?.some((m) => m.user_id === session?.user.id && m.rol === 'yonetici') ?? false;

  const load = useCallback(() => {
    setLoading(true);
    return Promise.all([getGroup(groupId), listGroupMembers(groupId), getUpcomingMeeting(groupId)])
      .then(([groupData, memberData, meetingData]) => {
        setGroup(groupData);
        setMembers(memberData);
        setMeeting(meetingData);
        syncCalendarEventSilently(groupId, groupData.ad, meetingData).catch(() => {});
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

  const handleShareMeetingUpdate = async () => {
    if (!meeting) return;
    const tarih = new Date(meeting.baslangic);
    const gun = tarih.toLocaleDateString('tr-TR', { weekday: 'long' });
    const saat = formatSaat(tarih);
    const konumLinki = `https://www.google.com/maps?q=${meeting.enlem},${meeting.boylam}`;
    const yer = meeting.adres_metni ? `${meeting.adres_metni} adresinde, ` : '';
    await Share.share({
      message: `Bu ${gun} buluşma ${yer}saat ${saat}. Konum: ${konumLinki}`,
    });
  };

  const handleAddToCalendar = async () => {
    if (!meeting || !group) return;
    setAddingToCalendar(true);
    try {
      await addMeetingToCalendar(groupId, group.ad, meeting);
      showToast('Takvimine eklendi, 1 gün ve 2 saat önce alarm kuruldu.');
    } catch (e) {
      showAppAlert('Olmadı', e instanceof Error ? e.message : 'Takvime eklenemedi.');
    } finally {
      setAddingToCalendar(false);
    }
  };

  if (loading || !group) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.coralDark} style={styles.loading} />
      </SafeAreaView>
    );
  }

  const sorumluKisi = meeting?.sorumlu_id ? (members?.find((m) => m.user_id === meeting.sorumlu_id) ?? null) : null;

  const showDegisiklikNotu =
    meeting?.degisiklik_notu && meeting.degisiklik_zamani &&
    Date.now() - new Date(meeting.degisiklik_zamani).getTime() < UC_GUN_MS;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        style={styles.memberList}
        ListHeaderComponent={
          <View>
            {meeting ? (
              <Pressable
                style={({ pressed }) => [styles.meetingCard, pressed && styles.meetingCardPressed]}
                onPress={() => navigation.navigate('BulusmaDetay', { meetingId: meeting.id })}
              >
                <View style={styles.meetingCardRow}>
                  <View style={styles.meetingCardText}>
                    <Text style={styles.meetingLabel}>Sıradaki buluşma</Text>
                    <Text style={styles.meetingWhen}>{formatMeetingWhen(meeting.baslangic)}</Text>
                    {meeting.adres_metni ? <Text style={styles.meetingAdres}>{meeting.adres_metni}</Text> : null}
                    {sorumluKisi && (
                      <Text style={styles.meetingSorumlu}>
                        Bu haftanın sorumlusu: {sorumluKisi.first_name} {sorumluKisi.last_name}
                      </Text>
                    )}
                  </View>
                  <View style={styles.meetingCardArrow}>
                    <Text style={styles.meetingCardArrowText}>→</Text>
                  </View>
                </View>
                <Text style={styles.meetingCardHint}>Yol tarifi, katılım listesi ve "Geldim" için dokun</Text>
              </Pressable>
            ) : (
              <View style={styles.meetingCard}>
                <Text style={styles.meetingLabel}>Sıradaki buluşma</Text>
                <Text style={styles.meetingBosText}>
                  {isAdmin ? 'Henüz bir buluşma günü ayarlamadın.' : 'Yönetici henüz buluşma gününü ayarlamadı.'}
                </Text>
                {isAdmin && (
                  <Pressable
                    style={styles.meetingBosButton}
                    onPress={() => navigation.navigate('BulusmaAyarlari', { groupId })}
                  >
                    <Text style={styles.meetingBosButtonText}>Buluşma ayarla</Text>
                  </Pressable>
                )}
              </View>
            )}

            {meeting && (
              <View style={styles.calendarButtonWrap}>
                <SecondaryButton label="Takvimime ekle" onPress={handleAddToCalendar} disabled={addingToCalendar} />
              </View>
            )}

            {showDegisiklikNotu && (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeText}>{meeting!.degisiklik_notu}</Text>
                <Pressable style={styles.noticeShareButton} onPress={handleShareMeetingUpdate}>
                  <Text style={styles.noticeShareButtonText}>WhatsApp grubuna da gönder</Text>
                </Pressable>
              </View>
            )}

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
          </View>
        }
        data={members ?? []}
        keyExtractor={(item) => item.user_id}
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
  meetingCard: {
    marginTop: 20,
    backgroundColor: colors.teal,
    borderRadius: 20,
    padding: 20,
  },
  meetingCardPressed: {
    opacity: 0.9,
  },
  meetingCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingCardText: {
    flex: 1,
  },
  meetingCardArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  meetingCardArrowText: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  meetingCardHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.cream,
    opacity: 0.75,
    marginTop: 14,
  },
  meetingLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.cream,
    opacity: 0.8,
  },
  meetingWhen: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.white,
    marginTop: 6,
  },
  meetingAdres: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.cream,
    marginTop: 4,
  },
  meetingSorumlu: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.cream,
    marginTop: 8,
  },
  meetingBosText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.cream,
    marginTop: 8,
  },
  meetingBosButton: {
    marginTop: 14,
    backgroundColor: colors.coralDark,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  meetingBosButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.white,
  },
  calendarButtonWrap: {
    marginTop: 10,
  },
  noticeCard: {
    marginTop: 10,
    backgroundColor: colors.coralLight,
    borderRadius: 14,
    padding: 12,
  },
  noticeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.coralDark,
  },
  noticeShareButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  noticeShareButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.coralDark,
    textDecorationLine: 'underline',
  },
  inviteCard: {
    marginTop: 16,
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
