-- Faz 2: gruplar, üyelik ve davet kodu akışı

create extension if not exists pgcrypto;

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  ad text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rol text not null default 'uye' check (rol in ('yonetici', 'uye', 'stk_sorumlusu')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- group_members üzerinde RLS kendi kendini sorgulamasın diye (security definer, RLS'i atlar).
create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;

-- Okuma: sadece üyesi olunan gruplar ve o grupların üyelik satırları görünür.
-- Ekleme/güncelleme/silme yoktur; her değişiklik aşağıdaki güvenli (security definer) fonksiyonlarla yapılır.
create policy "groups_select_members"
  on public.groups for select
  using (public.is_group_member(id));

create policy "group_members_select_same_group"
  on public.group_members for select
  using (public.is_group_member(group_id));

-- Davet kodu: karışabilecek karakterler (0, O, 1, I, L) hariç, 8 karakter.
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  alphabet text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  code text := '';
begin
  for i in 1..8 loop
    code := code || substr(alphabet, floor(random() * length(alphabet))::int + 1, 1);
  end loop;
  return code;
end;
$$;

create or replace function public.create_group(p_name text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.groups;
  v_code text;
  v_tries int := 0;
begin
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Grup adı boş olamaz.';
  end if;

  loop
    v_code := public.generate_invite_code();
    begin
      insert into public.groups (ad, invite_code) values (trim(p_name), v_code) returning * into v_group;
      exit;
    exception when unique_violation then
      v_tries := v_tries + 1;
      if v_tries > 5 then
        raise exception 'Davet kodu üretilemedi, tekrar dene.';
      end if;
    end;
  end loop;

  insert into public.group_members (group_id, user_id, rol)
  values (v_group.id, auth.uid(), 'yonetici');

  return v_group;
end;
$$;

create or replace function public.join_group(p_code text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.groups;
  v_normalized text := upper(trim(p_code));
begin
  select * into v_group from public.groups where invite_code = v_normalized;

  if v_group.id is null then
    raise exception 'Kod geçersiz.';
  end if;

  if exists (
    select 1 from public.group_members
    where group_id = v_group.id and user_id = auth.uid()
  ) then
    raise exception 'Bu grubun üyesisin zaten.';
  end if;

  insert into public.group_members (group_id, user_id, rol)
  values (v_group.id, auth.uid(), 'uye');

  return v_group;
end;
$$;

create or replace function public.regenerate_invite_code(p_group_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_tries int := 0;
begin
  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and rol = 'yonetici'
  ) then
    raise exception 'Bu işlem için grubun yöneticisi olman gerekiyor.';
  end if;

  loop
    v_code := public.generate_invite_code();
    begin
      update public.groups set invite_code = v_code where id = p_group_id;
      exit;
    exception when unique_violation then
      v_tries := v_tries + 1;
      if v_tries > 5 then
        raise exception 'Davet kodu üretilemedi, tekrar dene.';
      end if;
    end;
  end loop;

  return v_code;
end;
$$;

create or replace function public.transfer_group_admin(p_group_id uuid, p_new_admin_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and rol = 'yonetici'
  ) then
    raise exception 'Bu işlem için grubun yöneticisi olman gerekiyor.';
  end if;

  if not exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = p_new_admin_id
  ) then
    raise exception 'Seçilen kişi bu grubun üyesi değil.';
  end if;

  update public.group_members set rol = 'uye' where group_id = p_group_id and user_id = auth.uid();
  update public.group_members set rol = 'yonetici' where group_id = p_group_id and user_id = p_new_admin_id;
end;
$$;

create or replace function public.leave_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rol text;
begin
  select rol into v_rol from public.group_members
  where group_id = p_group_id and user_id = auth.uid();

  if v_rol is null then
    raise exception 'Bu grubun üyesi değilsin.';
  end if;

  if v_rol = 'yonetici' then
    raise exception 'Ayrılmadan önce yöneticiliği başka bir üyeye devretmelisin.';
  end if;

  delete from public.group_members where group_id = p_group_id and user_id = auth.uid();
end;
$$;

-- Üye listesi: e-posta hariç, sadece aynı gruptaki üyelere ad, soyad, fotoğraf ve rol.
create or replace function public.group_member_profiles(p_group_id uuid)
returns table (user_id uuid, first_name text, last_name text, avatar_url text, rol text, joined_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.first_name, p.last_name, p.avatar_url, gm.rol, gm.joined_at
  from public.group_members gm
  join public.profiles p on p.id = gm.user_id
  where gm.group_id = p_group_id
    and public.is_group_member(p_group_id);
$$;

-- Profil fotoğrafı: Faz 1'de "giriş yapmış herkes" idi; şimdi sadece kendisi ve aynı gruptaki üyeler.
create or replace function public.shares_group_with(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members gm1
    join public.group_members gm2 on gm1.group_id = gm2.group_id
    where gm1.user_id = auth.uid() and gm2.user_id = p_user_id
  );
$$;

drop policy "avatars_select_authenticated" on storage.objects;

create policy "avatars_select_self_or_group"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.shares_group_with(((storage.foldername(name))[1])::uuid)
    )
  );
