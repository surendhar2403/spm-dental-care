/**
 * Shared display helpers for appointment rows/cards across the admin
 * dashboard (table, Today's Appointments, details modal). Centralized so
 * date/time/status formatting stays identical everywhere it's shown.
 */

import type { Appointment, AppointmentStatus } from "@/types/admin";

export const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "border border-amber-200/80 bg-amber-100 text-amber-700",
  confirmed: "border border-blue-200/80 bg-blue-100 text-blue-700",
  completed: "border border-emerald-200/80 bg-emerald-100 text-emerald-700",
  cancelled: "border border-red-200/80 bg-red-100 text-red-700",
  no_show: "border border-rose-200/80 bg-rose-100 text-rose-700",
};

/**
 * Human-readable status label. Needed because "no_show" isn't a single
 * capitalizable word — a plain CSS `capitalize` class would render it as
 * "No_show" instead of "No Show".
 */
export function formatStatusLabel(status: AppointmentStatus): string {
  if (status === "no_show") return "No Show";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * A CONFIRMED appointment is "past due" once its scheduled date AND time
 * have passed. Drives the automatic, read-only MissedAppointmentAlert
 * (see MissedAppointmentAlert.tsx) — it never changes appointment.status
 * and there is no manual "Mark No Show" action anywhere in this UI.
 * Pending/completed/cancelled/no_show appointments are never eligible.
 */
export function isConfirmedAppointmentPast(
  appointment: Pick<Appointment, "status" | "preferred_date" | "preferred_time">,
): boolean {
  if (appointment.status !== "confirmed" || !appointment.preferred_time) return false;
  const scheduled = new Date(`${appointment.preferred_date}T${appointment.preferred_time}`);
  if (Number.isNaN(scheduled.getTime())) return false;
  return scheduled.getTime() < Date.now();
}

export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * `time` is null for pending requests submitted since patients stopped
 * choosing a preferred time — the admin hasn't set a final time yet.
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return "Not set yet";
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function formatCreatedAtDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })},`;
}

export function formatCreatedAtTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCreatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Builds the default WhatsApp confirmation message text, e.g.:
 * "Hi Jane, your appointment at SPM Dental Care is confirmed for 26 Sep
 * 2026 at 1:23 am."
 *
 * Shared by the confirmation modal's auto-filled preview and the
 * "Send WhatsApp Confirmation" action shown for any confirmed appointment
 * (just-confirmed or opened later), so both always agree on the wording.
 */
export function buildConfirmationMessage(
  patientName: string,
  preferredDate: string,
  preferredTime: string | null,
): string {
  return `Hi ${patientName}, your appointment at SPM Dental Care is confirmed for ${formatDate(preferredDate)} at ${formatTime(preferredTime)}.`;
}
