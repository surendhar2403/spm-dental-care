"use client";

import { buildTelUrl, buildWhatsAppUrl } from "@/lib/utils";
import type { Appointment } from "@/types/admin";
import {
  STATUS_STYLES,
  formatCreatedAt,
  formatDate,
  formatStatusLabel,
  formatTime,
} from "./appointmentDisplay";

interface BinModalProps {
  appointments: Appointment[];
  busyId: string | null;
  onClose: () => void;
  onViewRequest: (appointment: Appointment) => void;
  onRestoreRequest: (appointment: Appointment) => void;
  onPermanentDeleteRequest: (appointment: Appointment) => void;
}

/**
 * Recently Deleted / Bin. Shows only archived appointments (archived_at is
 * not null) — see page.tsx for how that list is derived. Restoring or
 * permanently deleting here never touches any other appointment.
 */
export default function BinModal({
  appointments,
  busyId,
  onClose,
  onViewRequest,
  onRestoreRequest,
  onPermanentDeleteRequest,
}: BinModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bin-modal-heading"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8"
    >
      <div className="w-full max-w-5xl rounded-card border border-line bg-canvas p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="bin-modal-heading" className="font-display text-lg text-ink">
              🗑️ Recently Deleted
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              Archived appointments. Restore to bring one back, or delete permanently to remove it
              for good.
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

        {appointments.length === 0 ? (
          <div className="mt-4 rounded-card border border-line bg-canvas-soft p-10 text-center text-sm text-ink/60">
            Nothing in Recently Deleted.
          </div>
        ) : (
          <>
            {/*
              MOBILE (below sm): stacked cards instead of the desktop table —
              same reasoning as AppointmentsTable. Avoids forcing a 900px-wide
              table into a 320-430px viewport.
            */}
            <ul className="mt-4 flex flex-col gap-3 sm:hidden">
              {appointments.map((appointment) => {
                const isBusy = busyId === appointment.id;
                return (
                  <li
                    key={appointment.id}
                    className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0 flex-1 break-words font-medium text-ink">
                        {appointment.patient_name}
                      </span>
                      <span
                        className={`flex-none rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[appointment.status]}`}
                      >
                        {formatStatusLabel(appointment.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <a
                        href={buildTelUrl(appointment.phone)}
                        className="text-blue-700 hover:underline"
                      >
                        {appointment.phone}
                      </a>
                      <a
                        href={buildWhatsAppUrl(appointment.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline"
                      >
                        WhatsApp
                      </a>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                      <div className="col-span-2">
                        <dt className="text-xs font-medium uppercase tracking-wide text-ink/50">
                          Treatment
                        </dt>
                        <dd className="mt-0.5 text-ink/80">{appointment.treatment}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-ink/50">
                          Preferred
                        </dt>
                        <dd className="mt-0.5 text-ink/80">
                          {formatDate(appointment.preferred_date)}
                          <br />
                          <span className="text-ink/60">
                            {formatTime(appointment.preferred_time)}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-ink/50">
                          Archived
                        </dt>
                        <dd className="mt-0.5 text-ink/60">
                          {appointment.archived_at ? formatCreatedAt(appointment.archived_at) : "—"}
                        </dd>
                      </div>
                    </dl>

                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onViewRequest(appointment)}
                          className="flex-1 inline-flex items-center justify-center rounded-full border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-canvas-soft"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestoreRequest(appointment)}
                          disabled={isBusy}
                          className="flex-1 inline-flex items-center justify-center rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy ? "Restoring…" : "Restore"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onPermanentDeleteRequest(appointment)}
                        disabled={isBusy}
                        className="inline-flex w-full items-center justify-center rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* DESKTOP / TABLET (sm+): unchanged full data table. */}
            <div className="mt-4 hidden overflow-hidden rounded-card border border-line bg-canvas sm:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-line bg-canvas-soft text-xs uppercase tracking-wide text-ink/60">
                    <tr>
                      <th className="px-4 py-3 font-medium">Patient</th>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Treatment</th>
                      <th className="px-4 py-3 font-medium">Preferred</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Archived</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => {
                      const isBusy = busyId === appointment.id;
                      return (
                        <tr key={appointment.id} className="border-b border-line last:border-b-0">
                          <td className="px-4 py-3 align-top font-medium text-ink">
                            {appointment.patient_name}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <a
                                href={buildTelUrl(appointment.phone)}
                                className="text-blue-700 hover:underline"
                              >
                                {appointment.phone}
                              </a>
                              <a
                                href={buildWhatsAppUrl(appointment.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:underline"
                              >
                                WhatsApp
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top text-ink/80">{appointment.treatment}</td>
                          <td className="px-4 py-3 align-top text-ink/80">
                            <div>{formatDate(appointment.preferred_date)}</div>
                            <div className="text-ink/60">{formatTime(appointment.preferred_time)}</div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[appointment.status]}`}
                            >
                              {formatStatusLabel(appointment.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top text-ink/60">
                            {appointment.archived_at ? formatCreatedAt(appointment.archived_at) : "—"}
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => onViewRequest(appointment)}
                                className="inline-flex items-center justify-center rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-canvas-soft"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => onRestoreRequest(appointment)}
                                disabled={isBusy}
                                className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isBusy ? "Restoring…" : "Restore"}
                              </button>
                              <button
                                type="button"
                                onClick={() => onPermanentDeleteRequest(appointment)}
                                disabled={isBusy}
                                className="inline-flex items-center justify-center rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Delete Permanently
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

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
