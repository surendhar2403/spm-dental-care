"use client";

import { useState } from "react";
import {
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentStatus,
} from "@/types/admin";
import {
  STATUS_STYLES,
  formatCreatedAt,
  formatCreatedAtDate,
  formatCreatedAtTime,
  formatDate,
  formatTime,
  isConfirmedAppointmentPast,
} from "./appointmentDisplay";
import MissedAppointmentAlert from "./MissedAppointmentAlert";
import PatientContactIcons from "./ContactIcons";

interface AppointmentsTableProps {
  appointments: Appointment[];
  busyId: string | null;
  treatmentOptions: string[];
  onStatusChange: (id: string, status: AppointmentStatus) => Promise<boolean> | boolean;
  onArchiveRequest: (appointment: Appointment) => void;
  onViewRequest: (appointment: Appointment) => void;
  onPreferredDateTimeUpdate: (
    id: string,
    preferredDate: string,
    preferredTime: string | null,
  ) => Promise<boolean>;
  editingTreatmentId: string | null;
  treatmentDraft: string;
  onEditTreatmentStart: (appointment: Appointment) => void;
  onEditTreatmentCancel: () => void;
  onTreatmentDraftChange: (value: string) => void;
  onEditTreatmentSave: (id: string) => void;
}

/**
 * Inline treatment cell: shared between the desktop table and the mobile
 * card layout so the "click to edit" behavior stays identical in both.
 * Clicking the treatment value itself opens the dropdown — there is no
 * separate "Edit" link/button.
 */
function TreatmentCell({
  appointment,
  isBusy,
  isEditing,
  treatmentDraft,
  editDisabled,
  treatmentOptions,
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
  treatmentOptions: string[];
  onEditTreatmentStart: (appointment: Appointment) => void;
  onEditTreatmentCancel: () => void;
  onTreatmentDraftChange: (value: string) => void;
  onEditTreatmentSave: (id: string) => void;
}) {
  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <select
          autoFocus
          value={treatmentDraft}
          disabled={isBusy}
          onChange={(event) => onTreatmentDraftChange(event.target.value)}
          className="w-full rounded-lg border border-line bg-[var(--admin-surface)] px-2 py-1.5 text-sm text-[var(--admin-text)] focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(treatmentOptions.includes(appointment.treatment)
            ? treatmentOptions
            : [appointment.treatment, ...treatmentOptions]
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
    <button
      type="button"
      onClick={() => onEditTreatmentStart(appointment)}
      disabled={editDisabled}
      title="Click to change treatment"
      className="-mx-1 rounded px-1 text-left transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
    >
      {appointment.treatment}
    </button>
  );
}

/**
 * Status cell: the normal editable status <select>, plus — automatically,
 * with no action required — a red MissedAppointmentAlert underneath once a
 * CONFIRMED appointment's scheduled date & time have passed. That alert is
 * purely visual; it never changes appointment.status itself. Separately,
 * if a row's status already happens to be "no_show" (only reachable today
 * by editing the database directly — there is no button for it in this
 * UI), a small "Change status…" control lets an admin correct it back to
 * a normal status without ever offering "no_show" as a pickable option in
 * the regular dropdown.
 */
