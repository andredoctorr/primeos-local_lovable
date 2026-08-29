-- 1. Role infrastructure
do $$ begin
  create type public.app_role as enum ('admin','staff','user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists user_roles_admin_manage on public.user_roles;
create policy user_roles_admin_manage on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- helper: approved clinic member
create or replace function public.is_clinic_member(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('admin','staff')
  )
$$;

revoke execute on function public.is_clinic_member(uuid) from public, anon;
grant execute on function public.is_clinic_member(uuid) to authenticated, service_role;

-- seed: existing users become admins so the app keeps working
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users
on conflict do nothing;

-- 2. Replace blanket authenticated policies on all business tables
do $$
declare t record;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
      and c.relname not in ('profiles','user_roles')
  loop
    execute format('drop policy if exists %I on public.%I', t.relname || '_authenticated_all', t.relname);
    execute format('drop policy if exists %I on public.%I', t.relname || '_member_access', t.relname);
    execute format($f$
      create policy %I on public.%I
        for all to authenticated
        using (
          public.is_clinic_member(auth.uid())
          or created_by = (auth.jwt() ->> 'email')
        )
        with check (
          public.is_clinic_member(auth.uid())
          or created_by = (auth.jwt() ->> 'email')
        )
    $f$, t.relname || '_member_access', t.relname);
  end loop;
end $$;

-- 3. profiles: own row only (admins see all), no self role escalation
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_select_all_authenticated on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.has_role(auth.uid(), 'admin') then
    new.role := old.role;
  end if;
  return new;
end;
$$;

revoke execute on function public.prevent_profile_role_escalation() from public, anon, authenticated;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_role_escalation();
