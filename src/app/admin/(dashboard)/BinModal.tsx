"use client";

import { buildTelUrl } from "@/lib/utils";
import type { Appointment } from "@/types/admin";
import {
  formatCreatedAt,
  formatDate,
  formatStatusLabel,
  formatTime,
} from "./appointmentDisplay";
import SettingsActionIcon from "./SettingsActionIcon";

const ADMIN_STATUS_STYLES: Record<Appointment["status"], string> = {
  pending: "admin-table-status-pending",
  confirmed: "admin-table-status-confirmed",
  completed: "admin-table-status-completed",
  cancelled: "admin-table-status-cancelled",
  no_show: "admin-table-status-cancelled",
};

interface BinModalProps {
  appointments: Appointment[];
  busyId: string | null;
  onClose: () => void;
  onRestoreAll: () => void;
  onPermanentDeleteAll: () => void;
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
  onRestoreAll,
  onPermanentDeleteAll,
  onRestoreRequest,
  onPermanentDeleteRequest,
}: BinModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bin-modal-heading"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-ink/40 px-2 py-4 sm:px-4 sm:py-6"
    >
      <div className="admin-bin-modal flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-line bg-[var(--admin-surface-strong)] p-3 shadow-xl sm:p-4">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line pb-3">
          <div>
            <h2 id="bin-modal-heading" className="font-display text-lg text-ink">
              🗑️ Recently Deleted
            </h2>
            <p className="mt-1 text-xs text-[var(--admin-text-soft)] sm:text-sm">
              Archived appointments. Restore to bring one back, or delete permanently to remove it
              for good.
            </p>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            {appointments.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={onRestoreAll}
                  disabled={busyId !== null}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 px-3 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Restore all
                </button>
                <button
                  type="button"
                  onClick={onPermanentDeleteAll}
                  disabled={busyId !== null}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete all
                </button>
              </>
            ) : null}
            <SettingsActionIcon icon="x" label="Close recently deleted" onClick={onClose} />
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="mt-3 rounded-xl border border-line bg-[var(--admin-surface)] p-8 text-center text-sm text-[var(--admin-text-soft)]">
            Nothing in Recently Deleted.
          </div>
        ) : (
          <>
            {/*
              MOBILE (below sm): stacked cards instead of the desktop table —
              same reasoning as AppointmentsTable. Avoids forcing a 900px-wide
              table into a 320-430px viewport.
            */}
            <ul className="mt-3 flex min-h-0 max-h-[min(62vh,38rem)] flex-col gap-2 overflow-y-auto sm:hidden">
              {appointments.map((appointment) => {
                const isBusy = busyId === appointment.id;
                return (
                  <li
                    key={appointment.id}
                    className="admin-appointment-card flex flex-col gap-2 rounded-xl border bg-[var(--admin-surface)] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0 flex-1 break-words font-medium text-ink">
                        {appointment.patient_name}
                      </span>
                      <span
                        className={`admin-table-status flex-none rounded-full px-3 py-1.5 text-xs font-semibold ${ADMIN_STATUS_STYLES[appointment.status]}`}
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
                      <div className="flex justify-end gap-2">
                        <SettingsActionIcon
                          icon="upload"
                          label={`Restore ${appointment.patient_name} appointment`}
                          onClick={() => onRestoreRequest(appointment)}
                          disabled={isBusy}
                          tone="success"
                        />
                        <SettingsActionIcon
                          icon="trash"
                          label={`Delete ${appointment.patient_name} appointment permanently`}
                          onClick={() => onPermanentDeleteRequest(appointment)}
                          disabled={isBusy}
                          tone="danger"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* DESKTOP / TABLET (sm+): unchanged full data table. */}
            <div className="admin-appointments-table mt-3 hidden min-h-0 overflow-hidden rounded-2xl border bg-[var(--admin-surface-strong)] shadow-sm sm:block">
              <div className="max-h-[min(62vh,38rem)] overflow-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="admin-appointments-header border-b border-line text-xs uppercase tracking-[0.12em] text-[var(--admin-text-soft)]">
                    <tr>
                      <th className="admin-table-header px-4 py-3 font-semibold">Patient</th>
                      <th className="admin-table-header px-4 py-3 font-semibold">Contact</th>
                      <th className="admin-table-header px-4 py-3 font-semibold">Treatment</th>
                      <th className="admin-table-header px-4 py-3 font-semibold">Preferred</th>
                      <th className="admin-table-header px-4 py-3 font-semibold">Status</th>
                      <th className="admin-table-header px-4 py-3 font-semibold">Archived</th>
                      <th className="admin-table-header px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => {
                      const isBusy = busyId === appointment.id;
                      return (
                        <tr key={appointment.id} className="admin-appointment-row border-b border-line last:border-b-0 hover:bg-[var(--admin-surface)]">
                          <td className="px-4 py-3 align-middle font-medium text-[var(--admin-text)]">
                            {appointment.patient_name}
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <div className="flex flex-col gap-1">
                              <a
                                href={buildTelUrl(appointment.phone)}
                                className="text-blue-700 hover:underline"
                              >
                                {appointment.phone}
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-middle text-[var(--admin-text)]">{appointment.treatment}</td>
                          <td className="px-4 py-3 align-middle text-[var(--admin-text)]">
                            <div>{formatDate(appointment.preferred_date)}</div>
                            <div className="text-[var(--admin-text-soft)]">{formatTime(appointment.preferred_time)}</div>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <span
                              className={`admin-table-status inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${ADMIN_STATUS_STYLES[appointment.status]}`}
                            >
                              {formatStatusLabel(appointment.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-middle text-[var(--admin-text-soft)]">
                            {appointment.archived_at ? formatCreatedAt(appointment.archived_at) : "—"}
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <SettingsActionIcon
                                icon="upload"
                                label={`Restore ${appointment.patient_name} appointment`}
                                onClick={() => onRestoreRequest(appointment)}
                                disabled={isBusy}
                                tone="success"
                              />
                              <SettingsActionIcon
                                icon="trash"
                                label={`Delete ${appointment.patient_name} appointment permanently`}
                                onClick={() => onPermanentDeleteRequest(appointment)}
                                disabled={isBusy}
                                tone="danger"
                              />
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

      </div>
    </div>
  );
}