function StatusCell({
  appointment,
  isBusy,
  onStatusChange,
}: {
  appointment: Appointment;
  isBusy: boolean;
  onStatusChange: (id: string, status: AppointmentStatus) => Promise<boolean> | boolean;
}) {
  if (appointment.status === "no_show") {
    return (
      <div className="flex flex-col items-start gap-1.5">
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">
          🔴 No Show
        </span>
        <select
          value=""
          disabled={isBusy}
          onChange={(event) => {
            if (event.target.value) {
              onStatusChange(appointment.id, event.target.value as AppointmentStatus);
            }
          }}
          className="admin-status-select w-fit rounded-full border border-line bg-[var(--admin-surface)] px-2 py-1 text-[11px] text-[var(--admin-text-soft)] shadow-sm focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Change status…</option>
          {APPOINTMENT_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <select
        value={appointment.status}
        disabled={isBusy}
        onChange={(event) => onStatusChange(appointment.id, event.target.value as AppointmentStatus)}
        className={`admin-status-select rounded-full border px-3 py-1.5 text-xs font-semibold capitalize shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_STYLES[appointment.status]}`}
      >
        {APPOINTMENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}

function ActionCell({
  appointment,
  isBusy,
  onViewRequest,
  onArchiveRequest,
}: {
  appointment: Appointment;
  isBusy: boolean;
  onViewRequest: (appointment: Appointment) => void;
  onArchiveRequest: (appointment: Appointment) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <PatientContactIcons
        phone={appointment.phone}
        onView={() => onViewRequest(appointment)}
        onDelete={() => onArchiveRequest(appointment)}
        deleteDisabled={isBusy}
      />
    </div>
  );
}

function PreferredDateTimeCell({
  appointment,
  busyId,
  onPreferredDateTimeUpdate,
}: {
  appointment: Appointment;
  busyId: string | null;
  onPreferredDateTimeUpdate: (
    id: string,
    preferredDate: string,
    preferredTime: string | null,
  ) => Promise<boolean>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftDate, setDraftDate] = useState(appointment.preferred_date);
  const [draftTime, setDraftTime] = useState(appointment.preferred_time ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const isBusy = busyId === appointment.id;

  async function handleSave() {
    if (!draftDate) {
      setSaveError("Please choose a valid date.");
      return;
    }

    const saved = await onPreferredDateTimeUpdate(appointment.id, draftDate, draftTime || null);
    if (saved) {
      setDraftDate(appointment.preferred_date);
      setDraftTime(appointment.preferred_time ?? "");
      setSaveError(null);
      setIsEditing(false);
      return;
    }

    setSaveError("Could not update the appointment date and time.");
  }

  if (isEditing) {
    return (
      <div className="flex min-w-[170px] max-w-[200px] flex-col gap-2">
        <input
          autoFocus
          type="date"
          value={draftDate}
          disabled={isBusy}
          onChange={(event) => {
            setDraftDate(event.target.value);
            setSaveError(null);
          }}
          className="w-full rounded-lg border border-line bg-[var(--admin-surface)] px-2 py-1.5 text-xs text-[var(--admin-text)] focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <input
          type="time"
          value={draftTime}
          disabled={isBusy}
          onChange={(event) => {
            setDraftTime(event.target.value);
            setSaveError(null);
          }}
          className="w-full rounded-lg border border-line bg-[var(--admin-surface)] px-2 py-1.5 text-xs text-[var(--admin-text)] focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isBusy || !draftDate}
            className="inline-flex items-center justify-center rounded-full bg-blue-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Saving…" : "Update"}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraftDate(appointment.preferred_date);
              setDraftTime(appointment.preferred_time ?? "");
              setSaveError(null);
              setIsEditing(false);
            }}
            disabled={isBusy}
            className="inline-flex items-center justify-center rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
        {saveError ? <p className="text-[10px] text-red-600">{saveError}</p> : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraftDate(appointment.preferred_date);
        setDraftTime(appointment.preferred_time ?? "");
        setIsEditing(true);
      }}
      className="block rounded-md px-1 py-0.5 text-left transition-colors hover:bg-[var(--admin-surface)]"
      title="Edit appointment date and time"
    >
      <div className="leading-snug">
        <div className="whitespace-nowrap">{formatDate(appointment.preferred_date)}</div>
        <div className="whitespace-nowrap text-[var(--admin-text-soft)]">
          {formatTime(appointment.preferred_time)}
        </div>
      </div>
    </button>
  );
}

export default function AppointmentsTable({
  appointments,
  busyId,
  treatmentOptions,
  onStatusChange,
  onArchiveRequest,
  onViewRequest,
  onPreferredDateTimeUpdate,
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
        desktop table. Squeezing a 6-column table onto a 320-430px screen
        would force horizontal scrolling to read Status, so below `sm` this
        renders full-width cards instead — every field is visible without
        scrolling sideways. Manage/view/delete happens via the compact icon
        row next to the patient's name, same as the desktop table. Hidden at
        sm+ where the table takes over.
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
              className="flex flex-col gap-3 rounded-2xl border border-line bg-[var(--admin-surface-strong)] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span className="min-w-0 break-words font-medium text-ink">
                    {appointment.patient_name}
                  </span>
                  {isConfirmedAppointmentPast(appointment) ? <MissedAppointmentAlert /> : null}
                </div>
                <div className="flex items-center justify-end">
                  <ActionCell
                    appointment={appointment}
                    isBusy={isBusy}
                    onViewRequest={onViewRequest}
                    onArchiveRequest={onArchiveRequest}
                  />
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div className="col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-soft)]">
                    Treatment
                  </dt>
                  <dd className="mt-0.5 text-[var(--admin-text)]">
                    <TreatmentCell
                      appointment={appointment}
                      isBusy={isBusy}
                      isEditing={isEditing}
                      treatmentDraft={treatmentDraft}
                      editDisabled={editDisabled}
                      treatmentOptions={treatmentOptions}
                      onEditTreatmentStart={onEditTreatmentStart}
                      onEditTreatmentCancel={onEditTreatmentCancel}
                      onTreatmentDraftChange={onTreatmentDraftChange}
                      onEditTreatmentSave={onEditTreatmentSave}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-soft)]">
                    Appointment Date
                  </dt>
                  <dd className="mt-0.5 text-[var(--admin-text)]">
                    <PreferredDateTimeCell
                      appointment={appointment}
                      busyId={busyId}
                      onPreferredDateTimeUpdate={onPreferredDateTimeUpdate}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-soft)]">
                    Requested
                  </dt>
                  <dd className="mt-0.5 text-[var(--admin-text-soft)]">
                    <div className="leading-snug">
                      <div className="whitespace-nowrap">{formatCreatedAtDate(appointment.created_at)}</div>
                      <div className="whitespace-nowrap">{formatCreatedAtTime(appointment.created_at)}</div>
                    </div>
                  </dd>
                </div>
                {appointment.message ? (
                  <div className="col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-soft)]">
                      Message
                    </dt>
                    <dd className="mt-0.5 line-clamp-2 text-[var(--admin-text)]">{appointment.message}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          );
        })}
      </ul>

      {/* DESKTOP / TABLET (sm and up, 640px+): Patient | Treatment | Preferred | Message | Status | Requested | Actions. The missed-appointment warning sits under the patient name; the compact action icons live in their own right-side column. */}
      <div className="relative z-10 hidden overflow-visible rounded-2xl border border-line bg-[var(--admin-surface-strong)] shadow-sm sm:block">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-[var(--admin-surface)] text-xs uppercase tracking-[0.12em] text-[var(--admin-text-soft)]">
              <tr>
                <th className="admin-table-header px-4 py-3 font-semibold">Patient</th>
                <th className="admin-table-header px-4 py-3 font-semibold">Treatment</th>
                <th className="admin-table-header px-4 py-3 font-semibold">Appointment Date</th>
                <th className="admin-table-header px-4 py-3 font-semibold">Message</th>
                <th className="admin-table-header px-4 py-3 font-semibold">Status</th>
                <th className="admin-table-header px-4 py-3 font-semibold">Requested</th>
                <th className="admin-table-header px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const isBusy = busyId === appointment.id;
                const isEditing = editingTreatmentId === appointment.id;

                return (
                  <tr
                    key={appointment.id}
                    className="border-b border-line last:border-b-0 hover:bg-[var(--admin-surface)]"
                  >
                    <td className="px-4 py-3 align-top font-medium text-[var(--admin-text)]">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="break-words">{appointment.patient_name}</span>
                        {isConfirmedAppointmentPast(appointment) ? <MissedAppointmentAlert /> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-[var(--admin-text)]">
                      <TreatmentCell
                        appointment={appointment}
                        isBusy={isBusy}
                        isEditing={isEditing}
                        treatmentDraft={treatmentDraft}
                        editDisabled={
                          busyId !== null ||
                          (editingTreatmentId !== null && editingTreatmentId !== appointment.id)
                        }
                        treatmentOptions={treatmentOptions}
                        onEditTreatmentStart={onEditTreatmentStart}
                        onEditTreatmentCancel={onEditTreatmentCancel}
                        onTreatmentDraftChange={onTreatmentDraftChange}
                        onEditTreatmentSave={onEditTreatmentSave}
                      />
                    </td>
                    <td className="px-4 py-3 align-top text-[var(--admin-text)]">
                      <PreferredDateTimeCell
                        appointment={appointment}
                        busyId={busyId}
                        onPreferredDateTimeUpdate={onPreferredDateTimeUpdate}
                      />
                    </td>
                    <td className="max-w-[220px] px-4 py-3 align-top text-[var(--admin-text)]">
                      {appointment.message ? (
                        <span title={appointment.message} className="line-clamp-2">
                          {appointment.message}
                        </span>
                      ) : (
                        <span className="text-[var(--admin-text-soft)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusCell
                        appointment={appointment}
                        isBusy={isBusy}
                        onStatusChange={onStatusChange}
                      />
                    </td>
                    <td className="px-4 py-3 align-top text-[var(--admin-text-soft)]">
                      <div className="leading-snug">
                        <div className="whitespace-nowrap">{formatCreatedAtDate(appointment.created_at)}</div>
                        <div className="whitespace-nowrap">{formatCreatedAtTime(appointment.created_at)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ActionCell
                        appointment={appointment}
                        isBusy={isBusy}
                        onViewRequest={onViewRequest}
                        onArchiveRequest={onArchiveRequest}
                      />
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
