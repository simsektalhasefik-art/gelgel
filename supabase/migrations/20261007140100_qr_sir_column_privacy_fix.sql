-- Düzeltme: "revoke select (qr_sir) ... from authenticated" tek başına işe yaramıyor,
-- çünkü Supabase bu rollere zaten geniş (tüm sütunları kapsayan) bir tablo düzeyi SELECT
-- izni veriyor ve sütun bazlı revoke o geniş izni geçersiz kılmıyor (Postgres'in izin
-- modeli böyle). Doğrusu: tablo düzeyi izni kaldırıp sadece güvenli sütunlara izin vermek.

revoke select on public.meetings from authenticated, anon;

grant select (
  id, group_id, baslangic, bitis, enlem, boylam, yaricap_metre,
  adres_metni, durum, degisiklik_notu, degisiklik_zamani, created_at
) on public.meetings to authenticated;
