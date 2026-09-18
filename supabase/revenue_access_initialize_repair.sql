-- SPM Dental Care - repair missing Revenue initialization RPC
-- Run this if revenue_access.sql was only partially applied.
-- It uses the existing public.revenue_access_settings table and stores only a hash.

create extension if not exists pgcrypto with schema extensions;

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
     or exists (
       select 1
         from public.revenue_access_settings
        where id = true
     ) then
    return false;
  end if;

  insert into public.revenue_access_settings (id, password_hash)
  values (
    true,
    extensions.crypt(new_password, extensions.gen_salt('bf', 12))
  );

  return true;
end;
$$;

revoke all on function public.initialize_revenue_password(text) from public;
grant execute on function public.initialize_revenue_password(text) to authenticated;

notify pgrst, 'reload schema';
