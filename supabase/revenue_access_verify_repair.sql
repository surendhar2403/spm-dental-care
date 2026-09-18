-- SPM Dental Care - repair Revenue password verification
-- Run if a saved Revenue password is rejected by the login RPC.
-- Uses the existing public.revenue_access_settings.password_hash value.

create extension if not exists pgcrypto with schema extensions;

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

  -- crypt(plain_text, stored_hash) verifies bcrypt using the hash's embedded salt.
  return stored_hash is not null
     and extensions.crypt(candidate_password, stored_hash) = stored_hash;
end;
$$;

revoke all on function public.verify_revenue_password(text) from public;
grant execute on function public.verify_revenue_password(text) to authenticated;

notify pgrst, 'reload schema';
