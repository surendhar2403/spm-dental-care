-- SPM Dental Care — Admin: Doctors, Treatments, and No Show status
-- Run this once in the Supabase SQL Editor, AFTER supabase/admin_dashboard.sql
-- (and, if you've run it, admin_archive_and_manual_appointments.sql) have
-- already been run. Safe to re-run: every statement is idempotent
-- (IF NOT EXISTS / DROP POLICY IF EXISTS / ON CONFLICT DO NOTHING /
-- constraint drop-then-recreate).
--
-- What this does:
--   1. Creates public.doctors — a new, admin-managed table for the
--      "Manage Doctors" feature. Seeded with the clinic's existing four
--      dentists (previously only the hardcoded DENTAL_SPECIALISTS
--      constant in src/lib/constants.ts) so the admin dashboard starts
--      out showing the real current roster.
--   2. Creates public.treatments — a new, admin-managed table for the
--      "Manage Treatments" feature. Seeded with the existing
--      ADMIN_TREATMENT_OPTIONS list (src/types/admin.ts) so the admin
--      dashboard starts out showing the real current option list.
--   3. Adds 'no_show' as a valid value of public.appointments.status,
--      alongside the existing pending/confirmed/completed/cancelled — no
--      existing status value is removed, renamed, or reinterpreted.
--
-- IMPORTANT — no existing data is touched:
--   - appointments.treatment stays a plain free-text column. It is NOT
--     turned into a foreign key referencing public.treatments, so no
--     existing appointment row (or the treatment text stored on it) is
--     affected in any way by this migration or by later edits to the
--     treatments list.
--   - appointments has no doctor reference of any kind (the public site's
--     "Our Dental Specialists" section is independent, static content),
--     so nothing about doctors can affect appointment data either.
--   - "Removing" a doctor or treatment from the admin dashboard sets
--     is_active = false — it never deletes the row — so history/audit
--     trail is preserved and the action is always reversible from the
--     database if ever needed.

-- ============================================================================
-- 1. Doctors table
-- ============================================================================
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credentials text,
  specialty text,
  description text,
  experience integer not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.doctors
  add column if not exists experience integer not null default 0;

comment on table public.doctors is
  'Admin-managed doctor roster. is_active = false means "removed" from '
  'the admin dashboard''s point of view — rows are never hard-deleted so '
  'the action stays reversible and no history is lost.';

alter table public.doctors enable row level security;

drop policy if exists "admins can select doctors" on public.doctors;
create policy "admins can select doctors"
  on public.doctors
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can insert doctors" on public.doctors;
create policy "admins can insert doctors"
  on public.doctors
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admins can update doctors" on public.doctors;
create policy "admins can update doctors"
  on public.doctors
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can delete doctors" on public.doctors;
create policy "admins can delete doctors"
  on public.doctors
  for delete
  to authenticated
  using (public.is_admin());

-- Explicit table-level grant, belt-and-braces alongside the RLS policies
-- above. RLS only filters *rows* a role may see/change once it already
-- has the underlying Postgres privilege on the table — without this
-- grant every query is rejected outright ("permission denied for table
-- doctors") before RLS is even evaluated. This project's `authenticated`
-- role does not reliably get this by default for new public-schema
-- tables (the same gap already hit public.admins — see
-- fix_admin_authorization.sql), so it's made explicit here rather than
-- assumed.
grant select, insert, update, delete on public.doctors to authenticated;

-- Seed with the clinic's existing specialists (src/lib/constants.ts ->
-- DENTAL_SPECIALISTS) so the dashboard isn't empty on first use. Guarded
-- so re-running this file never creates duplicates.
insert into public.doctors (name, credentials, specialty, description, experience, sort_order)
select v.name, v.credentials, v.specialty, v.description, v.experience, v.sort_order
from (
  values
    ('Dr Mohammed Ibrahim', 'MDS', 'Periodontics',
      'Cares for gum health and the supporting structures around your teeth.', 18, 1),
    ('Dr Sabiha Naz', 'MDS', 'Orthodontics',
      'Aligns teeth and bite for a straighter, healthier smile.', 12, 2),
    ('Dr Saji Ravichandran', 'BDS', 'Root Canal Care',
      'Treats infected or damaged tooth pulp to relieve pain and save the tooth.', 10, 3),
    ('Dr Abirami', 'MDS', 'Maxillofacial Surgery',
      'Handles surgical needs of the jaw, face, and mouth.', 14, 4)
) as v(name, credentials, specialty, description, experience, sort_order)
where not exists (select 1 from public.doctors d where d.name = v.name);

-- ============================================================================
-- 2. Treatments table
-- ============================================================================
create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price numeric(10, 2),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.treatments
  add column if not exists price numeric(10, 2);

comment on table public.treatments is
  'Admin-managed treatment option list, used by the "+ New Appointment" '
  'form and the appointment table''s inline treatment editor. '
  'appointments.treatment stores the chosen name as plain text, not a '
  'foreign key to this table, so editing/removing a treatment here never '
  'changes any existing appointment''s stored value.';

comment on column public.treatments.price is
  'Optional treatment amount in Indian rupees. NULL means no configured price.';

alter table public.treatments enable row level security;

drop policy if exists "admins can select treatments" on public.treatments;
create policy "admins can select treatments"
  on public.treatments
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can insert treatments" on public.treatments;
create policy "admins can insert treatments"
  on public.treatments
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admins can update treatments" on public.treatments;
create policy "admins can update treatments"
  on public.treatments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can delete treatments" on public.treatments;
create policy "admins can delete treatments"
  on public.treatments
  for delete
  to authenticated
  using (public.is_admin());

-- Explicit table-level grant — see the matching comment on public.doctors
-- above for why this is required in addition to the RLS policies.
grant select, insert, update, delete on public.treatments to authenticated;

-- Seed with the existing ADMIN_TREATMENT_OPTIONS list (src/types/admin.ts)
-- so the dashboard starts out with the real current option list.
insert into public.treatments (name, sort_order)
select v.name, v.sort_order
from (
  values
    ('Root Canal Treatment', 1),
    ('Dental Crowns', 2),
    ('Dental Fillings', 3),
    ('Crowns and Bridges', 4),
    ('Teeth Cleaning', 5),
    ('Tooth Extraction', 6),
    ('Wisdom Teeth Extraction', 7),
    ('Dentures', 8),
    ('Dental Implants', 9),
    ('Braces', 10),
    ('Aligners', 11),
    ('Kids Dentistry', 12),
    ('Laser Dentistry', 13),
    ('Mouth Ulcers', 14),
    ('Advanced Gum Treatment', 15),
    ('Other / Not sure', 16)
) as v(name, sort_order)
on conflict (name) do nothing;

-- ============================================================================
-- 3. "no_show" appointment status
-- ============================================================================
-- The original inline `check (status in (...))` in admin_dashboard.sql was
-- left unnamed, so Postgres auto-named it using its default convention:
-- "<table>_<column>_check". Dropped and recreated here with one more
-- allowed value. No existing appointment row is touched — every row's
-- current status value (pending/confirmed/completed/cancelled) already
-- satisfies the new, wider constraint.
alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
  check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'));

-- No new column is needed to track "No Show" — it is stored as
-- appointments.status = 'no_show', exactly like every other status, and
-- persists across refreshes the same way any other status change does.
-- The app only ever sets it through an explicit "Mark No Show" admin
-- action on a CONFIRMED appointment whose scheduled date & time have
-- already passed — never automatically.
