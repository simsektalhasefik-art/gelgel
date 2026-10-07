-- Faz 3 (Parça A) düzeltme: "gelmedi" kaydının bir yöntemi olmaz (hiçbir şey yapmadı).
-- yontem sadece "geldi" olduğunda (konum/qr) dolu olur.

alter table public.attendance alter column yontem drop not null;

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
    select m.id, gm.user_id, 'gelmedi', null
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
