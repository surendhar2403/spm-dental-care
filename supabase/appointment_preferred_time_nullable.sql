-- Appointment workflow update: patients no longer choose a preferred time
-- on the public form (only a preferred date). The admin now sets the final
-- date AND time when confirming an appointment.
--
-- This is a NON-DESTRUCTIVE, additive change:
--   - The `preferred_time` column is NOT dropped.
--   - No existing rows/data are modified or deleted.
--   - It only relaxes the NOT NULL constraint so new "pending" requests
--     (which no longer carry a patient-chosen time) can be inserted with
--     preferred_time = NULL until the admin sets it on confirmation.
--
-- Safe to run multiple times.
alter table public.appointments
  alter column preferred_time drop not null;
