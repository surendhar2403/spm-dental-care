/**
 * Types for the admin dashboard. Kept in their own file, separate from
 * src/types/index.ts (public site types), so admin work never touches
 * shared public-site type definitions.
 */

/**
 * "no_show" is a real, persistable status (see
 * supabase/admin_doctors_treatments_noshow.sql for the DB check
 * constraint), but it is deliberately NOT part of APPOINTMENT_STATUSES
 * below — it must never be a free choice in the everyday status dropdown.
 * It is never surfaced as a selectable value or a manual action anywhere
 * in this UI — there is no "Mark No Show" button. The only related UI is
 * the automatic, read-only MissedAppointmentAlert (see
 * MissedAppointmentAlert.tsx), shown once a CONFIRMED appointment's date
 * & time have passed. See appointmentDisplay.ts's isConfirmedAppointmentPast().
 */
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

/** Options for the normal, always-available status <select>. */
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

/**
 * Row shape of public.doctors (admin-managed "Doctors" list). Originally
 * seeded from the site's old hardcoded DENTAL_SPECIALISTS constant — see
 * supabase/admin_doctors_treatments_noshow.sql — the admin dashboard is
 * the source of truth going forward, and the public site's "Our Dental
 * Specialists" section (src/components/sections/Dentist.tsx) now reads
 * this same table live instead of that constant.
 */
export interface Doctor {
  id: string;
  name: string;
  credentials: string | null;
  specialty: string | null;
  description: string | null;
  experience: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

/**
 * Row shape of public.treatments (admin-managed "Treatments" list). Seeded
 * from ADMIN_TREATMENT_OPTIONS above. The admin dashboard's inline
 * treatment editor and "+ New Appointment" form read from this table (via
 * page.tsx) instead of the hardcoded list once it has loaded — see
 * ADMIN_TREATMENT_OPTIONS's role as a fallback in page.tsx.
 */
export interface AdminTreatment {
  id: string;
  name: string;
  price: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

/** Row shape for admin-managed testimonials/patient reviews (public.testimonials). */
export interface AdminTestimonial {
  id: string;
  patient_name: string;
  review_text: string;
  rating: number;
  source: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string | null;
}
