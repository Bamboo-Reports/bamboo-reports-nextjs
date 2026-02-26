-- Add role support to profiles and default everyone to viewer.
alter table public.profiles add column if not exists role text;

update public.profiles
set role = 'viewer'
where role is null;

alter table public.profiles
alter column role set default 'viewer';

alter table public.profiles
alter column role set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
    add constraint profiles_role_check
    check (role in ('viewer', 'admin'));
  end if;
end $$;

-- Promote your test user to admin (replace placeholder).
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
