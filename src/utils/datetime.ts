// isodow: 1=Pazartesi ... 7=Pazar
export const GUN_ADLARI: Record<number, string> = {
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
  7: 'Pazar',
};

export const GUN_KISA: Record<number, string> = {
  1: 'Pzt',
  2: 'Sal',
  3: 'Çar',
  4: 'Per',
  5: 'Cum',
  6: 'Cmt',
  7: 'Paz',
};

export function formatSaat(date: Date): string {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function formatMeetingWhen(iso: string): string {
  const date = new Date(iso);
  const gun = date.toLocaleDateString('tr-TR', { weekday: 'long' });
  return `${gun} ${formatSaat(date)}`;
}

export function formatMeetingWhenWithDate(iso: string): string {
  const date = new Date(iso);
  const gun = date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  return `${gun}, ${formatSaat(date)}`;
}

export type CheckInWindow =
  | { state: 'before'; opensAt: Date }
  | { state: 'open' }
  | { state: 'after' };

const PENCERE_ONCESI_DAKIKA = 30;

export function getCheckInWindow(meeting: { baslangic: string; bitis: string }): CheckInWindow {
  const now = new Date();
  const baslangic = new Date(meeting.baslangic);
  const bitis = new Date(meeting.bitis);
  const acilisZamani = new Date(baslangic.getTime() - PENCERE_ONCESI_DAKIKA * 60 * 1000);

  if (now < acilisZamani) {
    return { state: 'before', opensAt: acilisZamani };
  }
  if (now > bitis) {
    return { state: 'after' };
  }
  return { state: 'open' };
}

export function saatToDakika(saat: string): number {
  const [h, m] = saat.split(':').map(Number);
  return h * 60 + m;
}

export function dakikaToSaatMetni(dakika: number): string {
  const h = Math.floor(dakika / 60);
  const m = dakika % 60;
  if (m === 0) {
    return `${h} saat`;
  }
  return `${h} saat ${m} dk`;
}
