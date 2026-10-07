-- Faz 3 (Parça A) düzeltme: gün/saat hesaplama tek bir yardımcı fonksiyonda toplanıyor
-- (Europe/Istanbul saat dilimi, pg_cron UTC çalışsa bile doğru sonuç verir). Hem
-- tekrarlayan kural hem "bu hafta" tek seferlik değişiklik aynı hesaplamayı kullanır.

create or replace function public.next_occurrence(p_gun smallint, p_saat time)
returns timestamptz
language plpgsql
stable
as $$
declare
  v_simdi_istanbul timestamp;
  v_gun_farki int;
  v_sonraki_tarih date;
  v_sonuc timestamptz;
begin
  v_simdi_istanbul := now() at time zone 'Europe/Istanbul';
  v_gun_farki := ((p_gun - extract(isodow from v_simdi_istanbul)::int) + 7) % 7;
  v_sonraki_tarih := v_simdi_istanbul::date + v_gun_farki;
  v_sonuc := (v_sonraki_tarih + p_saat) at time zone 'Europe/Istanbul';
  if v_sonuc <= now() then
    v_sonuc := v_sonuc + interval '7 days';
  end if;
  return v_sonuc;
end;
$$;

revoke all on function public.next_occurrence(smallint, time) from public, anon, authenticated;
grant execute on function public.next_occurrence(smallint, time) to authenticated;

create or replace function public.ensure_upcoming_meeting(p_group_id uuid)
returns public.meetings
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.groups;
  v_baslangic timestamptz;
  v_bitis timestamptz;
  v_mevcut public.meetings;
  v_sonuc public.meetings;
begin
  select * into g from public.groups where id = p_group_id;

  if g.bulusma_gunu is null or g.bulusma_saati is null or g.enlem is null or g.boylam is null then
    return null;
  end if;

  v_baslangic := public.next_occurrence(g.bulusma_gunu, g.bulusma_saati);
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

-- "Bu hafta" artık ham zaman damgası değil, gün/saat/süre alıyor; hesaplamayı
-- next_occurrence yapıyor (istemci tarafında saat dilimi hesaplamaktan kaçınmak için).
drop function if exists public.update_upcoming_meeting(uuid, timestamptz, timestamptz, double precision, double precision, text);

create or replace function public.update_upcoming_meeting(
  p_group_id uuid,
  p_gun smallint,
  p_saat time,
  p_sure_dakika int,
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
  v_baslangic timestamptz;
  v_bitis timestamptz;
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
  where id = v_bulusma.id
  returning * into v_bulusma;

  return v_bulusma;
end;
$$;
