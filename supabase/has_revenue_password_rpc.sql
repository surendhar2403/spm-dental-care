-- Repair the missing Revenue configuration RPC.

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

-- Verification: the expected arguments value is an empty string.
select
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'has_revenue_password';