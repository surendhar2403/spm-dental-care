"use client";

import { buildWhatsAppUrl, openWhatsAppConfirmation } from "@/lib/utils";
import {
  ADMIN_TREATMENT_OPTIONS,
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentStatus,
} from "@/types/admin";
import {
  buildConfirmationMessage,
  formatCreatedAt,
  formatDate,
  formatTime,
  STATUS_STYLES,
} from "./appointmentDisplay";

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  isBusy: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  editingTreatmentId: string | null;
  treatmentDraft: string;
  onEditTreatmentStart: (appointment: Appointment) => void;
  onEditTreatmentCancel: () => void;
  onTreatmentDraftChange: (value: string) => void;
  onEditTreatmentSave: (id: string) => void;
  busyId: string | null;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export default function AppointmentDetailsModal({
  appointment,
  isBusy,
  onClose,
  onStatusChange,
  editingTreatmentId,
  treatmentDraft,
  onEditTreatmentStart,
  onEditTreatmentCancel,
  onTreatmentDraftChange,
  onEditTreatmentSave,
  busyId,
}: AppointmentDetailsModalProps) {
  const isEditingTreatment = editingTreatmentId === appointment.id;
  const editDisabled =
    busyId !== null || (editingTreatmentId !== null && editingTreatmentId !== appointment.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-details-heading"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-card border border-line bg-canvas p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="appointment-details-heading" className="font-display text-lg text-ink">
            Appointment Details
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
          <DetailRow label="Treatment">
            {isEditingTreatment ? (
              <div className="flex flex-col gap-2">
                <select
                  value={treatmentDraft}
                  disabled={isBusy}
                  onChange={(event) => onTreatmentDraftChange(event.target.value)}
                  className="rounded-lg border border-line bg-canvas px-2 py-1.5 text-sm text-ink focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {(ADMIN_TREATMENT_OPTIONS.includes(appointment.treatment)
                    ? ADMIN_TREATMENT_OPTIONS
                    : [appointment.treatment, ...ADMIN_TREATMENT_OPTIONS]
                  ).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditTreatmentSave(appointment.id)}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center rounded-full bg-blue-900 px-3 py-1.5 text-xs font-semibold text-canvas transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isBusy ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={onEditTreatmentCancel}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              appointment.treatment
            )}
          </DetailRow>
          <DetailRow label="Preferred Date">{formatDate(appointment.preferred_date)}</DetailRow>
          <DetailRow label="Preferred Time">{formatTime(appointment.preferred_time)}</DetailRow>
          <DetailRow label="Message">
            {appointment.message ? appointment.message : <span className="text-ink/40">—</span>}
          </DetailRow>
          <DetailRow label="Status">
            <select
              value={appointment.status}
              disabled={isBusy}
              onChange={(event) =>
                onStatusChange(appointment.id, event.target.value as AppointmentStatus)
              }
              className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_STYLES[appointment.status]}`}
            >
              {APPOINTMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </DetailRow>
          <DetailRow label="Requested">{formatCreatedAt(appointment.created_at)}</DetailRow>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {!isEditingTreatment ? (
            <button
              type="button"
              onClick={() => onEditTreatmentStart(appointment)}
              disabled={editDisabled}
              className="inline-flex items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60 sm:order-1"
            >
              Edit
            </button>
          ) : null}
          {appointment.status === "confirmed" ? (
            <button
              type="button"
              onClick={() => {
                const message = buildConfirmationMessage(
                  appointment.patient_name,
                  appointment.preferred_date,
                  appointment.preferred_time,
                );
                const opened = openWhatsAppConfirmation(appointment.phone, message);
                if (!opened) {
                  window.alert(
                    "WhatsApp could not be opened for this number. Please contact the patient manually.",
                  );
                }
              }}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:order-2"
            >
              Send WhatsApp Confirmation
            </button>
          ) : (
            <a
              href={buildWhatsAppUrl(appointment.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 sm:order-2"
            >
              WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800 sm:order-3"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
