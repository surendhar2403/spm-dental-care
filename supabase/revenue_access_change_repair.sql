-- SPM Dental Care - add the missing Revenue password change RPC
-- Uses the existing public.revenue_access_settings row and password_hash.

create extension if not exists pgcrypto with schema extensions;

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
     or extensions.crypt(current_password, stored_hash) <> stored_hash
     or extensions.crypt(new_password, stored_hash) = stored_hash then
    return false;
  end if;

  update public.revenue_access_settings
     set password_hash = extensions.crypt(new_password, extensions.gen_salt('bf', 12)),
         updated_at = now()
   where id = true;

  return found;
end;
$$;

revoke all on function public.change_revenue_password(text, text) from public;
grant execute on function public.change_revenue_password(text, text) to authenticated;

notify pgrst, 'reload schema';
