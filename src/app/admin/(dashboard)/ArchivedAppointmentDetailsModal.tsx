"use client";

import { buildWhatsAppUrl } from "@/lib/utils";
import type { Appointment } from "@/types/admin";
import { STATUS_STYLES, formatCreatedAt, formatDate, formatTime } from "./appointmentDisplay";

interface ArchivedAppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

/**
 * Read-only "View" for an archived appointment (opened from BinModal).
 * Deliberately has no status/treatment editing — while archived, the only
 * writes allowed are Restore and Delete Permanently (see page.tsx), so this
 * modal only displays the record.
 */
export default function ArchivedAppointmentDetailsModal({
  appointment,
  onClose,
}: ArchivedAppointmentDetailsModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archived-appointment-details-heading"
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-card border border-line bg-canvas p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="archived-appointment-details-heading" className="font-display text-lg text-ink">
            Archived Appointment
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink/50 transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        <dl className="mt-2 divide-y divide-line">
          <DetailRow label="Patient Name">{appointment.patient_name}</DetailRow>
          <DetailRow label="Phone">{appointment.phone}</DetailRow>
          <DetailRow label="Treatment">{appointment.treatment}</DetailRow>
          <DetailRow label="Preferred Date">{formatDate(appointment.preferred_date)}</DetailRow>
          <DetailRow label="Preferred Time">{formatTime(appointment.preferred_time)}</DetailRow>
          <DetailRow label="Message">
            {appointment.message ? appointment.message : <span className="text-ink/40">—</span>}
          </DetailRow>
          <DetailRow label="Status">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${STATUS_STYLES[appointment.status]}`}
            >
              {appointment.status}
            </span>
          </DetailRow>
          <DetailRow label="Requested">{formatCreatedAt(appointment.created_at)}</DetailRow>
          <DetailRow label="Archived Date">
            {appointment.archived_at ? formatCreatedAt(appointment.archived_at) : "—"}
          </DetailRow>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <a
            href={buildWhatsAppUrl(appointment.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            WhatsApp
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
