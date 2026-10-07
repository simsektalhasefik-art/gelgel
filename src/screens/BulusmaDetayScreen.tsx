import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/Avatar';
import { AssignSorumluModal } from '../components/AssignSorumluModal';
import { LeafletMap } from '../components/LeafletMap';
import { QrDisplayModal } from '../components/QrDisplayModal';
import { QrScannerModal } from '../components/QrScannerModal';
import { SecondaryButton } from '../components/SecondaryButton';
import { TealButton } from '../components/TealButton';
import { useAuth } from '../context/AuthContext';
import { addMeetingToCalendar } from '../lib/calendarReminder';
import { getGroup, listGroupMembers } from '../lib/groups';
import type { AttendanceEntry, Meeting } from '../lib/meetings';
import {
  assignMeetingSorumlu,
  checkInWithLocation,
  checkInWithQrCode,
  getMeeting,
  getMeetingAttendance,
} from '../lib/meetings';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { formatMeetingWhenWithDate, formatSaat, getCheckInWindow } from '../utils/datetime';
import { showAppAlert } from '../ui/dialog';
import { showToast } from '../ui/toast';

type Props = NativeStackScreenProps<RootStackParamList, 'BulusmaDetay'>;

const DURUM_ETIKET: Record<string, string> = {
  geldi: 'Geldi',
  gelmedi: 'Gelmedi',
};

