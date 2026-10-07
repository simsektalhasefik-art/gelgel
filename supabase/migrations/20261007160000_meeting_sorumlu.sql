-- Faz 3 (Parça B): "Bu haftanın sorumlusu" — yöneticinin tek bir buluşma için bir üyeye
-- devrettiği, sadece o buluşmayla sınırlı kısıtlı yetki. Grup kuralları, üye çıkarma,
-- yöneticilik devri ve başkasının yoklamasını değiştirme bu kapsamda DEĞİLDİR — o işlemler
-- zaten yalnızca ayrı, yönetici-kontrollü fonksiyonlarla yapılabiliyor.

alter table public.meetings add column sorumlu_id uuid references auth.users (id) on delete set null;

-- Önceki migration tablo düzeyi SELECT'i kaldırıp sadece güvenli sütunlara izin vermişti;
-- sorumlu_id de aynı listeye ekleniyor (qr_sir hâlâ kapsam dışı).
revoke select on public.meetings from authenticated, anon;

grant select (
  id, group_id, baslangic, bitis, enlem, boylam, yaricap_metre,
  adres_metni, durum, degisiklik_notu, degisiklik_zamani, created_at, sorumlu_id
) on public.meetings to authenticated;

-- Sadece yönetici atar/kaldırır (p_user_id null ise kaldırır); kişi grubun üyesi olmalı
-- ve buluşma hâlâ açık olmalı. Buluşma kapanınca (yeni hafta yeni satır olduğu için)
-- sorumluluk kendiliğinden düşer, ayrı bir temizlik gerekmez.
create or replace function public.assign_meeting_sorumlu(p_meeting_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.meetings;
begin
  select * into m from public.meetings where id = p_meeting_id;
  if m.id is null then
    raise exception 'Buluşma bulunamadı.';
  end if;

  if not exists (
    select 1 from public.group_members
    where group_id = m.group_id and user_id = auth.uid() and rol = 'yonetici'
  ) then
    raise exception 'Bu işlem için grubun yöneticisi olman gerekiyor.';
  end if;

  if m.durum <> 'acik' then
    raise exception 'Bu buluşmanın yoklaması kapandı, sorumlu atanamaz.';
  end if;

  if p_user_id is not null and not exists (
    select 1 from public.group_members where group_id = m.group_id and user_id = p_user_id
  ) then
    raise exception 'Seçilen kişi bu grubun üyesi değil.';
  end if;

  update public.meetings set sorumlu_id = p_user_id where id = p_meeting_id;
end;
$$;

-- Yedek QR: yönetici VEYA o buluşmanın sorumlusu görebilir.
create or replace function public.get_current_qr_code(p_meeting_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.meetings;
  v_pencere bigint;
begin
  select * into m from public.meetings where id = p_meeting_id;
  if m.id is null then
    raise exception 'Buluşma bulunamadı.';
  end if;

  if m.sorumlu_id is distinct from auth.uid() and not exists (
    select 1 from public.group_members
    where group_id = m.group_id and user_id = auth.uid() and rol = 'yonetici'
  ) then
    raise exception 'Bu işlem için grubun yöneticisi ya da bu haftanın sorumlusu olman gerekiyor.';
  end if;

  v_pencere := floor(extract(epoch from now()) / 30);
  return public.qr_code_for_window(m.qr_sir, v_pencere);
end;
$$;

-- "Bu hafta" değişikliği: yönetici VEYA o buluşmanın sorumlusu yapabilir (grubun kalıcı
-- kuralını değiştiren update_group_schedule hâlâ sadece yöneticiye açık).
create or replace function public.update_upcoming_meeting(
  p_group_id uuid,
  p_gun smallint,
  p_saat time,
  p_sure_dakika int,
  p_enlem double precision,
  p_boylam double precision,
  p_adres text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bulusma public.meetings;
  v_baslangic timestamptz;
  v_bitis timestamptz;
begin
  select * into v_bulusma from public.meetings
  where group_id = p_group_id and durum = 'acik' and baslangic > now()
  order by baslangic asc
  limit 1;

  if v_bulusma.id is null then
    raise exception 'Önce bir buluşma günü ayarlamalısın.';
  end if;

  if v_bulusma.sorumlu_id is distinct from auth.uid() and not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and rol = 'yonetici'
  ) then
    raise exception 'Bu işlem için grubun yöneticisi ya da bu haftanın sorumlusu olman gerekiyor.';
  end if;

  v_baslangic := public.next_occurrence(p_gun, p_saat);
  v_bitis := v_baslangic + make_interval(mins => p_sure_dakika);

  update public.meetings set
    baslangic = v_baslangic,
    bitis = v_bitis,
    enlem = p_enlem,
    boylam = p_boylam,
    adres_metni = p_adres,
    degisiklik_notu = 'Bu haftaya özel değişiklik yapıldı.',
    degisiklik_zamani = now()
  where id = v_bulusma.id;
end;
$$;
