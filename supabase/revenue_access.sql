-- SPM Dental Care - secure Revenue password access
-- Run once after admin_dashboard.sql. The password is never stored in plaintext.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.revenue_access_settings (
  id boolean primary key default true check (id),
  password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.revenue_access_settings enable row level security;

-- No direct SELECT/INSERT/UPDATE policies are intentional. The functions below
-- are the only access path and always require the current user to be an admin.

create or replace function public.has_revenue_password()
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select public.is_admin()
    and exists (select 1 from public.revenue_access_settings where id = true);
$$;

create or replace function public.revenue_password_configured()
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select public.is_admin()
    and exists (select 1 from public.revenue_access_settings where id = true);
$$;

create or replace function public.verify_revenue_password(candidate_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored_hash text;
begin
  if not public.is_admin() or candidate_password is null then
    return false;
  end if;

  select password_hash
    into stored_hash
    from public.revenue_access_settings
   where id = true;

  return stored_hash is not null
     and extensions.crypt(candidate_password, stored_hash) = stored_hash;
end;
$$;

create or replace function public.initialize_revenue_password(new_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin()
     or new_password is null
     or char_length(new_password) < 8
     or exists (select 1 from public.revenue_access_settings where id = true) then
    return false;
  end if;

  insert into public.revenue_access_settings (id, password_hash)
  values (true, extensions.crypt(new_password, extensions.gen_salt('bf', 12)));

  return true;
end;
$$;

create or replace function public.change_revenue_password(
  current_password text,
  new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored_hash text;
begin
  if not public.is_admin()
     or current_password is null
     or new_password is null
     or char_length(new_password) < 8 then
    return false;
  end if;

  select password_hash
    into stored_hash
    from public.revenue_access_settings
   where id = true;

  if stored_hash is null
     or extensions.crypt(current_password, stored_hash) <> stored_hash then
    return false;
  end if;

  update public.revenue_access_settings
     set password_hash = extensions.crypt(new_password, extensions.gen_salt('bf', 12)),
         updated_at = now()
   where id = true;

  return true;
end;
$$;

revoke all on table public.revenue_access_settings from anon, authenticated;
revoke all on function public.has_revenue_password() from public;
revoke all on function public.revenue_password_configured() from public;
revoke all on function public.verify_revenue_password(text) from public;
revoke all on function public.initialize_revenue_password(text) from public;
revoke all on function public.change_revenue_password(text, text) from public;

grant execute on function public.has_revenue_password() to authenticated;
grant execute on function public.revenue_password_configured() to authenticated;
grant execute on function public.verify_revenue_password(text) to authenticated;
grant execute on function public.initialize_revenue_password(text) to authenticated;
grant execute on function public.change_revenue_password(text, text) to authenticated;

-- Make the new RPC signatures available to PostgREST immediately.
notify pgrst, 'reload schema';
