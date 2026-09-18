-- SPM Dental Care - secure Revenue password existence check
-- Returns only a boolean; password_hash and table rows never leave PostgreSQL.

create or replace function public.has_revenue_password()
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select public.is_admin()
    and exists (
      select 1
        from public.revenue_access_settings
       where id = true
    );
$$;

revoke all on function public.has_revenue_password() from public;
grant execute on function public.has_revenue_password() to authenticated;

notify pgrst, 'reload schema';