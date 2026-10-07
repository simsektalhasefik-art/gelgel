import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LeafletMap } from '../components/LeafletMap';
import { MapPinIcon } from '../components/MapPinIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { searchAddress } from '../lib/geocoding';
import type { GroupSummary } from '../lib/groups';
import { getGroup, listGroupMembers } from '../lib/groups';
import { saveRecurringSchedule, saveThisWeekOnly } from '../lib/meetings';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { dakikaToSaatMetni, formatSaat, GUN_KISA } from '../utils/datetime';
import { showAppAlert } from '../ui/dialog';
import { showToast } from '../ui/toast';

type Props = NativeStackScreenProps<RootStackParamList, 'BulusmaAyarlari'>;

const SURE_SECENEKLERI = [60, 90, 120, 150, 180];
const VARSAYILAN_MERKEZ = { latitude: 41.0082, longitude: 28.9784 };

export function BulusmaAyarlariScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const { session } = useAuth();

  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gun, setGun] = useState(4);
  const [saat, setSaat] = useState(() => {
    const d = new Date();
    d.setHours(20, 0, 0, 0);
    return d;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [sureDakika, setSureDakika] = useState(120);
  const [location, setLocation] = useState(VARSAYILAN_MERKEZ);
  const [locationSecildi, setLocationSecildi] = useState(false);
  const [locating, setLocating] = useState(false);
  const [adres, setAdres] = useState('');

  const [addressQuery, setAddressQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ displayName: string; lat: number; lng: number }[]>([]);

  useEffect(() => {
    Promise.all([getGroup(groupId), listGroupMembers(groupId)])
      .then(([g, members]) => {
        setGroup(g);
        setIsAdmin(members.some((m) => m.user_id === session?.user.id && m.rol === 'yonetici'));
        if (g.bulusma_gunu) setGun(g.bulusma_gunu);
        if (g.bulusma_saati) {
          const [h, m] = g.bulusma_saati.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m, 0, 0);
          setSaat(d);
        }
        setSureDakika(g.bulusma_suresi_dakika ?? 120);
        if (g.enlem != null && g.boylam != null) {
          setLocation({ latitude: g.enlem, longitude: g.boylam });
          setLocationSecildi(true);
        }
        if (g.adres_metni) setAdres(g.adres_metni);
      })
      .finally(() => setLoading(false));
  }, [groupId]);

  useEffect(() => {
    if (locationSecildi) return;
    Location.getCurrentPositionAsync({})
      .then((loc) => {
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        setLocationSecildi(true);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!addressQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchAddress(addressQuery);
      setSearchResults(results);
      if (results.length === 0) {
        showAppAlert(
          'Sonuç yok',
          'Bu adı haritada bulamadım (dernek, vakıf gibi küçük yerler haritada kayıtlı olmayabilir). Açık adresini yazıp tekrar dener misin? Ya da haritayı sürükleyip iğneyi doğrudan oraya getirebilirsin.'
        );
      }
    } catch (e) {
      showAppAlert('Olmadı', e instanceof Error ? e.message : 'Adres aranamadı.');
    } finally {
      setSearching(false);
    }
  };

  const handlePickResult = (result: { displayName: string; lat: number; lng: number }) => {
    setLocation({ latitude: result.lat, longitude: result.lng });
    setLocationSecildi(true);
    setAdres(result.displayName);
    setSearchResults([]);
    setAddressQuery('');
  };

  const handleMapDragged = (coords: { latitude: number; longitude: number }) => {
    setLocation(coords);
    setLocationSecildi(true);
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        showAppAlert('İzin gerekli', 'Konumunu kullanabilmem için izin vermelisin.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const yer = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(yer);
      setLocationSecildi(true);
      setAdres('');
    } catch (e) {
      showAppAlert('Olmadı', e instanceof Error ? e.message : 'Konumun alınamadı.');
    } finally {
      setLocating(false);
    }
  };

  const saatMetni = formatSaat(saat);

  const persistSchedule = async (mode: 'surekli' | 'bu_hafta') => {
    setSaving(true);
    try {
      const saatStr = `${String(saat.getHours()).padStart(2, '0')}:${String(saat.getMinutes()).padStart(2, '0')}`;
      if (mode === 'surekli') {
        await saveRecurringSchedule(groupId, {
          gun,
          saat: saatStr,
          sureDakika,
          enlem: location.latitude,
          boylam: location.longitude,
          adres: adres || null,
        });
      } else {
        await saveThisWeekOnly(groupId, {
          gun,
          saat: saatStr,
          sureDakika,
          enlem: location.latitude,
          boylam: location.longitude,
          adres: adres || null,
        });
      }
      showToast(mode === 'surekli' ? 'Buluşma günü güncellendi.' : 'Bu haftaya özel değişiklik kaydedildi.');
      navigation.goBack();
    } catch (e) {
      showAppAlert('Olmadı', e instanceof Error ? e.message : 'Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!locationSecildi) {
      showAppAlert('Eksik bilgi', 'Haritayı sürükleyerek ya da adres arayarak bir yer seçmelisin.');
      return;
    }

    if (!isAdmin) {
      // Bu haftanın sorumlusu sadece bu haftayı değiştirebilir; grubun kalıcı kuralına dokunamaz.
      persistSchedule('bu_hafta');
      return;
    }

    const varOlanKural = group?.bulusma_gunu != null;
    if (!varOlanKural) {
      persistSchedule('surekli');
      return;
    }
    showAppAlert('Nasıl kaydedeyim?', 'Bu değişiklik sürekli mi geçerli olsun, yoksa sadece bu hafta mı?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sadece bu hafta', onPress: () => persistSchedule('bu_hafta') },
      { text: 'Sürekli', onPress: () => persistSchedule('surekli') },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ActivityIndicator color={colors.coralDark} style={styles.loading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Hangi gün?</Text>
        <View style={styles.chipRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((g) => (
            <Pressable key={g} style={[styles.chip, gun === g && styles.chipActive]} onPress={() => setGun(g)}>
              <Text style={[styles.chipText, gun === g && styles.chipTextActive]}>{GUN_KISA[g]}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Saat kaçta?</Text>
        <Pressable style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.timeButtonText}>{saatMetni}</Text>
        </Pressable>
        {showTimePicker && (
          <DateTimePicker
            value={saat}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selected) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (event.type === 'set' && selected) {
                setSaat(selected);
              }
              if (Platform.OS === 'android') {
                setShowTimePicker(false);
              }
            }}
          />
        )}

        <Text style={styles.sectionTitle}>Ne kadar sürer?</Text>
        <View style={styles.chipRow}>
          {SURE_SECENEKLERI.map((dk) => (
            <Pressable
              key={dk}
              style={[styles.chip, sureDakika === dk && styles.chipActive]}
              onPress={() => setSureDakika(dk)}
            >
              <Text style={[styles.chipText, sureDakika === dk && styles.chipTextActive]}>
                {dakikaToSaatMetni(dk)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Nerede?</Text>
        <Pressable style={styles.hereButton} onPress={handleUseCurrentLocation} disabled={locating}>
          {locating ? (
            <ActivityIndicator color={colors.coralDark} />
          ) : (
            <Text style={styles.hereButtonText}>Şu an buradayım, burayı seç</Text>
          )}
        </Pressable>
        <Text style={styles.orText}>ya da adres ara</Text>
        <View style={styles.addressRow}>
          <View style={styles.addressInput}>
            <TextField
              value={addressQuery}
              onChangeText={setAddressQuery}
              placeholder="Adres yaz ve Ara'ya bas"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
          <Pressable style={styles.searchButton} onPress={handleSearch} disabled={searching}>
            {searching ? <ActivityIndicator color={colors.white} /> : <Text style={styles.searchButtonText}>Ara</Text>}
          </Pressable>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsCard}>
            {searchResults.map((r, i) => (
              <Pressable key={i} style={styles.resultRow} onPress={() => handlePickResult(r)}>
                <Text style={styles.resultText} numberOfLines={2}>
                  {r.displayName}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.mapWrap}>
          <LeafletMap
            centerLatitude={location.latitude}
            centerLongitude={location.longitude}
            radius={100}
            interactive
            onCenterChange={handleMapDragged}
          />
          <View style={styles.pinOverlay} pointerEvents="none">
            <MapPinIcon size={36} />
          </View>
        </View>
        <Text style={styles.mapHint}>
          Haritayı parmağınla sürükle; iğne her zaman ortada sabit durur, altındaki yer seçilen konumdur. Daire 100
          m'lik yoklama alanını gösterir.
        </Text>
        {adres ? <Text style={styles.adresText}>{adres}</Text> : null}

        <View style={styles.saveWrap}>
          <PrimaryButton label="Kaydet" onPress={handleSave} loading={saving} />
        </View>
      </ScrollView>
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
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.coralDark,
    borderColor: colors.coralDark,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.white,
  },
  timeButton: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    alignItems: 'center',
  },
  timeButtonText: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.teal,
  },
  hereButton: {
    backgroundColor: colors.coralDark,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  hereButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.white,
  },
  orText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  addressInput: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: colors.coralDark,
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.white,
  },
  resultsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  resultRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  resultText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  mapWrap: {
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 4,
    position: 'relative',
  },
  pinOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -48,
  },
  mapHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  adresText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.text,
    marginTop: 6,
  },
  saveWrap: {
    marginTop: 28,
  },
});
