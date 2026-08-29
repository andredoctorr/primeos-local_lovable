-- Make role helpers SECURITY INVOKER (no definer escalation surface).
drop policy if exists user_roles_admin_manage on public.user_roles;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_clinic_member(_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('admin','staff')
  )
$$;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.is_clinic_member(uuid) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.is_clinic_member(uuid) to authenticated, service_role;

-- Role assignment is privileged: only service_role may write user_roles.
revoke insert, update, delete on public.user_roles from authenticated;
