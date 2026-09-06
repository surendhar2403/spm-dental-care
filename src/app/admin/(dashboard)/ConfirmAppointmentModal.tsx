"use client";

import { useEffect, useState } from "react";
import type { Appointment } from "@/types/admin";
import { buildConfirmationMessage } from "./appointmentDisplay";

interface ConfirmAppointmentModalProps {
  appointment: Appointment;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: (date: string, time: string, message: string) => void;
}

/**
 * Normalizes `preferred_time` (which may be "HH:MM", "HH:MM:SS", or null —
 * patients no longer choose a time on the public form) down to "HH:MM" for
 * the native <input type="time">, which rejects seconds unless step="1" is
 * set. Never round-trips through a Date object, matching the plain-string
 * date/time convention used across the admin dashboard.
 */
function toTimeInputValue(time: string | null): string {
  return time ? time.slice(0, 5) : "";
}

/**
 * Selecting "Confirmed" opens this modal directly — no separate
 * "Confirm Appointment?" step first. Admin sets/checks the final date and
 * time (pre-filled from the patient's preferred date/time), reviews or
 * edits the auto-generated WhatsApp message, then confirms. WhatsApp itself
 * is never opened from here — that's a separate, explicit action the admin
 * takes afterward (see the "Send WhatsApp Confirmation" action in
 * page.tsx / AppointmentsTable / AppointmentDetailsModal).
 */
export default function ConfirmAppointmentModal({
  appointment,
  isSaving,
  onCancel,
  onConfirm,
}: ConfirmAppointmentModalProps) {
  const [date, setDate] = useState(appointment.preferred_date);
  const [time, setTime] = useState(toTimeInputValue(appointment.preferred_time));
  const [message, setMessage] = useState(() =>
    buildConfirmationMessage(
      appointment.patient_name,
      appointment.preferred_date,
      toTimeInputValue(appointment.preferred_time) || null,
    ),
  );
  // Once the admin types their own edit into the message box, stop
  // overwriting it on every date/time change — their edit wins from then
  // on. Until then, the message stays in sync with date/time automatically.
  const [isMessageEdited, setIsMessageEdited] = useState(false);

  const canConfirm = Boolean(date) && Boolean(time);

  useEffect(() => {
    if (isMessageEdited || !canConfirm) return;
    setMessage(buildConfirmationMessage(appointment.patient_name, date, time));
  }, [date, time, canConfirm, isMessageEdited, appointment.patient_name]);

  function handleConfirmClick() {
    if (!canConfirm || isSaving) return;
    onConfirm(date, time, message.trim());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-appointment-heading"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8"
    >
      <div className="w-full max-w-md rounded-card border border-line bg-canvas p-4 sm:p-6">
        <h2 id="confirm-appointment-heading" className="font-display text-lg text-ink">
          Confirm Appointment Date &amp; Time
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          {appointment.patient_name} · {appointment.phone} · {appointment.treatment}
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Date</span>
            <input
              type="date"
              value={date}
              disabled={isSaving}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Time</span>
            <input
              type="time"
              value={time}
              disabled={isSaving}
              onChange={(event) => setTime(event.target.value)}
              className="rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">WhatsApp message</span>
            <textarea
              value={message}
              disabled={isSaving}
              rows={3}
              onChange={(event) => {
                setIsMessageEdited(true);
                setMessage(event.target.value);
              }}
              className="rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="text-xs text-ink/50">
              Auto-filled from the date and time above — edit if you&apos;d like to change the
              wording. Nothing is sent automatically; you&apos;ll send it manually afterward.
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={!canConfirm || isSaving}
            className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Confirming…" : "Confirm Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
