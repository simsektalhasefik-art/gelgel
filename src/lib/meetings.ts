import { supabase } from './supabase';

export type Meeting = {
  id: string;
  group_id: string;
  baslangic: string;
  bitis: string;
  enlem: number;
  boylam: number;
  yaricap_metre: number;
  adres_metni: string | null;
  durum: 'acik' | 'kapandi';
  degisiklik_notu: string | null;
  degisiklik_zamani: string | null;
  created_at: string;
  sorumlu_id: string | null;
};

export type AttendanceEntry = {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  durum: 'geldi' | 'gelmedi' | null;
  yontem: 'konum' | 'qr' | null;
};

// qr_sir sütunu güvenlik gereği istemciye hiç açılmıyor (bkz. migration'lar); bu yüzden
// burada "*" değil, güvenli sütunların açık listesi kullanılıyor.
const MEETING_COLUMNS =
  'id, group_id, baslangic, bitis, enlem, boylam, yaricap_metre, adres_metni, durum, degisiklik_notu, degisiklik_zamani, created_at, sorumlu_id';

export async function getUpcomingMeeting(groupId: string): Promise<Meeting | null> {
  const { data, error } = await supabase
    .from('meetings')
    .select(MEETING_COLUMNS)
    .eq('group_id', groupId)
    .eq('durum', 'acik')
    .order('baslangic', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Meeting | null;
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  const { data, error } = await supabase.from('meetings').select(MEETING_COLUMNS).eq('id', meetingId).single();
  if (error) throw error;
  return data as Meeting;
}

export async function getMeetingAttendance(meetingId: string): Promise<AttendanceEntry[]> {
  const { data, error } = await supabase.rpc('meeting_attendance_list', { p_meeting_id: meetingId });
  if (error) throw error;
  return (data ?? []) as AttendanceEntry[];
}

export type RecurringSchedule = {
  gun: number;
  saat: string; // "HH:MM"
  sureDakika: number;
  enlem: number;
  boylam: number;
  adres: string | null;
};

export async function saveRecurringSchedule(groupId: string, schedule: RecurringSchedule) {
  const { data, error } = await supabase
    .rpc('update_group_schedule', {
      p_group_id: groupId,
      p_gun: schedule.gun,
      p_saat: schedule.saat,
      p_sure_dakika: schedule.sureDakika,
      p_enlem: schedule.enlem,
      p_boylam: schedule.boylam,
      p_adres: schedule.adres,
    })
    .single();
  if (error) throw error;
  return data;
}

export async function saveThisWeekOnly(groupId: string, schedule: RecurringSchedule): Promise<void> {
  const { error } = await supabase.rpc('update_upcoming_meeting', {
    p_group_id: groupId,
    p_gun: schedule.gun,
    p_saat: schedule.saat,
    p_sure_dakika: schedule.sureDakika,
    p_enlem: schedule.enlem,
    p_boylam: schedule.boylam,
    p_adres: schedule.adres,
  });
  if (error) throw error;
}

export async function checkInWithLocation(meetingId: string, lat: number, lng: number, mocked: boolean) {
  const { error } = await supabase.rpc('check_in_location', {
    p_meeting_id: meetingId,
    p_lat: lat,
    p_lng: lng,
    p_mocked: mocked,
  });
  if (error) throw error;
}

export async function getCurrentQrCode(meetingId: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_current_qr_code', { p_meeting_id: meetingId });
  if (error) throw error;
  return data as string;
}

export async function checkInWithQrCode(meetingId: string, code: string): Promise<void> {
  const { error } = await supabase.rpc('check_in_qr', { p_meeting_id: meetingId, p_code: code });
  if (error) throw error;
}

export async function assignMeetingSorumlu(meetingId: string, userId: string | null): Promise<void> {
  const { error } = await supabase.rpc('assign_meeting_sorumlu', {
    p_meeting_id: meetingId,
    p_user_id: userId,
  });
  if (error) throw error;
}
