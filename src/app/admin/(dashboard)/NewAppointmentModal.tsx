"use client";

import { useState } from "react";
import { isValidIndianMobile } from "@/lib/utils";
import { ADMIN_TREATMENT_OPTIONS, APPOINTMENT_STATUSES, type AppointmentStatus } from "@/types/admin";

export interface NewAppointmentValues {
  patientName: string;
  phone: string;
  treatment: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: AppointmentStatus;
}

interface NewAppointmentModalProps {
  isSaving: boolean;
  onCancel: () => void;
  onSave: (values: NewAppointmentValues) => void;
}

const initialValues: NewAppointmentValues = {
  patientName: "",
  phone: "",
  treatment: "",
  preferredDate: "",
  preferredTime: "",
  message: "",
  status: "pending",
};

const inputClasses =
  "w-full rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";
const errorTextClasses = "text-xs text-red-600";

/**
 * "+ New Appointment" modal — lets an admin manually record an appointment
 * for a walk-in, phone, WhatsApp, or other offline booking. Saving inserts
 * directly into the existing public.appointments table (see page.tsx's
 * handleCreateAppointment) — this component only collects and validates
 * the form values.
 */
export default function NewAppointmentModal({
  isSaving,
  onCancel,
  onSave,
}: NewAppointmentModalProps) {
  const [values, setValues] = useState<NewAppointmentValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof NewAppointmentValues, string>>>({});

  function updateField<K extends keyof NewAppointmentValues>(field: K, value: NewAppointmentValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof NewAppointmentValues, string>> = {};

    if (!values.patientName.trim()) {
      nextErrors.patientName = "Please enter the patient's name.";
    }
    if (!values.phone.trim()) {
      nextErrors.phone = "Please enter a phone number.";
    } else if (!isValidIndianMobile(values.phone)) {
      nextErrors.phone = "Please enter a valid Indian mobile number.";
    }
    if (!values.treatment) {
      nextErrors.treatment = "Please select a treatment.";
    }
    if (!values.preferredDate) {
      nextErrors.preferredDate = "Please choose a preferred date.";
    }
    if (!values.preferredTime) {
      nextErrors.preferredTime = "Please choose a preferred time.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    if (!validate()) return;
    onSave(values);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-appointment-heading"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8"
    >
      <div className="w-full max-w-lg rounded-card border border-line bg-canvas p-4 sm:p-6">
        <h2 id="new-appointment-heading" className="font-display text-lg text-ink">
          New Appointment
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Manually record a walk-in, phone, WhatsApp, or other offline booking.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Patient Name *</span>
            <input
              type="text"
              value={values.patientName}
              disabled={isSaving}
              onChange={(event) => updateField("patientName", event.target.value)}
              className={inputClasses}
              aria-invalid={Boolean(errors.patientName)}
            />
            {errors.patientName ? <p className={errorTextClasses}>{errors.patientName}</p> : null}
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Phone Number *</span>
            <input
              type="tel"
              value={values.phone}
              disabled={isSaving}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="e.g. 98765 43210"
              className={inputClasses}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone ? <p className={errorTextClasses}>{errors.phone}</p> : null}
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Treatment *</span>
            <select
              value={values.treatment}
              disabled={isSaving}
              onChange={(event) => updateField("treatment", event.target.value)}
              className={inputClasses}
              aria-invalid={Boolean(errors.treatment)}
            >
              <option value="">Select a treatment</option>
              {ADMIN_TREATMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.treatment ? <p className={errorTextClasses}>{errors.treatment}</p> : null}
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Preferred Date *</span>
              <input
                type="date"
                value={values.preferredDate}
                disabled={isSaving}
                onChange={(event) => updateField("preferredDate", event.target.value)}
                className={inputClasses}
                aria-invalid={Boolean(errors.preferredDate)}
              />
              {errors.preferredDate ? <p className={errorTextClasses}>{errors.preferredDate}</p> : null}
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Preferred Time *</span>
              <input
                type="time"
                value={values.preferredTime}
                disabled={isSaving}
                onChange={(event) => updateField("preferredTime", event.target.value)}
                className={inputClasses}
                aria-invalid={Boolean(errors.preferredTime)}
              />
              {errors.preferredTime ? <p className={errorTextClasses}>{errors.preferredTime}</p> : null}
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Message</span>
            <textarea
              value={values.message}
              disabled={isSaving}
              onChange={(event) => updateField("message", event.target.value)}
              rows={3}
              className={inputClasses}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Status</span>
            <select
              value={values.status}
              disabled={isSaving}
              onChange={(event) => updateField("status", event.target.value as AppointmentStatus)}
              className={`${inputClasses} capitalize`}
            >
              {APPOINTMENT_STATUSES.map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status}
                </option>
              ))}
            </select>
            {values.status === "confirmed" ? (
              <p className="text-xs text-ink/60">
                Saving will open the usual confirmation step to review the date &amp; time before
                marking it confirmed.
              </p>
            ) : null}
          </label>

          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving…" : "Save Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
