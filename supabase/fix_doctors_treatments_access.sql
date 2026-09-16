-- Fix for: "Manage Doctors" / "Manage Treatments" show
-- "Couldn't load doctors/treatments right now" in the admin dashboard.
--
-- Run this AFTER admin_doctors_treatments_noshow.sql. Safe to re-run.
--
-- HOW TO CONFIRM THE EXACT CAUSE FIRST:
-- The admin dashboard code now logs the real Supabase error to the
-- browser console (see page.tsx's fetchDoctors/fetchTreatments) and
-- shows it directly under the error message in the "Manage Doctors" /
-- "Manage Treatments" modal. Open the modal, open your browser's dev
-- tools console, and read the exact error text:
--
--   * relation "public.doctors" does not exist
--     (or "public.treatments")
--     -> The admin_doctors_treatments_noshow.sql migration has not been
--        run on this Supabase project yet. Run that file FIRST, in the
--        Supabase Dashboard -> SQL Editor. This file (below) will not
--        help until that one has been run, because it grants privileges
--        on tables that don't exist yet.
--
--   * permission denied for table doctors
--     (or "for table treatments")
--     -> This is the exact same class of bug already documented and
--        fixed for public.admins in fix_admin_authorization.sql: the
--        table has RLS policies, but the `authenticated` Postgres role
--        was never given the underlying table-level privilege, so every
--        query is rejected before RLS is even evaluated. Run the GRANT
--        statements below to fix it.
--
--   * Anything else (e.g. a network/CORS message, "Failed to fetch")
--     -> Not a database problem. Check NEXT_PUBLIC_SUPABASE_URL /
--        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local and that the
--        Supabase project is not paused.
--
-- WHY THIS CAN HAPPEN EVEN THOUGH admin_doctors_treatments_noshow.sql
-- ENABLES RLS AND CREATES POLICIES:
-- RLS policies only ever narrow down which *rows* a role can see/change.
-- The role still separately needs the ordinary Postgres table-level
-- GRANT (SELECT/INSERT/UPDATE/DELETE) on the table itself, or every
-- query is rejected outright — before Postgres even looks at RLS.
-- Supabase projects are normally set up so new tables in the `public`
-- schema automatically get these grants for `anon`/`authenticated` via
-- default privileges, but if that default was ever changed (e.g. the
-- table was created by a different role, or via a tool/migration path
-- that bypassed Supabase's usual default-privilege setup), the grant can
-- be missing even though everything else about the table looks correct.
-- This project has hit exactly this issue before — see
-- fix_admin_authorization.sql for the identical root cause on
-- public.admins.

grant select, insert, update, delete on public.doctors to authenticated;
grant select, insert, update, delete on public.treatments to authenticated;

-- Sanity checks — run these in the SQL Editor to confirm the fix:

-- 1. Confirms both tables exist and shows their row counts.
select 'doctors' as table_name, count(*) from public.doctors
union all
select 'treatments' as table_name, count(*) from public.treatments;

-- 2. Confirms RLS is enabled and lists the active policies on each table.
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('doctors', 'treatments')
order by tablename, cmd;

-- 3. Confirms the `authenticated` role now has the table-level grants
--    (should show SELECT, INSERT, UPDATE, DELETE for both tables).
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('doctors', 'treatments')
  and grantee = 'authenticated'
order by table_name, privilege_type;
