-- SPM Dental Care — Public read access to active treatments
-- Run this once in the Supabase SQL Editor, AFTER
-- admin_doctors_treatments_noshow.sql has already been run. Safe to re-run
-- (DROP POLICY IF EXISTS / idempotent GRANT).
--
-- WHY THIS IS NEEDED:
-- public.treatments already exists and is admin-managed (see
-- admin_doctors_treatments_noshow.sql), but its only SELECT policy is
-- scoped `to authenticated` (i.e. logged-in admins only):
--
--   create policy "admins can select treatments" on public.treatments
--     for select to authenticated using (public.is_admin());
--
-- The PUBLIC appointment form runs as the `anon` Postgres role and was
-- never granted any access to this table — so a public SELECT against
-- public.treatments fails outright (permission denied / RLS blocks every
-- row), which is exactly why the public booking form could not read this
-- table and was instead built against a hardcoded list in
-- src/lib/constants.ts. This file adds a second, narrower SELECT policy
-- (and matching table grant) that lets anonymous visitors read only
-- ACTIVE treatments — nothing else changes about this table:
--   - No existing row, column, or policy is removed.
--   - Admins keep full select/insert/update/delete exactly as before.
--   - Inactive treatments remain invisible to the public site.
--   - appointments.treatment stays a plain free-text column (see
--     admin_doctors_treatments_noshow.sql) — this file does not touch
--     public.appointments at all.

-- ============================================================================
-- 1. Public (anon) SELECT policy — active treatments only
-- ============================================================================
drop policy if exists "public can select active treatments" on public.treatments;
create policy "public can select active treatments"
  on public.treatments
  for select
  to anon
  using (is_active = true);

-- ============================================================================
-- 2. Table-level grant
-- ============================================================================
-- Same reasoning as the `authenticated` grant in
-- admin_doctors_treatments_noshow.sql / fix_doctors_treatments_access.sql:
-- RLS policies only ever narrow down which *rows* a role can see — the
-- role still separately needs the ordinary Postgres SELECT privilege on
-- the table itself, or every query is rejected before RLS is evaluated.
grant select on public.treatments to anon;

-- Sanity checks — run these in the SQL Editor to confirm the fix:

-- 1. Confirms the new policy exists alongside the existing admin policy.
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'treatments'
order by cmd, policyname;

-- 2. Confirms the `anon` role now has SELECT on the table.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'treatments'
  and grantee = 'anon';
