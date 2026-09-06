"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { CONTACT, TREATMENTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import {
  isValidIndianMobile,
  normalizeIndianMobile,
  openWhatsAppConfirmation,
} from "@/lib/utils";

interface FormValues {
  name: string;
  phone: string;
  treatment: string;
  preferredDate: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

type SubmissionState = "idle" | "submitting" | "error";

const INITIAL_VALUES: FormValues = {
  name: "",
  phone: "",
  treatment: "",
  preferredDate: "",
  message: "",
};

// Shown when the Supabase insert fails. Deliberately generic — never
// surfaces database errors, API keys, or other technical detail to the user.
const GENERIC_SUBMIT_ERROR =
  "Sorry, we couldn't send your appointment request right now. Please try again, or contact us directly by phone or WhatsApp.";

/**
 * Formats an ISO "YYYY-MM-DD" date for display in the WhatsApp booking
 * message (e.g. "7 Sep 2026"). Mirrors the admin dashboard's date display
 * convention (see appointmentDisplay.ts) without importing across the
 * admin/public boundary, since this is just presentation formatting.
 */
function formatDateForMessage(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Builds the WhatsApp message the patient sends to the CLINIC's own WhatsApp
 * number (CONTACT.whatsapp) right after their request is saved — this is a
 * copy of the booking details for the clinic's record, not a confirmation
 * (the appointment stays "pending" until the admin confirms it separately).
 */
function buildBookingWhatsAppMessage(values: FormValues, normalizedPhone: string): string {
  const lines = [
    "Hi SPM Dental Care, I would like to book an appointment.",
    "",
    `Patient Name: ${values.name.trim()}`,
    `Phone: ${normalizedPhone}`,
    `Treatment: ${values.treatment}`,
    `Preferred Date: ${formatDateForMessage(values.preferredDate)}`,
  ];

  if (values.message.trim()) {
    lines.push(`Message: ${values.message.trim()}`);
  }

  return lines.join("\n");
}

interface AppointmentFormProps {
  /** id on the root <form>/success container. Must be unique on the page. */
  formId?: string;
  /** id on the heading, referenced by aria-labelledby on the root. */
  headingId?: string;
  /**
   * Prepended to every field's id/htmlFor/aria-describedby so this form can
   * be rendered more than once on the same page (e.g. inline in a section
   * and again inside the Book Appointment modal) without clashing ids.
   */
  idPrefix?: string;
}

/**
 * Appointment request form. On submit it validates the fields, then inserts
 * a "pending" row into public.appointments in Supabase (anon insert-only,
 * per that table's RLS policy). Patients only choose a preferred DATE here —
 * not a time; the admin sets the final date and time when confirming the
 * request in the dashboard. This is a request, not a confirmed booking.
 * If the insert fails, a generic, user-friendly error is shown instead.
 */
export default function AppointmentForm({
  formId = "appointment-form",
  headingId = "appointment-form-heading",
  idPrefix = "",
}: AppointmentFormProps = {}) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Whether the click-to-chat WhatsApp tab opened successfully after the
  // request was saved. The appointment is saved either way — this only
  // controls whether we show a "please message us on WhatsApp yourself"
  // fallback note in the success state below.
  const [whatsappOpened, setWhatsappOpened] = useState(true);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear that field's error as soon as the user starts correcting it.
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(current: FormValues): FormErrors {
    const nextErrors: FormErrors = {};

    if (!current.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!current.phone.trim()) {
      nextErrors.phone = "Please enter your phone number.";
    } else if (!isValidIndianMobile(current.phone)) {
      nextErrors.phone = "Please enter a valid Indian mobile number.";
    }

    if (!current.treatment) {
      nextErrors.treatment = "Please select a treatment or reason for visit.";
    }

    if (!current.preferredDate) {
      nextErrors.preferredDate = "Please choose a preferred date.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const normalizedPhone = normalizeIndianMobile(values.phone) ?? values.phone;

    setSubmissionState("submitting");

    // Uses the same browser Supabase client the admin login already uses
    // successfully (src/lib/supabase/client.ts), instead of a second,
    // separately-configured client. createClient() throws if the env vars
    // are genuinely missing, which we treat as a submission error below —
    // there's no need for a separate "is configured" pre-check that can
    // itself go stale or disagree with the real client.
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch (configError) {
      // eslint-disable-next-line no-console
      console.error("[appointment form] Supabase client could not be created:", configError);
      setSubmissionState("error");
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      patient_name: values.name.trim(),
      phone: normalizedPhone,
      treatment: values.treatment,
      preferred_date: values.preferredDate,
      // preferred_time intentionally omitted — patients no longer choose a
      // time; it stays null until the admin sets the final time on confirm.
      message: values.message.trim() || null,
      // status is left unset so the table's "pending" default applies.
    });

    if (error) {
      // Full error detail goes to the console for debugging; only the
      // clean, friendly message is ever shown to the patient.
      // eslint-disable-next-line no-console
      console.error("[appointment form] insert failed:", error);
      setSubmissionState("error");
      return;
    }

    setSubmissionState("idle");
    setIsSubmitted(true);
    setErrors({});

    // The appointment is already saved as "pending" at this point no matter
    // what happens next — opening WhatsApp to the CLINIC's own number is a
    // best-effort follow-up so the clinic gets an immediate WhatsApp copy of
    // the request, never a condition for the booking itself. Called
    // synchronously within this same click handler (no setTimeout/await
    // gap after this) so it isn't treated as a blocked popup by the browser.
    const message = buildBookingWhatsAppMessage(values, normalizedPhone);
    const opened = openWhatsAppConfirmation(CONTACT.whatsapp, message);
    setWhatsappOpened(opened);

    setValues(INITIAL_VALUES);
  }

  function handleBookAnother() {
    setIsSubmitted(false);
    setSubmissionState("idle");
    setWhatsappOpened(true);
  }

  const inputClasses =
    "w-full rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-blue-600 focus:outline-none disabled:opacity-60";
  const inputErrorClasses = "border-red-500 focus:border-red-500";
  const errorTextClasses = "text-sm text-red-600";

  const fieldId = (name: string) => `${idPrefix}${name}`;
  const isSubmitting = submissionState === "submitting";

  if (isSubmitted) {
    return (
      <div
        id={formId}
        role="status"
        className="flex w-full flex-col items-start gap-4 rounded-card border border-line bg-canvas p-6 sm:p-8"
        aria-labelledby={headingId}
      >
        <h3 id={headingId} className="font-display text-xl text-ink">
          Thank you! Your appointment request has been received.
        </h3>
        <p className="text-sm text-ink/60">
          This is a request, not a confirmed booking — we&apos;ll contact you
          shortly to confirm your appointment date and time.
        </p>
        {!whatsappOpened ? (
          <p className="text-sm text-ink/60">
            Your request was submitted, but we couldn&apos;t open WhatsApp
            automatically. Feel free to message us directly on WhatsApp at{" "}
            {CONTACT.whatsapp} to share your booking details.
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleBookAnother}
          className="inline-flex items-center justify-center rounded-full bg-gold-600 px-6 py-3 text-sm font-semibold tracking-wide text-blue-900 transition-colors hover:bg-gold-500"
        >
          Book another appointment
        </button>
      </div>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-5 rounded-card border border-line bg-canvas p-6 sm:p-8"
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className="font-display text-xl text-ink">
        Request an appointment
      </h3>
      <p className="text-sm text-ink/60">
        Choose your preferred date — this is a request, not a confirmed
        booking. We&apos;ll contact you to confirm the exact date and time.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId("name")} className="text-sm font-medium text-ink">
            Patient Name
          </label>
          <input
            id={fieldId("name")}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateField("name", event.target.value)
            }
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? fieldId("name-error") : undefined}
            className={`${inputClasses} ${errors.name ? inputErrorClasses : ""}`}
          />
          {errors.name ? (
            <p id={fieldId("name-error")} className={errorTextClasses}>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId("phone")} className="text-sm font-medium text-ink">
            Phone Number
          </label>
          <input
            id={fieldId("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            value={values.phone}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateField("phone", event.target.value)
            }
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? fieldId("phone-error") : undefined}
            className={`${inputClasses} ${errors.phone ? inputErrorClasses : ""}`}
          />
          {errors.phone ? (
            <p id={fieldId("phone-error")} className={errorTextClasses}>
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={fieldId("treatment")} className="text-sm font-medium text-ink">
            Treatment / Reason for Visit
          </label>
          <select
            id={fieldId("treatment")}
            name="treatment"
            value={values.treatment}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateField("treatment", event.target.value)
            }
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.treatment)}
            aria-describedby={errors.treatment ? fieldId("treatment-error") : undefined}
            className={`${inputClasses} ${errors.treatment ? inputErrorClasses : ""}`}
          >
            <option value="">Select a treatment</option>
            {TREATMENTS.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
            <option value="Other / Not sure">Other / Not sure</option>
          </select>
          {errors.treatment ? (
            <p id={fieldId("treatment-error")} className={errorTextClasses}>
              {errors.treatment}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={fieldId("preferredDate")} className="text-sm font-medium text-ink">
            Preferred Date
          </label>
          <input
            id={fieldId("preferredDate")}
            name="preferredDate"
            type="date"
            value={values.preferredDate}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateField("preferredDate", event.target.value)
            }
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.preferredDate)}
            aria-describedby={
              errors.preferredDate ? fieldId("preferredDate-error") : undefined
            }
            className={`${inputClasses} ${errors.preferredDate ? inputErrorClasses : ""}`}
          />
          {errors.preferredDate ? (
            <p id={fieldId("preferredDate-error")} className={errorTextClasses}>
              {errors.preferredDate}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor={fieldId("message")} className="text-sm font-medium text-ink">
            Message
          </label>
          <textarea
            id={fieldId("message")}
            name="message"
            rows={3}
            value={values.message}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              updateField("message", event.target.value)
            }
            disabled={isSubmitting}
            className={inputClasses}
          />
        </div>
      </div>

      {submissionState === "error" ? (
        <p role="alert" className={errorTextClasses}>
          {GENERIC_SUBMIT_ERROR}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-gold-600 px-6 py-3 text-sm font-semibold tracking-wide text-blue-900 transition-colors hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Confirming…" : "Confirm Appointment"}
      </button>
    </form>
  );
}
