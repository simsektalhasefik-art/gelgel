-- Faz 1: profiller ve profil fotoğrafı deposu

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  avatar_url text,
  age_confirmed boolean not null default false,
  age_confirmed_at timestamptz,
  consent_given boolean not null default false,
  consent_given_at timestamptz,
  reminders_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profil fotoğrafları: en fazla 200 KB, sadece JPEG/PNG/WebP.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 204800, array['image/jpeg', 'image/png', 'image/webp']);

-- Grup tablosu Faz 2'de gelecek; o güne kadar herkes (giriş yapmış kullanıcı) görebilir,
-- ama sadece kendi dosyasını (ilk klasör adı kendi id'si olan) yükleyip değiştirebilir.
create policy "avatars_select_authenticated"
  on storage.objects for select
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatars_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars_update_own"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars_delete_own"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
