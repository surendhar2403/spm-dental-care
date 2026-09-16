"use client";

import { useState } from "react";
import type { Doctor } from "@/types/admin";

export interface NewDoctorValues {
  name: string;
  credentials: string;
  specialty: string;
  description: string;
  experience: number;
}

interface ManageDoctorsModalProps {
  doctors: Doctor[];
  isLoading: boolean;
  loadError: boolean;
  /** The actual Supabase error message (e.g. "relation ... does not exist",
   * "permission denied for table doctors"). Shown as-is so the real cause
   * is visible instead of a generic message. Null when unknown/not loaded. */
  loadErrorMessage?: string | null;
  busyId: string | null;
  isSaving: boolean;
  onClose: () => void;
  onAdd: (values: NewDoctorValues) => void;
  onRemove: (doctor: Doctor) => void;
  onRetry?: () => void;
}

const inputClasses =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Admin dashboard modal for managing public.doctors — the list behind the
 * public site's "Our Dental Specialists" section (see
 * src/components/sections/Dentist.tsx, which reads this same table live).
 * Deleting a doctor here never runs a SQL DELETE — it sets is_active = false, which
 * page.tsx's fetch already filters out. Nothing else in the app
 * references doctors by id, so no historical data can be affected.
 */
export default function ManageDoctorsModal({
  doctors,
  isLoading,
  loadError,
  loadErrorMessage,
  busyId,
  isSaving,
  onClose,
  onAdd,
  onRemove,
  onRetry,
}: ManageDoctorsModalProps) {
  const [name, setName] = useState("");
  const [credentials, setCredentials] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    if (!name.trim()) {
      setFormError("Please enter the doctor's name.");
      return;
    }

    const parsedExperience = Number.parseInt(experience, 10);
    if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
      setFormError("Please enter a valid experience in years (0 or more).");
      return;
    }

    setFormError(null);
    onAdd({
      name: name.trim(),
      credentials: credentials.trim(),
      specialty: specialty.trim(),
      description: description.trim(),
      experience: parsedExperience,
    });
    setName("");
    setCredentials("");
    setSpecialty("");
    setDescription("");
    setExperience("0");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-doctors-heading"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-card border border-line bg-canvas p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="manage-doctors-heading" className="font-display text-lg text-ink">
              Manage Doctors
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              Add or remove the dentists listed on the clinic&apos;s doctor roster.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex-none text-ink/50 transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 grid grid-cols-1 gap-3 rounded-card border border-line bg-canvas-soft p-4 sm:grid-cols-2"
        >
          <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-ink">Name *</span>
            <input
              type="text"
              value={name}
              disabled={isSaving}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Dr Jane Doe"
              className={inputClasses}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Credentials</span>
            <input
              type="text"
              value={credentials}
              disabled={isSaving}
              onChange={(event) => setCredentials(event.target.value)}
              placeholder="e.g. MDS"
              className={inputClasses}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Specialty</span>
            <input
              type="text"
              value={specialty}
              disabled={isSaving}
              onChange={(event) => setSpecialty(event.target.value)}
              placeholder="e.g. Orthodontics"
              className={inputClasses}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Experience (years)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={experience}
              disabled={isSaving}
              onChange={(event) => setExperience(event.target.value)}
              placeholder="e.g. 8"
              className={inputClasses}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Description</span>
            <input
              type="text"
              value={description}
              disabled={isSaving}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short one-line description"
              className={inputClasses}
            />
          </label>
          {formError ? <p className="text-xs text-red-600 sm:col-span-2">{formError}</p> : null}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Adding…" : "+ Add Doctor"}
            </button>
          </div>
        </form>

        <div className="mt-4">
          {isLoading ? (
            <div className="rounded-card border border-line bg-canvas-soft p-6 text-center text-sm text-ink/60">
              Loading doctors…
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-canvas-soft p-6 text-center">
              <p className="text-sm text-red-600">
                Couldn&apos;t load doctors right now.
                {loadErrorMessage ? (
                  <span className="mt-1 block font-mono text-xs text-red-500">
                    {loadErrorMessage}
                  </span>
                ) : null}
              </p>
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center justify-center rounded-full bg-blue-900 px-4 py-1.5 text-xs font-semibold text-canvas transition-colors hover:bg-blue-800"
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : doctors.length === 0 ? (
            <div className="rounded-card border border-line bg-canvas-soft p-6 text-center text-sm text-ink/60">
              No doctors added yet.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {doctors.map((doctor) => {
                const isBusy = busyId === doctor.id;
                const isConfirming = confirmingId === doctor.id;
                const subtitle = [doctor.credentials, doctor.specialty]
                  .filter((value) => Boolean(value && value.trim()))
                  .join(" • ");
                const experienceText = doctor.experience != null ? `${doctor.experience} yrs experience` : "Experience not set";

                return (
                  <li
                    key={doctor.id}
                    className="flex flex-col gap-2 rounded-card border border-line bg-canvas p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{doctor.name}</p>
                      <p className="truncate text-xs text-ink/60">{subtitle || "—"}</p>
                      <p className="truncate text-xs text-ink/60">{experienceText}</p>
                    </div>
                    {isConfirming ? (
                      <div className="flex flex-none flex-wrap items-center gap-2">
                        <span className="text-xs text-ink/70">Remove this doctor?</span>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            onRemove(doctor);
                            setConfirmingId(null);
                          }}
                          className="inline-flex items-center justify-center rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy ? "Removing…" : "Yes, remove"}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setConfirmingId(null)}
                          className="inline-flex items-center justify-center rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(doctor.id)}
                        disabled={busyId !== null}
                        className="flex-none text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-ink/40 disabled:no-underline"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 flex justify-end">
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
