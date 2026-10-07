import AsyncStorage from '@react-native-async-storage/async-storage';
// expo-notifications Android'de Expo Go'da çöktüğü için hatırlatmalar telefonun kendi
// takvimi üzerinden yapılıyor (bkz. CLAUDE.md). "expo-calendar/legacy" kasıtlı: paketin
// yeni "Calendar@next" API'si (bare "expo-calendar") Expo Go'da henüz desteklenmiyor,
// eski API ise yıllardır Expo Go'da çalışan asıl native modülü kullanıyor.
import * as Calendar from 'expo-calendar/legacy';

import type { Meeting } from './meetings';

const STORAGE_PREFIX = 'gelgel:takvim:';
const GUN_ONCESI_DAKIKA = -24 * 60;
const SAAT_ONCESI_DAKIKA = -2 * 60;

type StoredEvent = {
  eventId: string;
  baslangic: string;
  enlem: number;
  boylam: number;
  adres: string | null;
};

async function getStored(groupId: string): Promise<StoredEvent | null> {
  const raw = await AsyncStorage.getItem(STORAGE_PREFIX + groupId);
  return raw ? JSON.parse(raw) : null;
}

async function setStored(groupId: string, value: StoredEvent) {
  await AsyncStorage.setItem(STORAGE_PREFIX + groupId, JSON.stringify(value));
}

async function clearStored(groupId: string) {
  await AsyncStorage.removeItem(STORAGE_PREFIX + groupId);
}

async function getWritableCalendarId(): Promise<string> {
  const perm = await Calendar.requestCalendarPermissionsAsync();
  if (perm.status !== 'granted') {
    throw new Error('Takvim izni vermelisin.');
  }
  try {
    const def = await Calendar.getDefaultCalendarAsync();
    if (def?.id) {
      return def.id;
    }
  } catch {
    // Android'de bazı cihazlarda varsayılan takvim bulunamayabilir, aşağıda elle seçiyoruz.
  }
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const yazilabilir = calendars.find((c) => c.allowsModifications) ?? calendars[0];
  if (!yazilabilir) {
    throw new Error('Telefonunda yazılabilir bir takvim bulunamadı.');
  }
  return yazilabilir.id;
}

function buildEventDetails(groupName: string, meeting: Meeting) {
  const konumLinki = `https://www.google.com/maps?q=${meeting.enlem},${meeting.boylam}`;
  const notlar = meeting.adres_metni
    ? `${meeting.adres_metni}\nKonum: ${konumLinki}`
    : `Konum: ${konumLinki}`;

  return {
    title: `Gelgel: ${groupName} — Geliyo musun?`,
    startDate: new Date(meeting.baslangic),
    endDate: new Date(meeting.bitis),
    location: meeting.adres_metni ?? undefined,
    notes: notlar,
    timeZone: 'Europe/Istanbul',
    alarms: [{ relativeOffset: GUN_ONCESI_DAKIKA }, { relativeOffset: SAAT_ONCESI_DAKIKA }],
    recurrenceRule: { frequency: Calendar.Frequency.WEEKLY, interval: 1 },
  };
}

// Kullanıcının kendi bastığı "Takvimime ekle" butonundan çağrılır. Daha önce eklenmişse
// günceller (buton "ekle" ve "güncelle" olarak aynı işi güvenle yapar).
export async function addMeetingToCalendar(groupId: string, groupName: string, meeting: Meeting): Promise<void> {
  const details = buildEventDetails(groupName, meeting);
  const stored = await getStored(groupId);

  if (stored) {
    try {
      await Calendar.updateEventAsync(stored.eventId, details);
      await setStored(groupId, {
        eventId: stored.eventId,
        baslangic: meeting.baslangic,
        enlem: meeting.enlem,
        boylam: meeting.boylam,
        adres: meeting.adres_metni,
      });
      return;
    } catch {
      // Etkinlik telefonda silinmiş olabilir; aşağıda yeniden oluşturuyoruz.
      await clearStored(groupId);
    }
  }

  const calendarId = await getWritableCalendarId();
  const eventId = await Calendar.createEventAsync(calendarId, details);
  await setStored(groupId, {
    eventId,
    baslangic: meeting.baslangic,
    enlem: meeting.enlem,
    boylam: meeting.boylam,
    adres: meeting.adres_metni,
  });
}

export async function isMeetingInCalendar(groupId: string): Promise<boolean> {
  return (await getStored(groupId)) !== null;
}

// Uygulama her açıldığında (grup ana sayfası yüklenince) sessizce çağrılır: sadece daha
// önce "Takvimime ekle" denmiş gruplar için, buluşma saati ya da yeri değiştiyse
// takvimdeki etkinliği günceller. Hiçbir şeyi kullanıcıya sormadan yeni eklemez.
export async function syncCalendarEventSilently(groupId: string, groupName: string, meeting: Meeting | null): Promise<void> {
  const stored = await getStored(groupId);
  if (!stored || !meeting) {
    return;
  }
  const degisti =
    stored.baslangic !== meeting.baslangic || stored.enlem !== meeting.enlem || stored.boylam !== meeting.boylam;
  if (!degisti) {
    return;
  }
  try {
    await addMeetingToCalendar(groupId, groupName, meeting);
  } catch {
    // Sessiz senkronizasyon; izin geri alınmış ya da etkinlik silinmiş olabilir, kullanıcıyı rahatsız etmiyoruz.
  }
}
