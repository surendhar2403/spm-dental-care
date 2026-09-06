"use client";

import { buildTelUrl, buildWhatsAppUrl } from "@/lib/utils";
import {
  ADMIN_TREATMENT_OPTIONS,
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentStatus,
} from "@/types/admin";
import { STATUS_STYLES, formatCreatedAt, formatDate, formatTime } from "./appointmentDisplay";

interface AppointmentsTableProps {
  appointments: Appointment[];
  busyId: string | null;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onArchiveRequest: (appointment: Appointment) => void;
  onViewRequest: (appointment: Appointment) => void;
  editingTreatmentId: string | null;
  treatmentDraft: string;
  onEditTreatmentStart: (appointment: Appointment) => void;
  onEditTreatmentCancel: () => void;
  onTreatmentDraftChange: (value: string) => void;
  onEditTreatmentSave: (id: string) => void;
}

/**
 * Inline treatment cell: shared between the desktop table and the mobile
 * card layout so the "Edit" behavior stays identical in both.
 */
function TreatmentCell({
  appointment,
  isBusy,
  isEditing,
  treatmentDraft,
  editDisabled,
  onEditTreatmentStart,
  onEditTreatmentCancel,
  onTreatmentDraftChange,
  onEditTreatmentSave,
}: {
  appointment: Appointment;
  isBusy: boolean;
  isEditing: boolean;
  treatmentDraft: string;
  editDisabled: boolean;
  onEditTreatmentStart: (appointment: Appointment) => void;
  onEditTreatmentCancel: () => void;
  onTreatmentDraftChange: (value: string) => void;
  onEditTreatmentSave: (id: string) => void;
}) {
  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <select
          value={treatmentDraft}
          disabled={isBusy}
          onChange={(event) => onTreatmentDraftChange(event.target.value)}
          className="w-full rounded-lg border border-line bg-canvas px-2 py-1.5 text-sm text-ink focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(ADMIN_TREATMENT_OPTIONS.includes(appointment.treatment)
            ? ADMIN_TREATMENT_OPTIONS
            : [appointment.treatment, ...ADMIN_TREATMENT_OPTIONS]
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
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span>{appointment.treatment}</span>
      <button
        type="button"
        onClick={() => onEditTreatmentStart(appointment)}
        disabled={editDisabled}
        className="text-xs font-medium text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-ink/40 disabled:no-underline"
      >
        Edit
      </button>
    </div>
  );
}

export default function AppointmentsTable({
  appointments,
  busyId,
  onStatusChange,
  onArchiveRequest,
  onViewRequest,
  editingTreatmentId,
  treatmentDraft,
  onEditTreatmentStart,
  onEditTreatmentCancel,
  onTreatmentDraftChange,
  onEditTreatmentSave,
}: AppointmentsTableProps) {
  return (
    <>
      {/*
        MOBILE (below sm, 640px): a stacked list of cards instead of the
        desktop table. Squeezing an 8-column table onto a 320-430px screen
        would force horizontal scrolling to read Status/Actions, so below
        `sm` this renders full-width cards instead — every field is visible
        without scrolling sideways. Hidden at sm+ where the table takes over.
      */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {appointments.map((appointment) => {
          const isBusy = busyId === appointment.id;
          const isEditing = editingTreatmentId === appointment.id;
          const editDisabled =
            busyId !== null || (editingTreatmentId !== null && editingTreatmentId !== appointment.id);

          return (
            <li
              key={appointment.id}
              className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 flex-1 break-words font-medium text-ink">
                  {appointment.patient_name}
                </span>
                <select
                  value={appointment.status}
                  disabled={isBusy}
                  onChange={(event) =>
                    onStatusChange(appointment.id, event.target.value as AppointmentStatus)
                  }
                  className={`flex-none rounded-full border-0 px-3 py-1.5 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_STYLES[appointment.status]}`}
                >
                  {APPOINTMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <a href={buildTelUrl(appointment.phone)} className="text-blue-700 hover:underline">
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
                  <dd className="mt-0.5 text-ink/80">
                    <TreatmentCell
                      appointment={appointment}
                      isBusy={isBusy}
                      isEditing={isEditing}
                      treatmentDraft={treatmentDraft}
                      editDisabled={editDisabled}
                      onEditTreatmentStart={onEditTreatmentStart}
                      onEditTreatmentCancel={onEditTreatmentCancel}
                      onTreatmentDraftChange={onTreatmentDraftChange}
                      onEditTreatmentSave={onEditTreatmentSave}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink/50">
                    Preferred
                  </dt>
                  <dd className="mt-0.5 text-ink/80">
                    {formatDate(appointment.preferred_date)}
                    <br />
                    <span className="text-ink/60">{formatTime(appointment.preferred_time)}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink/50">
                    Requested
                  </dt>
                  <dd className="mt-0.5 text-ink/60">{formatCreatedAt(appointment.created_at)}</dd>
                </div>
                {appointment.message ? (
                  <div className="col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-ink/50">
                      Message
                    </dt>
                    <dd className="mt-0.5 line-clamp-2 text-ink/70">{appointment.message}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onViewRequest(appointment)}
                  className="flex-1 inline-flex items-center justify-center rounded-full border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-canvas-soft"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onArchiveRequest(appointment)}
                  disabled={isBusy}
                  className="flex-1 inline-flex items-center justify-center rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* DESKTOP / TABLET (sm and up, 640px+): unchanged full data table. */}
      <div className="hidden overflow-hidden rounded-card border border-line bg-canvas sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-line bg-canvas-soft text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Treatment</th>
                <th className="px-4 py-3 font-medium">Preferred</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Requested</th>
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
                    <td className="px-4 py-3 align-top text-ink/80">
                      {editingTreatmentId === appointment.id ? (
                        <div className="flex flex-col gap-2">
                          <select
                            value={treatmentDraft}
                            disabled={isBusy}
                            onChange={(event) => onTreatmentDraftChange(event.target.value)}
                            className="rounded-lg border border-line bg-canvas px-2 py-1.5 text-sm text-ink focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {(ADMIN_TREATMENT_OPTIONS.includes(appointment.treatment)
                              ? ADMIN_TREATMENT_OPTIONS
                              : [appointment.treatment, ...ADMIN_TREATMENT_OPTIONS]
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
                        <div className="flex items-center gap-2">
                          <span>{appointment.treatment}</span>
                          <button
                            type="button"
                            onClick={() => onEditTreatmentStart(appointment)}
                            disabled={
                              busyId !== null ||
                              (editingTreatmentId !== null && editingTreatmentId !== appointment.id)
                            }
                            className="text-xs font-medium text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-ink/40 disabled:no-underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-ink/80">
                      <div>{formatDate(appointment.preferred_date)}</div>
                      <div className="text-ink/60">{formatTime(appointment.preferred_time)}</div>
                    </td>
                    <td className="max-w-[220px] px-4 py-3 align-top text-ink/70">
                      {appointment.message ? (
                        <span title={appointment.message} className="line-clamp-2">
                          {appointment.message}
                        </span>
                      ) : (
                        <span className="text-ink/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <select
                        value={appointment.status}
                        disabled={isBusy}
                        onChange={(event) =>
                          onStatusChange(appointment.id, event.target.value as AppointmentStatus)
                        }
                        className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_STYLES[appointment.status]}`}
                      >
                        {APPOINTMENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 align-top text-ink/60">
                      {formatCreatedAt(appointment.created_at)}
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
                          onClick={() => onArchiveRequest(appointment)}
                          disabled={isBusy}
                          className="inline-flex items-center justify-center rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
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
  );
}
