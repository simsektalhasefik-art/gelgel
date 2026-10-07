-- Faz 3 (Parça A): tekrarlayan buluşma, yoklama, konum doğrulama

alter table public.groups
  add column bulusma_gunu smallint check (bulusma_gunu between 1 and 7),
  add column bulusma_saati time,
  add column bulusma_suresi_dakika int not null default 120,
  add column enlem double precision,
  add column boylam double precision,
  add column yaricap_metre int not null default 100,
  add column adres_metni text;

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  baslangic timestamptz not null,
  bitis timestamptz not null,
  enlem double precision not null,
  boylam double precision not null,
  yaricap_metre int not null default 100,
  adres_metni text,
  durum text not null default 'acik' check (durum in ('acik', 'kapandi')),
  degisiklik_notu text,
  degisiklik_zamani timestamptz,
  created_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  durum text not null check (durum in ('geldi', 'gelmedi')),
  yontem text not null check (yontem in ('konum', 'qr')),
  created_at timestamptz not null default now(),
  unique (meeting_id, user_id)
);

alter table public.meetings enable row level security;
alter table public.attendance enable row level security;

create policy "meetings_select_members"
  on public.meetings for select
  using (public.is_group_member(group_id));

create or replace function public.is_member_of_meeting_group(p_meeting_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.meetings m
    where m.id = p_meeting_id and public.is_group_member(m.group_id)
  );
$$;

create policy "attendance_select_members"
  on public.attendance for select
  using (public.is_member_of_meeting_group(meeting_id));

-- İki nokta arası mesafe (metre). acos argümanı [-1,1] aralığına sıkıştırılır
-- (ondalık hata payı ile mesafe ~0 iken acos tanım dışına taşabiliyor).
create or replace function public.haversine_metres(
  lat1 double precision, lon1 double precision,
  lat2 double precision, lon2 double precision
)
returns double precision
language sql
immutable
as $$
  select 6371000 * acos(
    greatest(-1, least(1,
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    ))
  );
$$;

-- İÇ KULLANIM: doğrudan istemciden çağrılmaz (bkz. aşağıdaki revoke).
-- Grubun kuralına göre sıradaki buluşmayı oluşturur; zaten varsa onu döndürür.
-- Saat hesapları Europe/Istanbul yerel saatine göre yapılır, pg_cron UTC çalışsa da
-- "at time zone" dönüşümü bunu telafi eder.
create or replace function public.ensure_upcoming_meeting(p_group_id uuid)
returns public.meetings
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.groups;
  v_simdi_istanbul timestamp;
  v_sonraki_tarih date;
  v_gun_farki int;
  v_baslangic timestamptz;
  v_bitis timestamptz;
  v_mevcut public.meetings;
  v_sonuc public.meetings;
begin
  select * into g from public.groups where id = p_group_id;

  if g.bulusma_gunu is null or g.bulusma_saati is null or g.enlem is null or g.boylam is null then
    return null;
  end if;

  v_simdi_istanbul := now() at time zone 'Europe/Istanbul';
  v_gun_farki := ((g.bulusma_gunu - extract(isodow from v_simdi_istanbul)::int) + 7) % 7;
  v_sonraki_tarih := v_simdi_istanbul::date + v_gun_farki;
  v_baslangic := (v_sonraki_tarih + g.bulusma_saati) at time zone 'Europe/Istanbul';

  if v_baslangic <= now() then
    v_baslangic := v_baslangic + interval '7 days';
  end if;

  v_bitis := v_baslangic + make_interval(mins => g.bulusma_suresi_dakika);

  select * into v_mevcut from public.meetings
    where group_id = p_group_id and durum = 'acik' and baslangic = v_baslangic;
  if v_mevcut.id is not null then
    return v_mevcut;
  end if;

  insert into public.meetings (group_id, baslangic, bitis, enlem, boylam, yaricap_metre, adres_metni)
  values (p_group_id, v_baslangic, v_bitis, g.enlem, g.boylam, g.yaricap_metre, g.adres_metni)
  returning * into v_sonuc;

  return v_sonuc;
end;
$$;

revoke all on function public.ensure_upcoming_meeting(uuid) from public, anon, authenticated;

