-- SPM Dental Care — Admin Dashboard setup
-- Run this whole file once in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- It is safe to re-run: every statement is idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS).
--
-- What this does:
--   1. Creates public.admins — the list of Supabase Auth users allowed to use /admin.
--   2. Creates public.is_admin() — a helper other policies use to check that list.
--   3. Creates public.appointments if it doesn't already exist, matching the columns
--      the public booking form inserts (safe no-op if your table already exists).
--   4. Enables Row Level Security on both tables and (re)creates the exact policies
--      needed: public INSERT-only on appointments, admin-only SELECT/UPDATE/DELETE.
--
-- IMPORTANT: this file only ever grants access to the "anon" and "authenticated"
-- Postgres roles (what the browser uses). It never touches or requires the
-- service_role key — that key must never appear in this app's frontend code.

-- ============================================================================
-- 1. Admins table
-- ============================================================================
-- One row per admin, keyed by their Supabase Auth user id. Being a row in
-- this table — not merely being "any logged-in user" — is what makes someone
-- an admin. See the bottom of this file for how to add an admin.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A signed-in user may check only their own row (used by the login page,
-- middleware, and dashboard layout to confirm admin status). This does NOT
-- by itself grant access to appointments — that's policy #4 below.
drop policy if exists "admins can read own row" on public.admins;
create policy "admins can read own row"
  on public.admins
  for select
  to authenticated
  using (user_id = auth.uid());

-- No insert/update/delete policies are defined for public.admins, so no
-- Postgres role reachable from the app (anon/authenticated) can add or
-- remove admins. Manage this table only from the Supabase Dashboard/SQL
-- Editor, which uses your own elevated Supabase account — never the app.

-- Explicit table-level grant, belt-and-braces alongside the RLS policy
-- above. RLS policies only filter *rows* a role is allowed to see — the
-- role still needs the underlying SELECT privilege on the table itself,
-- or every query (even ones a policy would otherwise allow) is rejected.
-- Supabase projects normally grant this by default for new public-schema
-- tables, but this makes it explicit rather than relying on that.
grant select on public.admins to authenticated;

-- ============================================================================
-- 2. is_admin() helper
-- ============================================================================
-- SECURITY DEFINER so it can check public.admins on behalf of the caller
-- even though that table's own RLS would otherwise only let a user see
-- their own row. This is the standard, safe pattern for "is this user an
-- admin" checks used by other tables' policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ============================================================================
-- 3. Appointments table (created only if it doesn't already exist)
-- ============================================================================
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  phone text not null,
  treatment text not null,
  preferred_date date not null,
  -- NOTE: on a fresh install, run appointment_preferred_time_nullable.sql
  -- right after this file. Patients no longer choose a time on the public
  -- form, so preferred_time must accept NULL until the admin sets it.
  preferred_time time not null,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.appointments enable row level security;

-- ============================================================================
-- 4. Policies on appointments
-- ============================================================================

-- Public booking form: insert-only, no ability to read back what was
-- inserted (the form doesn't need to — it already has the values in memory).
drop policy if exists "public can insert appointments" on public.appointments;
create policy "public can insert appointments"
  on public.appointments
  for insert
  to anon, authenticated
  with check (true);

-- Admin dashboard: read.
drop policy if exists "admins can select appointments" on public.appointments;
create policy "admins can select appointments"
  on public.appointments
  for select
  to authenticated
  using (public.is_admin());

-- Admin dashboard: change status.
drop policy if exists "admins can update appointments" on public.appointments;
create policy "admins can update appointments"
  on public.appointments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admin dashboard: delete.
drop policy if exists "admins can delete appointments" on public.appointments;
create policy "admins can delete appointments"
  on public.appointments
  for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- 5. IMPORTANT — check for pre-existing policies this file doesn't know about
-- ============================================================================
-- If public.appointments already existed before this file ran, it may carry
-- older policies under different names (e.g. from early prototyping) that
-- this script can't see or replace by name. Run this to list everything
-- currently active on the table, then manually drop anything that grants
-- public/anon SELECT, UPDATE, or DELETE:
--
--   select policyname, cmd, roles, qual, with_check
--   from pg_policies
--   where schemaname = 'public' and tablename = 'appointments';
--
-- To drop a stray policy found above:
--   drop policy "<policyname>" on public.appointments;

-- ============================================================================
-- 6. Creating your first admin (do this after running everything above)
-- ============================================================================
-- Step A — create the login itself:
--   Supabase Dashboard > Authentication > Users > Add user
--   Set an email + password. Untick "Auto Confirm User" only if you want to
--   verify via email first; for an internal admin account it's simplest to
--   tick "Auto Confirm User" so it's usable immediately.
--
-- Step B — grant that user admin access by inserting their user id here:
--   (find the id on the same Authentication > Users screen, or run
--   `select id, email from auth.users;`)
--
--   insert into public.admins (user_id, email)
--   values ('paste-the-user-uuid-here', 'the-admin-email@example.com');
--
-- Repeat step B for each additional admin. Removing a row from public.admins
-- immediately revokes that user's dashboard access (their existing session
-- is caught by middleware/layout on their next request and signed out).
