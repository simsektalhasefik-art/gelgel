export type RootStackParamList = {
  Gruplarim: undefined;
  GrupOlustur: undefined;
  GrubaKatil: { code?: string } | undefined;
  GrupAnaSayfa: { groupId: string };
  GrupAyarlari: { groupId: string };
  BulusmaAyarlari: { groupId: string };
  BulusmaDetay: { meetingId: string };
  Profil: undefined;
  Ayarlar: undefined;
};
