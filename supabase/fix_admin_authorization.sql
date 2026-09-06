-- Fix for: valid admin gets "That account isn't authorized for the admin
-- dashboard." after a successful sign-in.
--
-- Root cause: the app's admin-check code was querying public.admins
-- directly, which depends on that table's own RLS SELECT policy AND on
-- the `authenticated` role having a table-level SELECT grant on it. If
-- that grant wasn't present, the query silently returned no row instead
-- of surfacing a permissions error.
--
-- The app code has been updated to call public.is_admin() (SECURITY
-- DEFINER) instead, which doesn't depend on that grant at all. This SQL
-- adds the grant anyway, defensively — safe to run even if it was already
-- present, and safe to run even if the grant was never actually the
-- issue.
--
-- Run this once in the Supabase SQL Editor. It's a subset of
-- admin_dashboard.sql — re-running that whole file instead also works,
-- since every statement in it is idempotent.

grant select on public.admins to authenticated;

-- Sanity check: confirms is_admin() correctly resolves your own admin row
-- when run as your own account. Run this from the SQL Editor while
-- impersonating nothing in particular — it checks whatever role the SQL
-- Editor itself runs as, so it will normally show `false` there (the SQL
-- Editor doesn't run as your app's authenticated user). It's here for
-- reference; the real test is signing in through /admin/login.
-- select public.is_admin();

-- To directly confirm the admin row is present and correctly typed:
select user_id, email, created_at
from public.admins
where user_id = 'f89f6a78-b76a-4b9c-ac4d-45bc16cc0c7c';