export function BulusmaDetayScreen({ route, navigation }: Props) {
  const { meetingId } = route.params;
  const { session } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [groupName, setGroupName] = useState('');
  const [attendance, setAttendance] = useState<AttendanceEntry[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  const [qrDisplayVisible, setQrDisplayVisible] = useState(false);
  const [qrScannerVisible, setQrScannerVisible] = useState(false);
  const [sorumluModalVisible, setSorumluModalVisible] = useState(false);
  const [assigningSorumlu, setAssigningSorumlu] = useState(false);

  const load = useCallback(() => {
    return getMeeting(meetingId).then((m) =>
      Promise.all([getMeetingAttendance(meetingId), listGroupMembers(m.group_id), getGroup(m.group_id)]).then(
        ([a, members, group]) => {
          setMeeting(m);
          setAttendance(a);
          setGroupName(group.ad);
          setIsAdmin(members.some((mem) => mem.user_id === session?.user.id && mem.rol === 'yonetici'));
        }
      )
    );
  }, [meetingId, session?.user.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const handleYolTarifi = () => {
    if (!meeting) return;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${meeting.enlem},${meeting.boylam}`
        : `https://www.google.com/maps/dir/?api=1&destination=${meeting.enlem},${meeting.boylam}`;
    Linking.openURL(url).catch(() => {
      showAppAlert('Olmadı', 'Harita uygulaması açılamadı.');
    });
  };

  const handleAddToCalendar = async () => {
    if (!meeting || !groupName) return;
    setAddingToCalendar(true);
    try {
      await addMeetingToCalendar(meeting.group_id, groupName, meeting);
      showToast('Takvimine eklendi, 1 gün ve 2 saat önce alarm kuruldu.');
    } catch (e) {
      showAppAlert('Olmadı', e instanceof Error ? e.message : 'Takvime eklenemedi.');
    } finally {
      setAddingToCalendar(false);
    }
  };

  const handleGeldim = async () => {
    if (!meeting) return;
    setCheckingIn(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        showAppAlert('İzin gerekli', 'Yoklama verebilmen için konum iznine ihtiyacımız var.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const mocked = Platform.OS === 'android' ? (loc.mocked ?? false) : false;
      await checkInWithLocation(meetingId, loc.coords.latitude, loc.coords.longitude, mocked);
      showToast('Geldiğin işlendi, görüşürüz!');
      await load();
    } catch (e) {
      showAppAlert('Olmadı', e instanceof Error ? e.message : 'Yoklama verilemedi.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleAssignSorumlu = async (userId: string | null) => {
    setSorumluModalVisible(false);
    setAssigningSorumlu(true);
    try {
      await assignMeetingSorumlu(meetingId, userId);
      showToast(userId ? 'Sorumlu atandı.' : 'Sorumluluk kaldırıldı.');
      await load();
    } catch (e) {
      showAppAlert('Olmadı', e instanceof Error ? e.message : 'Sorumlu atanamadı.');
    } finally {
      setAssigningSorumlu(false);
    }
  };

  const handleQrScanned = async (code: string) => {
    setQrScannerVisible(false);
    try {
      await checkInWithQrCode(meetingId, code);
      showToast('Geldiğin işlendi, görüşürüz!');
      await load();
    } catch (e) {
      showAppAlert('Olmadı', e instanceof Error ? e.message : 'QR kodu okunamadı.');
    }
  };

  if (loading || !meeting) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.coralDark} style={styles.loading} />
      </SafeAreaView>
    );
  }

  const pencere = getCheckInWindow(meeting);
  const pin = { latitude: meeting.enlem, longitude: meeting.boylam };
  const isSorumlu = meeting.sorumlu_id != null && meeting.sorumlu_id === session?.user.id;
  const sorumluKisi = attendance?.find((a) => a.user_id === meeting.sorumlu_id) ?? null;
  const canShowQr = isAdmin || isSorumlu;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        style={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.when}>{formatMeetingWhenWithDate(meeting.baslangic)}</Text>
            {meeting.adres_metni ? <Text style={styles.adres}>{meeting.adres_metni}</Text> : null}

            {isSorumlu && (
              <View style={styles.sorumluBanner}>
                <Text style={styles.sorumluBannerText}>
                  Bu haftanın sorumlususun! Yedek QR'ı gösterebilir, bu haftaya özel yer/saat değiştirebilirsin.
                </Text>
              </View>
            )}

            <View style={styles.sorumluRow}>
              <Text style={styles.sorumluText}>
                {sorumluKisi
                  ? `Bu haftanın sorumlusu: ${sorumluKisi.first_name} ${sorumluKisi.last_name}`
                  : 'Bu haftanın sorumlusu atanmadı.'}
              </Text>
              {isAdmin && (
                <Pressable onPress={() => setSorumluModalVisible(true)} disabled={assigningSorumlu}>
                  <Text style={styles.sorumluLink}>{sorumluKisi ? 'Değiştir' : 'Ata'}</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.mapWrap}>
              <LeafletMap
                centerLatitude={pin.latitude}
                centerLongitude={pin.longitude}
                pinLatitude={pin.latitude}
                pinLongitude={pin.longitude}
                radius={meeting.yaricap_metre}
                interactive={false}
              />
            </View>

            <View style={styles.actionStack}>
              <SecondaryButton label="Yol tarifi al" onPress={handleYolTarifi} />
              <SecondaryButton label="Takvimime ekle" onPress={handleAddToCalendar} disabled={addingToCalendar} />
              {isSorumlu && !isAdmin && (
                <SecondaryButton
                  label="Bu hafta için yer/saat değiştir"
                  onPress={() => navigation.navigate('BulusmaAyarlari', { groupId: meeting.group_id })}
                />
              )}
            </View>

            <View style={styles.checkInWrap}>
              {pencere.state === 'open' && (
                <>
                  <TealButton label="Geldim" onPress={handleGeldim} loading={checkingIn} />
                  <View style={styles.qrButtonsStack}>
                    <SecondaryButton label="QR ile yoklama ver" onPress={() => setQrScannerVisible(true)} />
                    {canShowQr && (
                      <SecondaryButton label="Yedek QR göster" onPress={() => setQrDisplayVisible(true)} />
                    )}
                  </View>
                </>
              )}
              {pencere.state === 'before' && (
                <View style={styles.checkInDisabled}>
                  <Text style={styles.checkInDisabledText}>
                    "Geldim" butonu {formatSaat(pencere.opensAt)}'te açılacak.
                  </Text>
                </View>
              )}
              {pencere.state === 'after' && (
                <View style={styles.checkInDisabled}>
                  <Text style={styles.checkInDisabledText}>Bu buluşma için yoklama kapandı.</Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>Katılım listesi</Text>
          </View>
        }
        data={attendance ?? []}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Avatar avatarPath={item.avatar_url} firstName={item.first_name} lastName={item.last_name} size={40} />
            <Text style={styles.memberName}>
              {item.first_name} {item.last_name}
            </Text>
            <View style={[styles.badge, item.durum === 'geldi' ? styles.badgeGeldi : item.durum === 'gelmedi' ? styles.badgeGelmedi : styles.badgeBekliyor]}>
              <Text
                style={[
                  styles.badgeText,
                  item.durum === 'geldi' && styles.badgeTextGeldi,
                  item.durum === 'gelmedi' && styles.badgeTextGelmedi,
                ]}
              >
                {item.durum ? DURUM_ETIKET[item.durum] : 'Bekleniyor'}
              </Text>
            </View>
          </View>
        )}
      />
      <QrDisplayModal visible={qrDisplayVisible} meetingId={meetingId} onClose={() => setQrDisplayVisible(false)} />
      <QrScannerModal
        visible={qrScannerVisible}
        onClose={() => setQrScannerVisible(false)}
        onScanned={handleQrScanned}
      />
      <AssignSorumluModal
        visible={sorumluModalVisible}
        members={(attendance ?? []).filter((m) => m.user_id !== session?.user.id)}
        currentSorumluId={meeting.sorumlu_id}
        onClose={() => setSorumluModalVisible(false)}
        onPick={handleAssignSorumlu}
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  when: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.teal,
    paddingTop: 20,
  },
  adres: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sorumluBanner: {
    marginTop: 12,
    backgroundColor: colors.teal,
    borderRadius: 14,
    padding: 12,
  },
  sorumluBannerText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.white,
    lineHeight: 18,
  },
  sorumluRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sorumluText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  sorumluLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.coralDark,
    textDecorationLine: 'underline',
    marginLeft: 12,
  },
  mapWrap: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 16,
  },
  actionStack: {
    gap: 10,
    marginTop: 14,
  },
  checkInWrap: {
    marginTop: 20,
  },
  qrButtonsStack: {
    gap: 10,
    marginTop: 10,
  },
  checkInDisabled: {
    backgroundColor: colors.coralLight,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkInDisabledText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.coralDark,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.text,
    marginTop: 28,
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
  },
  memberName: {
    flex: 1,
    marginLeft: 10,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeGeldi: {
    backgroundColor: colors.teal,
  },
  badgeGelmedi: {
    backgroundColor: colors.coralLight,
  },
  badgeBekliyor: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  badgeTextGeldi: {
    color: colors.white,
  },
  badgeTextGelmedi: {
    color: colors.coralDark,
  },
});
