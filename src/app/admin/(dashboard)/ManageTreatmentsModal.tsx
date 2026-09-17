"use client";

import { useEffect, useState } from "react";
import type { AdminTreatment } from "@/types/admin";

interface ManageTreatmentsModalProps {
  treatments: AdminTreatment[];
  isLoading: boolean;
  loadError: boolean;
  /** The actual Supabase error message, shown as-is so the real cause is
   * visible instead of a generic message. Null when unknown/not loaded. */
  loadErrorMessage?: string | null;
  busyId: string | null;
  isSaving: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
  onRemove: (treatment: AdminTreatment) => void;
  onSave: (treatment: AdminTreatment, price: number | null, isActive: boolean) => void;
  onRetry?: () => void;
}

const inputClasses =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Admin dashboard modal for managing public.treatments — the option list
 * behind the "+ New Appointment" treatment field and the appointment
 * table's inline treatment editor (see page.tsx). Appointments store the
 * treatment as free text (appointments.treatment), not a foreign key, so
 * removing a treatment here can never corrupt or change any existing
 * appointment's stored value — it only removes the option from future
 * pickers. Removing sets is_active = false rather than deleting the row.
 */
export default function ManageTreatmentsModal({
  treatments,
  isLoading,
  loadError,
  loadErrorMessage,
  busyId,
  isSaving,
  onClose,
  onAdd,
  onRemove,
  onSave,
  onRetry,
}: ManageTreatmentsModalProps) {
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { price: string; isActive: boolean }>>({});

  useEffect(() => {
    setDrafts(Object.fromEntries(treatments.map((treatment) => [treatment.id, {
      price: treatment.price === null || treatment.price === undefined ? "" : String(treatment.price),
      isActive: treatment.is_active,
    }])));
  }, [treatments]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Please enter a treatment name.");
      return;
    }
    if (treatments.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setFormError("That treatment is already in the list.");
      return;
    }
    setFormError(null);
    onAdd(trimmed);
    setName("");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-treatments-heading"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-card border border-line bg-canvas p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="manage-treatments-heading" className="font-display text-lg text-ink">
              Manage Treatments
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              Add or remove options offered when creating or editing an appointment&apos;s
              treatment.
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
          className="mt-4 flex flex-col gap-2 rounded-card border border-line bg-canvas-soft p-4 sm:flex-row sm:items-start"
        >
          <label className="flex flex-1 flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Treatment name *</span>
            <input
              type="text"
              value={name}
              disabled={isSaving}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Teeth Whitening"
              className={inputClasses}
            />
            {formError ? <p className="text-xs text-red-600">{formError}</p> : null}
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6"
          >
            {isSaving ? "Adding…" : "+ Add Treatment"}
          </button>
        </form>

        <div className="mt-4">
          {isLoading ? (
            <div className="rounded-card border border-line bg-canvas-soft p-6 text-center text-sm text-ink/60">
              Loading treatments…
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-canvas-soft p-6 text-center">
              <p className="text-sm text-red-600">
                Couldn&apos;t load treatments right now.
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
          ) : treatments.length === 0 ? (
            <div className="rounded-card border border-line bg-canvas-soft p-6 text-center text-sm text-ink/60">
              No treatments added yet.
            </div>
          ) : (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {treatments.map((treatment) => {
                const isBusy = busyId === treatment.id;
                const isConfirming = confirmingId === treatment.id;
                const draft = drafts[treatment.id] ?? { price: "", isActive: treatment.is_active };

                return (
                  <li
                    key={treatment.id}
                    className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-medium text-ink">{treatment.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmingId(treatment.id)}
                          disabled={busyId !== null}
                          className="text-xs font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                        <span className={`rounded-full px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${draft.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {draft.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    {isConfirming ? (
                      <div className="flex flex-none flex-wrap items-center gap-2">
                        <span className="text-xs text-ink/70">Remove this treatment?</span>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            onRemove(treatment);
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
                    ) : null}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                      <label className="flex flex-col gap-1 text-xs font-medium text-ink/70">
                        Price (INR)
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          inputMode="decimal"
                          value={draft.price}
                          disabled={isBusy}
                          onChange={(event) => setDrafts((current) => ({ ...current, [treatment.id]: { ...draft, price: event.target.value } }))}
                          className={inputClasses}
                          placeholder="Optional"
                        />
                      </label>

                      <button
                        type="button"
                        disabled={isBusy}
                        aria-label={draft.isActive ? "Deactivate treatment" : "Activate treatment"}
                        onClick={() => setDrafts((current) => ({ ...current, [treatment.id]: { ...draft, isActive: !draft.isActive } }))}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${draft.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${draft.isActive ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          const parsed = draft.price.trim() === "" ? null : Number(draft.price);
                          if (parsed !== null && (!Number.isFinite(parsed) || parsed <= 0)) {
                            setFormError("Price must be a positive number.");
                            return;
                          }
                          setFormError(null);
                          onSave(treatment, parsed, draft.isActive);
                        }}
                        className="inline-flex h-10 items-center justify-center rounded-full bg-blue-900 px-4 text-xs font-semibold text-canvas transition-colors hover:bg-blue-800 disabled:opacity-60"
                      >
                        {isBusy ? "Saving…" : "Save"}
                      </button>
                    </div>
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
