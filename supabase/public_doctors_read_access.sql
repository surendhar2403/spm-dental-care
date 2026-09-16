-- SPM Dental Care — Public read access to active doctors
-- Run this once in the Supabase SQL Editor, AFTER
-- admin_doctors_treatments_noshow.sql has already been run. Safe to re-run
-- (DROP POLICY IF EXISTS / idempotent GRANT).
--
-- WHY THIS IS NEEDED:
-- public.doctors already exists and is admin-managed (see
-- admin_doctors_treatments_noshow.sql), but its only SELECT policy is
-- scoped `to authenticated` (i.e. logged-in admins only):
--
--   create policy "admins can select doctors" on public.doctors
--     for select to authenticated using (public.is_admin());
--
-- The PUBLIC website's "Our Dental Specialists" section runs as the
-- `anon` Postgres role and was never granted any access to this table —
-- so a public SELECT against public.doctors fails outright (permission
-- denied / RLS blocks every row), which is exactly why that section
-- could not read this table and was instead built against a hardcoded
-- list in src/lib/constants.ts. This file adds a second, narrower SELECT
-- policy (and matching table grant) that lets anonymous visitors read
-- only ACTIVE doctors — nothing else changes about this table:
--   - No existing row, column, or policy is removed.
--   - Admins keep full select/insert/update/delete exactly as before.
--   - Inactive (removed) doctors remain invisible to the public site.
--   - This is the exact same fix already applied to public.treatments in
--     public_treatments_read_access.sql — same table, same shape of gap.
--
-- HOW TO CONFIRM THIS IS THE ISSUE:
-- Open the public site, open the browser console, and look for a
-- "[dentist section] fetchDoctors Supabase error" log (see
-- src/components/sections/Dentist.tsx). If its `message` is
-- `permission denied for table doctors`, this file fixes it. If it says
-- the relation `public.doctors` does not exist, run
-- `admin_doctors_treatments_noshow.sql` first — this file grants
-- privileges on a table that migration creates.

-- ============================================================================
-- 1. Public (anon) SELECT policy — active doctors only
-- ============================================================================
drop policy if exists "public can select active doctors" on public.doctors;
create policy "public can select active doctors"
  on public.doctors
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
grant select on public.doctors to anon;

-- Sanity checks — run these in the SQL Editor to confirm the fix:

-- 1. Confirms the new policy exists alongside the existing admin policy.
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'doctors'
order by cmd, policyname;

-- 2. Confirms the `anon` role now has SELECT on the table.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'doctors'
  and grantee = 'anon';
