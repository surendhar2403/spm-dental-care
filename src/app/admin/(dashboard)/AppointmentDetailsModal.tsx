"use client";

import { useEffect, useState } from "react";
import { buildWhatsAppUrl, openWhatsAppConfirmation } from "@/lib/utils";
import {
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentStatus,
} from "@/types/admin";
import {
  buildConfirmationMessage,
  formatCreatedAt,
  formatDate,
  formatTime,
  isConfirmedAppointmentPast,
  STATUS_STYLES,
} from "./appointmentDisplay";
import MissedAppointmentAlert from "./MissedAppointmentAlert";

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  isBusy: boolean;
  busyId: string | null;
  treatmentOptions: string[];
  onClose: () => void;
  onStatusChange: (id: string, status: AppointmentStatus) => Promise<boolean> | boolean;
  onPreferredDateTimeUpdate: (
    id: string,
    preferredDate: string,
    preferredTime: string | null,
  ) => Promise<boolean>;
  editingTreatmentId: string | null;
  treatmentDraft: string;
  onEditTreatmentStart: (appointment: Appointment) => void;
  onEditTreatmentCancel: () => void;
  onTreatmentDraftChange: (value: string) => void;
  onEditTreatmentSave: (id: string) => void;
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
  onPreferredDateTimeUpdate,
  treatmentOptions,
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
  const isNoShow = appointment.status === "no_show";

  const [isEditingAppointmentDate, setIsEditingAppointmentDate] = useState(false);
  const [draftDate, setDraftDate] = useState(appointment.preferred_date);
  const [draftTime, setDraftTime] = useState(appointment.preferred_time ?? "");
  const [appointmentDateError, setAppointmentDateError] = useState<string | null>(null);

  useEffect(() => {
    setDraftDate(appointment.preferred_date);
    setDraftTime(appointment.preferred_time ?? "");
    setAppointmentDateError(null);
    if (!isEditingAppointmentDate) {
      setIsEditingAppointmentDate(false);
    }
  }, [appointment.id, appointment.preferred_date, appointment.preferred_time]);

  const appointmentDateValue =
    appointment.preferred_time && appointment.preferred_time.trim().length > 0
      ? `${formatDate(appointment.preferred_date)}, ${formatTime(appointment.preferred_time)}`
      : formatDate(appointment.preferred_date);

  async function handleAppointmentDateSave() {
    if (!draftDate) {
      setAppointmentDateError("Please choose a valid date.");
      return;
    }

    const saved = await onPreferredDateTimeUpdate(
      appointment.id,
      draftDate,
      draftTime.trim().length > 0 ? draftTime : null,
    );

    if (saved) {
      setAppointmentDateError(null);
      setIsEditingAppointmentDate(false);
      return;
    }

    setAppointmentDateError("Could not update the appointment date and time.");
  }

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
                  {(treatmentOptions.includes(appointment.treatment)
                    ? treatmentOptions
                    : [appointment.treatment, ...treatmentOptions]
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
              <button
                type="button"
                onClick={() => onEditTreatmentStart(appointment)}
                disabled={editDisabled}
                title="Click to change treatment"
                className="-mx-1 rounded px-1 text-left transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
              >
                {appointment.treatment}
              </button>
            )}
          </DetailRow>
          <DetailRow label="Appointment Date">
            {isEditingAppointmentDate ? (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  type="date"
                  value={draftDate}
                  disabled={isBusy}
                  onChange={(event) => {
                    setDraftDate(event.target.value);
                    setAppointmentDateError(null);
                  }}
                  className="w-full rounded-lg border border-line bg-canvas px-2 py-1.5 text-sm text-ink focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <input
                  type="time"
                  value={draftTime}
                  disabled={isBusy}
                  onChange={(event) => {
                    setDraftTime(event.target.value);
                    setAppointmentDateError(null);
                  }}
                  className="w-full rounded-lg border border-line bg-canvas px-2 py-1.5 text-sm text-ink focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAppointmentDateSave}
                    disabled={isBusy || !draftDate}
                    className="inline-flex items-center justify-center rounded-full bg-blue-900 px-3 py-1.5 text-xs font-semibold text-canvas transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isBusy ? "Saving…" : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftDate(appointment.preferred_date);
                      setDraftTime(appointment.preferred_time ?? "");
                      setAppointmentDateError(null);
                      setIsEditingAppointmentDate(false);
                    }}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
                {appointmentDateError ? (
                  <p className="text-[10px] text-red-600">{appointmentDateError}</p>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraftDate(appointment.preferred_date);
                  setDraftTime(appointment.preferred_time ?? "");
                  setAppointmentDateError(null);
                  setIsEditingAppointmentDate(true);
                }}
                disabled={editDisabled}
                title="Edit appointment date and time"
                className="inline-flex max-w-full items-center rounded px-1 text-left transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
              >
                <span className="whitespace-normal text-left sm:whitespace-nowrap">
                  {appointmentDateValue}
                </span>
              </button>
            )}
          </DetailRow>
          <DetailRow label="Message">
            {appointment.message ? appointment.message : <span className="text-ink/40">—</span>}
          </DetailRow>
          <DetailRow label="Status">
            {isNoShow ? (
              <div className="flex flex-col items-start gap-1.5">
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                  🔴 No Show
                </span>
                <select
                  value=""
                  disabled={isBusy}
                  onChange={(event) => {
                    if (event.target.value) {
                      onStatusChange(appointment.id, event.target.value as AppointmentStatus);
                    }
                  }}
                  className="rounded-full border border-line bg-canvas px-2 py-1 text-xs text-ink/60 focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Change status…</option>
                  {APPOINTMENT_STATUSES.map((status) => (
                    <option key={status} value={status} className="capitalize">
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-1.5">
                <select
                  value={appointment.status}
                  disabled={isBusy}
                  onChange={async (event) => {
                    const nextStatus = event.target.value as AppointmentStatus;
                    const saved = await onStatusChange(appointment.id, nextStatus);

                    if (saved && nextStatus === "confirmed" && appointment.status !== "confirmed") {
                      onClose();
                    }
                  }}
                  className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_STYLES[appointment.status]}`}
                >
                  {APPOINTMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {isConfirmedAppointmentPast(appointment) ? (
                  <MissedAppointmentAlert className="max-w-xs" />
                ) : null}
              </div>
            )}
          </DetailRow>
          <DetailRow label="Requested">{formatCreatedAt(appointment.created_at)}</DetailRow>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
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
