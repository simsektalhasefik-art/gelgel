-- Faz 3 (Parça B): yedek QR ile yoklama. Kod, her buluşmaya özel gizli bir tohumdan
-- (qr_sir) ve 30 saniyelik zaman diliminden türetilir; hiçbir yerde sabit kod saklanmaz,
-- her 30 saniyede kendiliğinden değişir ve eski kod geçersiz olur.

alter table public.meetings add column qr_sir text not null default encode(gen_random_bytes(16), 'hex');

-- qr_sir, satır bazlı RLS'in izin verdiği hiçbir istemciye (üye dahil) sütun bazında bile
-- görünmez; sadece security definer fonksiyonlar (tablo sahibi olarak) okuyabilir.
revoke select (qr_sir) on public.meetings from authenticated, anon;

-- update_upcoming_meeting "meetings" satırının tamamını (qr_sir dahil) döndürüyordu;
-- bir security definer fonksiyonun dönüş değeri sütun bazlı revoke'tan etkilenmediği için
-- bu, qr_sir'i istemciye sızdırırdı. İstemci zaten dönen satırı kullanmıyordu; void yapıldı.
drop function if exists public.update_upcoming_meeting(uuid, smallint, time, int, double precision, double precision, text);

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
  v_meeting_id uuid;
  v_baslangic timestamptz;
  v_bitis timestamptz;
begin
  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and rol = 'yonetici'
  ) then
    raise exception 'Bu işlem için grubun yöneticisi olman gerekiyor.';
  end if;

  select id into v_meeting_id from public.meetings
  where group_id = p_group_id and durum = 'acik' and baslangic > now()
  order by baslangic asc
  limit 1;

  if v_meeting_id is null then
    raise exception 'Önce bir buluşma günü ayarlamalısın.';
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
  where id = v_meeting_id;
end;
$$;

create or replace function public.qr_code_for_window(p_seed text, p_window bigint)
returns text
language sql
immutable
as $$
  select upper(substr(encode(digest(p_seed || ':' || p_window::text, 'sha256'), 'hex'), 1, 6));
$$;

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

  if not exists (
    select 1 from public.group_members
    where group_id = m.group_id and user_id = auth.uid() and rol = 'yonetici'
  ) then
    raise exception 'Bu işlem için grubun yöneticisi olman gerekiyor.';
  end if;

  v_pencere := floor(extract(epoch from now()) / 30);
  return public.qr_code_for_window(m.qr_sir, v_pencere);
end;
$$;

-- Üye kameradan okuduğu kodu gönderir; sunucu aynı tohum+zaman diliminden kendi
-- hesapladığı kodla karşılaştırır (bir önceki 30 saniyelik pencereye de tolerans tanır).
create or replace function public.check_in_qr(p_meeting_id uuid, p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.meetings;
  v_pencere bigint;
  v_girilen text;
begin
  select * into m from public.meetings where id = p_meeting_id;
  if m.id is null or not public.is_group_member(m.group_id) then
    raise exception 'Bu buluşmaya erişimin yok.';
  end if;

  if m.durum <> 'acik' then
    raise exception 'Bu buluşmanın yoklaması kapandı.';
  end if;

  if now() < (m.baslangic - interval '30 minutes') or now() > m.bitis then
    raise exception 'Yoklama penceresi açık değil.';
  end if;

  v_pencere := floor(extract(epoch from now()) / 30);
  v_girilen := upper(trim(p_code));

  if v_girilen <> public.qr_code_for_window(m.qr_sir, v_pencere)
     and v_girilen <> public.qr_code_for_window(m.qr_sir, v_pencere - 1) then
    raise exception 'QR kodu geçersiz ya da süresi doldu, yöneticiden yeni kodu iste.';
  end if;

  insert into public.attendance (meeting_id, user_id, durum, yontem)
  values (p_meeting_id, auth.uid(), 'geldi', 'qr')
  on conflict (meeting_id, user_id) do update set durum = 'geldi', yontem = 'qr';
end;
$$;
