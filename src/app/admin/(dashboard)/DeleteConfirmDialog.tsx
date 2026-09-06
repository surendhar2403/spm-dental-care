"use client";

import type { Appointment } from "@/types/admin";

interface DeleteConfirmDialogProps {
  appointment: Appointment;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({
  appointment,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-heading"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8 sm:items-center"
    >
      <div className="w-full max-w-sm rounded-card border border-line bg-canvas p-4 sm:p-6">
        <h2 id="delete-dialog-heading" className="font-display text-lg text-ink">
          Delete this appointment permanently?
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          This will permanently delete the appointment request from{" "}
          <span className="font-medium text-ink">{appointment.patient_name}</span> (
          {appointment.phone}). <span className="font-medium text-ink">This action cannot be undone.</span>
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? "Deleting…" : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