-- İÇ KULLANIM: sadece pg_cron çağırır (bkz. aşağıdaki revoke).
-- Süresi geçen buluşmaları kapatır, gelmeyenleri "gelmedi" işaretler (borç oluşturmaz,
-- bu Faz 4'te eklenecek) ve her grup için sıradaki buluşmanın var olduğundan emin olur.
create or replace function public.run_meeting_maintenance()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  g record;
begin
  for m in select * from public.meetings where durum = 'acik' and bitis < now() loop
    insert into public.attendance (meeting_id, user_id, durum, yontem)
    select m.id, gm.user_id, 'gelmedi', 'konum'
    from public.group_members gm
    where gm.group_id = m.group_id
      and not exists (
        select 1 from public.attendance a where a.meeting_id = m.id and a.user_id = gm.user_id
      );

    update public.meetings set durum = 'kapandi' where id = m.id;
  end loop;

  for g in
    select id from public.groups
    where bulusma_gunu is not null and bulusma_saati is not null and enlem is not null
  loop
    perform public.ensure_upcoming_meeting(g.id);
  end loop;
end;
$$;

revoke all on function public.run_meeting_maintenance() from public, anon, authenticated;

create extension if not exists pg_cron;

select cron.schedule(
  'gelgel_meeting_maintenance',
  '*/15 * * * *',
  'select public.run_meeting_maintenance();'
);

-- Buluşma kuralını (gün/saat/süre/yer) kalıcı olarak günceller ("Sürekli" seçeneği).
-- Henüz başlamamış, açık bir sıradaki buluşma varsa silinip yeni kurala göre yeniden oluşturulur.
create or replace function public.update_group_schedule(
  p_group_id uuid,
  p_gun smallint,
  p_saat time,
  p_sure_dakika int,
  p_enlem double precision,
  p_boylam double precision,
  p_adres text
)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_eski public.groups;
  v_yeni public.groups;
  v_yeni_bulusma public.meetings;
begin
  select * into v_eski from public.groups where id = p_group_id;

  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and rol = 'yonetici'
  ) then
    raise exception 'Bu işlem için grubun yöneticisi olman gerekiyor.';
  end if;

  if p_gun is null or p_gun < 1 or p_gun > 7 then
    raise exception 'Geçerli bir gün seç.';
  end if;
  if p_saat is null then
    raise exception 'Geçerli bir saat seç.';
  end if;
  if p_sure_dakika is null or p_sure_dakika < 15 then
    raise exception 'Buluşma süresi en az 15 dakika olmalı.';
  end if;
  if p_enlem is null or p_boylam is null then
    raise exception 'Haritadan bir yer seç.';
  end if;

  update public.groups set
    bulusma_gunu = p_gun,
    bulusma_saati = p_saat,
    bulusma_suresi_dakika = p_sure_dakika,
    enlem = p_enlem,
    boylam = p_boylam,
    adres_metni = p_adres
  where id = p_group_id
  returning * into v_yeni;

  delete from public.meetings
  where group_id = p_group_id and durum = 'acik' and baslangic > now();

  v_yeni_bulusma := public.ensure_upcoming_meeting(p_group_id);

  if v_eski.bulusma_gunu is not null and v_yeni_bulusma.id is not null then
    update public.meetings
    set degisiklik_notu = 'Buluşma günü, saati ya da yeri güncellendi.', degisiklik_zamani = now()
    where id = v_yeni_bulusma.id;
  end if;

  return v_yeni;
end;
$$;

-- Sadece sıradaki (henüz başlamamış) buluşmayı günceller, grubun kalıcı kuralına dokunmaz
-- ("Bu hafta" seçeneği).
create or replace function public.update_upcoming_meeting(
  p_group_id uuid,
  p_baslangic timestamptz,
  p_bitis timestamptz,
  p_enlem double precision,
  p_boylam double precision,
  p_adres text
)
returns public.meetings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bulusma public.meetings;
begin
  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and rol = 'yonetici'
  ) then
    raise exception 'Bu işlem için grubun yöneticisi olman gerekiyor.';
  end if;

  select * into v_bulusma from public.meetings
  where group_id = p_group_id and durum = 'acik' and baslangic > now()
  order by baslangic asc
  limit 1;

  if v_bulusma.id is null then
    raise exception 'Önce bir buluşma günü ayarlamalısın.';
  end if;

  update public.meetings set
    baslangic = p_baslangic,
    bitis = p_bitis,
    enlem = p_enlem,
    boylam = p_boylam,
    adres_metni = p_adres,
    degisiklik_notu = 'Bu haftaya özel değişiklik yapıldı.',
    degisiklik_zamani = now()
  where id = v_bulusma.id
  returning * into v_bulusma;

  return v_bulusma;
end;
$$;

-- "Geldim": konum sunucuda doğrulanır, enlem/boylam hiçbir yere yazılmaz, sadece sonuç kaydedilir.
create or replace function public.check_in_location(
  p_meeting_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_mocked boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.meetings;
  v_mesafe double precision;
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

  if coalesce(p_mocked, false) then
    raise exception 'Konumun güvenilir görünmüyor. Lütfen tekrar dene ya da yöneticiden yardım iste.';
  end if;

  v_mesafe := public.haversine_metres(p_lat, p_lng, m.enlem, m.boylam);

  if v_mesafe > m.yaricap_metre then
    raise exception 'Buluşma noktasına yaklaşık % metre uzaktasın. % m içine gelince tekrar dene.',
      (round(v_mesafe / 10) * 10)::int, m.yaricap_metre;
  end if;

  insert into public.attendance (meeting_id, user_id, durum, yontem)
  values (p_meeting_id, auth.uid(), 'geldi', 'konum')
  on conflict (meeting_id, user_id) do update set durum = 'geldi', yontem = 'konum';
end;
$$;

-- Buluşma katılım listesi: e-posta ve konum hiçbir zaman dönmez.
create or replace function public.meeting_attendance_list(p_meeting_id uuid)
returns table (user_id uuid, first_name text, last_name text, avatar_url text, durum text, yontem text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.first_name, p.last_name, p.avatar_url, a.durum, a.yontem
  from public.meetings m
  join public.group_members gm on gm.group_id = m.group_id
  join public.profiles p on p.id = gm.user_id
  left join public.attendance a on a.meeting_id = m.id and a.user_id = gm.user_id
  where m.id = p_meeting_id and public.is_group_member(m.group_id);
$$;
