"use client";

import type { Appointment } from "@/types/admin";

interface ArchiveConfirmDialogProps {
  appointment: Appointment;
  isArchiving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ArchiveConfirmDialog({
  appointment,
  isArchiving,
  onCancel,
  onConfirm,
}: ArchiveConfirmDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-dialog-heading"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8 sm:items-center"
    >
      <div className="w-full max-w-sm rounded-card border border-line bg-canvas p-4 sm:p-6">
        <h2 id="archive-dialog-heading" className="font-display text-lg text-ink">
          Move this appointment to Recently Deleted?
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          <span className="font-medium text-ink">{appointment.patient_name}</span> (
          {appointment.phone}) will be removed from the appointment list. You can restore it any
          time from Recently Deleted.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isArchiving}
            className="inline-flex items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isArchiving}
            className="inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isArchiving ? "Moving…" : "Move to Bin"}
          </button>
        </div>
      </div>
    </div>
  );
}
