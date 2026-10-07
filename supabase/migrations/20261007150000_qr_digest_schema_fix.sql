-- Düzeltme: qr_code_for_window içindeki digest() çağrısı şemasız yazılmıştı. Bu fonksiyon
-- get_current_qr_code / check_in_qr içinden çağrıldığında, o fonksiyonların search_path'i
-- sadece "public" olduğu için (extensions şeması devre dışı kalıyor) digest() bulunamıyor
-- ve QR kodu hiç dönmüyordu. digest()'i açıkça extensions.digest olarak çağırıyoruz.

create or replace function public.qr_code_for_window(p_seed text, p_window bigint)
returns text
language sql
immutable
as $$
  select upper(substr(encode(extensions.digest(p_seed || ':' || p_window::text, 'sha256'), 'hex'), 1, 6));
$$;
