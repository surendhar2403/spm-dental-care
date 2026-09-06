-- SPM Dental Care — Admin: manual appointment creation + archive (soft delete)
-- Run this once in the Supabase SQL Editor, AFTER supabase/admin_dashboard.sql
-- has already been run. Safe to re-run: every statement is idempotent
-- (IF NOT EXISTS / DROP POLICY IF EXISTS / CREATE OR REPLACE).
--
-- What this does:
--   1. Adds an `archived_at` column to public.appointments — the single
--      source of truth for the "Recently Deleted / Bin" feature. A row is
--      archived when archived_at is NOT NULL, and active when it IS NULL.
--      No appointment.status value is added, removed, or renamed, and the
--      existing `status` check constraint (pending/confirmed/completed/
--      cancelled) is untouched — archiving is deliberately orthogonal to
--      status, exactly as it was before archiving existed.
--   2. Adds an index to keep "only show non-archived appointments" queries
--      fast as the table grows.
--
-- No new table is created. No existing RLS policy is changed: the admin
-- dashboard already has UPDATE and DELETE policies (gated by is_admin())
-- from supabase/admin_dashboard.sql, and those are exactly what archive
-- (UPDATE), restore (UPDATE), and permanent delete (DELETE) each need —
-- see supabase/admin_dashboard.sql for the policy definitions. The public
-- "insert appointments" policy is untouched, so booking from the website
-- keeps working exactly as before.
--
-- Manually created appointments (the "+ New Appointment" admin feature)
-- are inserted into this same public.appointments table through the same
-- admin UPDATE/SELECT-gated client — no new column was needed for that
-- feature, since the table doesn't currently track a booking "source" and
-- the task spec says not to add one unless required.

-- ============================================================================
-- 1. archived_at column
-- ============================================================================
alter table public.appointments
  add column if not exists archived_at timestamptz;

comment on column public.appointments.archived_at is
  'NULL = active (shown in the normal appointment list). Set to the '
  'timestamp an admin archived it = shown only in Recently Deleted / Bin. '
  'Independent of `status` — archiving/restoring never changes status.';

-- ============================================================================
-- 2. Index for "only non-archived" list queries
-- ============================================================================
create index if not exists appointments_archived_at_idx
  on public.appointments (archived_at);
