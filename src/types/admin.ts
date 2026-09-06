/**
 * Types for the admin dashboard. Kept in their own file, separate from
 * src/types/index.ts (public site types), so admin work never touches
 * shared public-site type definitions.
 */

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

/** Row shape of public.appointments, as read by the admin dashboard. */
export interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  treatment: string;
  preferred_date: string; // ISO date, e.g. "2026-08-31"
  /**
   * "HH:MM[:SS]", or null. Patients no longer choose a preferred time on the
   * public form, so new "pending" requests have preferred_time = null until
   * the admin sets the final date & time when confirming the appointment.
   * Older rows created before this change may still have a value here.
   */
  preferred_time: string | null;
  message: string | null;
  status: AppointmentStatus;
  created_at: string; // ISO timestamp
  /** NULL = active. Set = archived ("Recently Deleted / Bin"). Independent of `status`. */
  archived_at: string | null;
}

/**
 * Fixed option list for the admin dashboard's inline "edit treatment"
 * dropdown. Deliberately separate from the public-site TREATMENTS list in
 * src/lib/constants.ts (different wording/grouping there) — this is the
 * exact set the admin dashboard must offer, per product spec.
 */
export const ADMIN_TREATMENT_OPTIONS: string[] = [
  "Root Canal Treatment",
  "Dental Crowns",
  "Dental Fillings",
  "Crowns and Bridges",
  "Teeth Cleaning",
  "Tooth Extraction",
  "Wisdom Teeth Extraction",
  "Dentures",
  "Dental Implants",
  "Braces",
  "Aligners",
  "Kids Dentistry",
  "Laser Dentistry",
  "Mouth Ulcers",
  "Advanced Gum Treatment",
  "Other / Not sure",
];
