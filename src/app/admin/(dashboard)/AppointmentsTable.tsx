"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentStatus,
} from "@/types/admin";
import {
  formatCreatedAt,
  formatCreatedAtDate,
  formatCreatedAtTime,
  formatDate,
  formatTime,
  formatStatusLabel,
  isConfirmedAppointmentPast,
} from "./appointmentDisplay";
import MissedAppointmentAlert from "./MissedAppointmentAlert";
import PatientContactIcons from "./ContactIcons";

const PATIENT_AVATAR_STYLES = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
];

const STATUS_THEME_STYLES: Record<AppointmentStatus, string> = {
  pending: "admin-table-status-pending",
  confirmed: "admin-table-status-confirmed",
  completed: "admin-table-status-completed",
  cancelled: "admin-table-status-cancelled",
  no_show: "admin-table-status-cancelled",
};

const STATUS_MENU_STYLES: Record<AppointmentStatus, string> = {
  pending: "text-amber-700 hover:bg-amber-50",
  confirmed: "text-emerald-700 hover:bg-emerald-50",
  completed: "text-blue-700 hover:bg-blue-50",
  cancelled: "text-rose-700 hover:bg-rose-50",
  no_show: "text-rose-700 hover:bg-rose-50",
};

const STATUS_DROPDOWN_STYLES: Record<AppointmentStatus, string> = {
  pending: "border-amber-200/80 bg-amber-100 text-amber-700",
  confirmed: "border-emerald-200/80 bg-emerald-100 text-emerald-700",
  completed: "border-blue-200/80 bg-blue-100 text-blue-700",
  cancelled: "border-rose-200/80 bg-rose-100 text-rose-700",
  no_show: "border-rose-200/80 bg-rose-100 text-rose-700",
};

function getPatientInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getPatientAvatarStyle(name: string) {
  const code = name.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  return PATIENT_AVATAR_STYLES[code % PATIENT_AVATAR_STYLES.length];
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M14 5h5v5" />
      <path d="m13 11 6-6" />
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="h-4 w-4">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function MessageCell({ message }: { message: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasMessage = Boolean(message?.trim());

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <div className="flex min-w-0 items-center gap-1.5">
        {hasMessage ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="View full appointment message"
            title="View full appointment message"
            className="h-9 max-h-9 min-w-0 max-w-full flex-1 cursor-pointer overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--admin-link)_24%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-link)_4%,var(--admin-surface))] px-2 py-1 text-left text-xs leading-4 text-[var(--admin-text)] transition-colors duration-150 hover:border-[color-mix(in_srgb,var(--admin-link)_42%,var(--admin-border))] hover:bg-[color-mix(in_srgb,var(--admin-link)_9%,var(--admin-surface))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-link)]"
          >
            <span className="admin-appointment-selected-text block line-clamp-2 whitespace-pre-wrap break-words">{message}</span>
          </button>
        ) : (
          <div className="h-9 max-h-9 min-w-0 max-w-full flex-1 overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--admin-link)_24%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-link)_4%,var(--admin-surface))] px-2 py-1 text-xs leading-4 text-[var(--admin-text-soft)]">
            <span className="admin-appointment-selected-text">No message</span>
          </div>
        )}
      </div>

      {isOpen && hasMessage ? createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="appointment-message-title" className="w-full max-w-md rounded-xl border border-line bg-[var(--admin-surface-strong)] p-4 text-[var(--admin-text)] shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="appointment-message-title" className="text-sm font-semibold text-[var(--admin-heading)]">Appointment Message</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close message"
                title="Close message"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--admin-text-soft)] transition-colors duration-150 hover:bg-[var(--admin-surface)] hover:text-[var(--admin-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-link)]"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mt-3 max-h-[min(60vh,24rem)] overflow-y-auto rounded-lg border border-[color-mix(in_srgb,var(--admin-link)_24%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-link)_4%,var(--admin-surface))] px-3 py-2.5 text-sm leading-5 whitespace-pre-wrap break-words [scrollbar-width:thin]">
              {message}
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}

function StatusIcon({ status }: { status: AppointmentStatus }) {
  const sharedProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-3.5 w-3.5 shrink-0",
    "aria-hidden": true,
  };

  if (status === "pending") {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (status === "completed") {
    return (
      <svg {...sharedProps}>
        <path d="m5 12 4 4L19 6" />
        <path d="M5 19h14" />
      </svg>
    );
  }

  if (status === "cancelled" || status === "no_show") {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m9 9 6 6M15 9l-6 6" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.3 2.3 4.7-4.7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
    >
      <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
    </svg>
  );
}

function StatusDropdown({
  value,
  disabled,
  placeholder,
  onChange,
}: {
  value: AppointmentStatus | "";
  disabled: boolean;
  placeholder?: string;
  onChange: (status: AppointmentStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedStatus = value || null;

  useEffect(() => {
    if (!isOpen) return;

    function updateMenuPosition() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!dropdownRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    updateMenuPosition();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  function handleSelect(status: AppointmentStatus) {
    setIsOpen(false);
    onChange(status);
  }

  return (
    <div ref={dropdownRef} className="relative z-20 w-fit">
      <button
        type="button"
        ref={buttonRef}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedStatus ? `Appointment status: ${formatStatusLabel(selectedStatus)}` : placeholder}
        onClick={() => setIsOpen((open) => !open)}
        className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 ${
          selectedStatus
            ? STATUS_DROPDOWN_STYLES[selectedStatus]
            : "border-line bg-[var(--admin-surface)] text-[var(--admin-text-soft)]"
        }`}
      >
        {selectedStatus && <StatusIcon status={selectedStatus} />}
        <span>{selectedStatus ? formatStatusLabel(selectedStatus) : placeholder}</span>
        <ChevronDownIcon />
      </button>

      {typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              aria-label="Appointment status options"
              aria-hidden={!isOpen}
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                minWidth: menuPosition.width,
              }}
              className={`fixed z-[100] origin-top-left rounded-lg border border-line bg-[var(--admin-surface-strong)] p-1 shadow-xl transition-all duration-150 ${
                isOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              {APPOINTMENT_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  role="option"
                  aria-selected={status === selectedStatus}
                  onClick={() => handleSelect(status)}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors ${STATUS_MENU_STYLES[status]} ${
                    status === selectedStatus ? "bg-canvas-soft" : ""
                  }`}
                >
                  <StatusIcon status={status} />
                  <span className="whitespace-nowrap">{formatStatusLabel(status)}</span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

interface AppointmentsTableProps {
  appointments: Appointment[];
  selectedAppointmentIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  selectAllActive: boolean;
  onSelectAllActiveChange: (active: boolean) => void;
  onBulkStatusChange: (ids: string[], status: AppointmentStatus) => Promise<boolean>;
  visitCounts: Map<string, number>;
  busyId: string | null;
  treatmentOptions: string[];
  onStatusChange: (id: string, status: AppointmentStatus) => Promise<boolean> | boolean;
  onArchiveRequest: (appointment: Appointment) => void;
  onPatientOpen: (appointment: Appointment) => void;
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
        <span className={`admin-table-status inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_THEME_STYLES.no_show}`}>
          <StatusIcon status="no_show" />
          No Show
        </span>
        <StatusDropdown
          value=""
          placeholder="Change status..."
          disabled={isBusy}
          onChange={(status) => onStatusChange(appointment.id, status)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <StatusDropdown
        value={appointment.status}
        disabled={isBusy}
        onChange={(status) => onStatusChange(appointment.id, status)}
      />
    </div>
  );
}

function ActionCell({
  appointment,
  isBusy,
  onArchiveRequest,
}: {
  appointment: Appointment;
  isBusy: boolean;
  onArchiveRequest: (appointment: Appointment) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <PatientContactIcons
        phone={appointment.phone}
        onDelete={() => onArchiveRequest(appointment)}
        deleteDisabled={isBusy}
      />
    </div>
  );
}

function BulkStatusToolbar({
  selectedCount,
  selectedIds,
  isBusy,
  onStatusChange,
}: {
  selectedCount: number;
  selectedIds: string[];
  isBusy: boolean;
  onStatusChange: (ids: string[], status: AppointmentStatus) => Promise<boolean>;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--admin-link)_24%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-link)_5%,var(--admin-surface-strong))] px-3 py-2">
      <span className="mr-1 text-xs font-semibold text-[var(--admin-text)]">{selectedCount} selected</span>
      {([
        ["pending", "Pending"],
        ["confirmed", "Confirmed"],
        ["completed", "Completed"],
        ["cancelled", "Cancelled"],
      ] as const).map(([status, label]) => (
        <button
          key={status}
          type="button"
          disabled={isBusy}
          onClick={() => void onStatusChange(selectedIds, status)}
          className={`admin-table-status inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_THEME_STYLES[status]}`}
        >
          <StatusIcon status={status} />
          {label}
        </button>
      ))}
    </div>
  );
}

function PreferredDateTimeCell({
  appointment,
  busyId,
  compact = false,
  onPreferredDateTimeUpdate,
}: {
  appointment: Appointment;
  busyId: string | null;
  compact?: boolean;
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
      <div className={compact ? "whitespace-nowrap text-[10px] leading-snug" : "leading-snug"}>
        {compact ? (
          <span>
            {formatDate(appointment.preferred_date)}, {formatTime(appointment.preferred_time)}
          </span>
        ) : (
          <>
            <div className="whitespace-nowrap">{formatDate(appointment.preferred_date)}</div>
            <div className="whitespace-nowrap text-[var(--admin-text-soft)]">
              {formatTime(appointment.preferred_time)}
            </div>
          </>
        )}
      </div>
    </button>
  );
}

export default function AppointmentsTable({
  appointments,
  selectedAppointmentIds,
  onSelectionChange,
  selectAllActive,
  onSelectAllActiveChange,
  onBulkStatusChange,
  visitCounts,
  busyId,
  treatmentOptions,
  onStatusChange,
  onArchiveRequest,
  onPatientOpen,
  onPreferredDateTimeUpdate,
  editingTreatmentId,
  treatmentDraft,
  onEditTreatmentStart,
  onEditTreatmentCancel,
  onTreatmentDraftChange,
  onEditTreatmentSave,
}: AppointmentsTableProps) {
  const currentPageIds = appointments.map((appointment) => appointment.id);
  const selectedCurrentPageCount = currentPageIds.filter((id) => selectedAppointmentIds.has(id)).length;
    const selectedCurrentPageIds = currentPageIds.filter((id) => selectedAppointmentIds.has(id));
  const allCurrentPageSelected = currentPageIds.length > 0 && selectedCurrentPageCount === currentPageIds.length;
  const someCurrentPageSelected = selectedCurrentPageCount > 0 && !allCurrentPageSelected;

  function toggleSelection(id: string) {
    const next = new Set(selectedAppointmentIds);
    if (next.has(id)) {
      next.delete(id);
      onSelectAllActiveChange(false);
    } else next.add(id);
    onSelectionChange(next);
  }

  function toggleCurrentPageSelection() {
    const next = new Set(selectedAppointmentIds);
    if (allCurrentPageSelected) {
      currentPageIds.forEach((id) => next.delete(id));
      onSelectAllActiveChange(false);
    } else {
      currentPageIds.forEach((id) => next.add(id));
      onSelectAllActiveChange(true);
    }
    onSelectionChange(next);
  }

  useEffect(() => {
    if (!selectAllActive || currentPageIds.length === 0) return;
    const next = new Set(selectedAppointmentIds);
    currentPageIds.forEach((id) => next.add(id));
    if (next.size !== selectedAppointmentIds.size) onSelectionChange(next);
  }, [appointments, currentPageIds, onSelectionChange, selectAllActive, selectedAppointmentIds]);

  return (
    <>
      <BulkStatusToolbar
        selectedCount={selectedCurrentPageCount}
        selectedIds={selectedCurrentPageIds}
        isBusy={busyId !== null}
        onStatusChange={onBulkStatusChange}
      />
      {/*
        MOBILE (below sm, 640px): a stacked list of cards instead of the
        desktop table. Squeezing a 6-column table onto a 320-430px screen
        would force horizontal scrolling to read Status, so below `sm` this
        renders full-width cards instead — every field is visible without
        scrolling sideways. Manage/view/delete happens via the compact icon
        row next to the patient's name, same as the desktop table. Hidden at
        sm+ where the table takes over.
      */}
      <div className="mb-2 flex items-center gap-2 sm:hidden">
        <input
          type="checkbox"
          checked={allCurrentPageSelected}
          ref={(element) => {
            if (element) element.indeterminate = someCurrentPageSelected;
          }}
          onChange={toggleCurrentPageSelection}
          aria-label="Select all appointments on this page"
          className="admin-selection-checkbox"
        />
        <span className="text-xs font-medium text-[var(--admin-text-soft)]">
          Select All{selectedCurrentPageCount > 0 ? ` (${selectedCurrentPageCount} selected)` : ""}
        </span>
      </div>
      <ul className="flex flex-col gap-3 sm:hidden">
        {appointments.map((appointment) => {
          const isBusy = busyId === appointment.id;
          const isEditing = editingTreatmentId === appointment.id;
          const editDisabled =
            busyId !== null || (editingTreatmentId !== null && editingTreatmentId !== appointment.id);

          return (
            <li
              key={appointment.id}
              className={`admin-appointment-card flex flex-col gap-2.5 rounded-2xl border bg-[var(--admin-surface-strong)] p-3 shadow-sm ${selectedAppointmentIds.has(appointment.id) ? "admin-appointment-card-selected" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedAppointmentIds.has(appointment.id)}
                    onChange={() => toggleSelection(appointment.id)}
                    aria-label={`Select appointment for ${appointment.patient_name}`}
                    className="admin-selection-checkbox shrink-0"
                  />
                  <button type="button" onClick={() => onPatientOpen(appointment)} aria-label={`View patient details for ${appointment.patient_name}`} title={`View patient details for ${appointment.patient_name}`} className="group inline-flex min-w-0 items-center gap-2 rounded-md text-left transition-colors hover:bg-[var(--admin-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-link)]">
                    <span className={`admin-patient-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getPatientAvatarStyle(appointment.patient_name)}`}>
                      {getPatientInitials(appointment.patient_name)}
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 break-words font-medium text-ink">{appointment.patient_name}</span>
                      <span aria-hidden="true" className="inline-flex h-10 w-10 shrink-0 items-center justify-start text-[var(--admin-link)] transition-colors group-hover:text-[var(--admin-link-strong)]">
                        <ExternalLinkIcon />
                      </span>
                    </span>
                  </button>
                  {isConfirmedAppointmentPast(appointment) ? <MissedAppointmentAlert /> : null}
                </div>
                <div className="flex items-center justify-end">
                  <ActionCell
                    appointment={appointment}
                    isBusy={isBusy}
                    onArchiveRequest={onArchiveRequest}
                  />
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                <div className="col-start-1 row-start-2 min-w-0">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-soft)]">
                    Treatment
                  </dt>
                  <dd className="mt-0.5 min-w-0 text-xs text-[var(--admin-text)]">
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
                <div className="col-start-1 row-start-1">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-soft)]">
                    Requested
                  </dt>
                  <dd className="mt-0.5 whitespace-nowrap text-[10px] text-[var(--admin-text-soft)]">
                    {formatCreatedAtDate(appointment.created_at)}, {formatCreatedAtTime(appointment.created_at)}
                  </dd>
                </div>
                <div className="col-span-2 row-start-4 flex min-w-0 items-center gap-2">
                  <button type="button" onClick={() => onPatientOpen(appointment)} className="inline-flex shrink-0 rounded-full bg-[var(--admin-status-selected-bg)] px-2 py-1 text-xs font-semibold text-[var(--admin-status-selected-text)]" title={`Open ${appointment.patient_name} visit history`}>{visitCounts.get(appointment.phone) ?? 0} {visitCounts.get(appointment.phone) === 1 ? "visit" : "visits"}</button>
                  <div className="min-w-0 flex-1">
                    <MessageCell message={appointment.message} />
                  </div>
                </div>
                <div className="col-start-2 row-start-2 min-w-0">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-soft)]">Status</dt>
                  <dd className="mt-0.5 min-w-0">
                    <StatusCell
                      appointment={appointment}
                      isBusy={isBusy}
                      onStatusChange={onStatusChange}
                    />
                  </dd>
                </div>
                <div className="col-start-2 row-start-1 min-w-0">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--admin-text-soft)]">
                    Appointment Date
                  </dt>
                  <dd className="mt-0.5 text-xs text-[var(--admin-text)]">
                    <PreferredDateTimeCell
                      appointment={appointment}
                      busyId={busyId}
                      compact
                      onPreferredDateTimeUpdate={onPreferredDateTimeUpdate}
                    />
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>

      {/* DESKTOP / TABLET (sm and up, 640px+): Patient | Treatment | Preferred | Message | Status | Requested | Actions. The missed-appointment warning sits under the patient name; the compact action icons live in their own right-side column. */}
      <div className="admin-appointments-table relative z-10 hidden overflow-visible rounded-2xl border border-line bg-[var(--admin-surface-strong)] shadow-sm sm:block">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="admin-appointments-header border-b border-line text-xs uppercase tracking-[0.12em] text-[var(--admin-text-soft)]">
              <tr>
                <th className="admin-table-header w-[82px] px-2 py-2 text-center font-semibold">
                  <label className="inline-flex cursor-pointer flex-col items-center justify-center gap-1 normal-case tracking-normal">
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      ref={(element) => {
                        if (element) element.indeterminate = someCurrentPageSelected;
                      }}
                      onChange={toggleCurrentPageSelection}
                      aria-label="Select all appointments on this page"
                      className="admin-selection-checkbox"
                    />
                    <span className="text-[10px] font-semibold leading-none text-[var(--admin-text-soft)]">Select all</span>
                  </label>
                </th>
                <th className="admin-table-header px-4 py-2 font-semibold">Patient{selectedCurrentPageCount > 0 ? ` (${selectedCurrentPageCount} selected)` : ""}</th>
                <th className="admin-table-header px-4 py-2 font-semibold">Treatment</th>
                <th className="admin-table-header px-4 py-2 font-semibold">Visits</th>
                <th className="admin-table-header px-4 py-2 font-semibold">Requested</th>
                <th className="admin-table-header px-4 py-2 font-semibold">Message</th>
                <th className="admin-table-header px-4 py-2 font-semibold">Status</th>
                <th className="admin-table-header px-4 py-2 font-semibold">Appointment Date</th>
                <th className="admin-table-header px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const isBusy = busyId === appointment.id;
                const isEditing = editingTreatmentId === appointment.id;

                return (
                  <tr
                    key={appointment.id}
                    className={`admin-appointment-row border-b border-line last:border-b-0 hover:bg-[var(--admin-surface)] ${selectedAppointmentIds.has(appointment.id) ? "admin-appointment-row-selected" : ""}`}
                  >
                    <td className="w-[82px] px-2 py-2 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={selectedAppointmentIds.has(appointment.id)}
                        onChange={() => toggleSelection(appointment.id)}
                        aria-label={`Select appointment for ${appointment.patient_name}`}
                        className="admin-selection-checkbox"
                      />
                    </td>
                    <td className="px-4 py-2 align-middle font-medium text-[var(--admin-text)]">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <button type="button" onClick={() => onPatientOpen(appointment)} aria-label={`View patient details for ${appointment.patient_name}`} title={`View patient details for ${appointment.patient_name}`} className="group inline-flex min-w-0 items-center gap-2 rounded-md text-left transition-colors hover:bg-[var(--admin-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-link)]">
                          <span className={`admin-patient-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getPatientAvatarStyle(appointment.patient_name)}`}>
                            {getPatientInitials(appointment.patient_name)}
                          </span>
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="admin-appointment-selected-text min-w-0 break-words font-medium text-[var(--admin-text)]">{appointment.patient_name}</span>
                            <span aria-hidden="true" className="inline-flex h-10 w-10 shrink-0 items-center justify-start text-[var(--admin-link)] transition-colors group-hover:text-[var(--admin-link-strong)]">
                              <ExternalLinkIcon />
                            </span>
                          </span>
                        </button>
                        {isConfirmedAppointmentPast(appointment) ? <MissedAppointmentAlert /> : null}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-middle text-[var(--admin-text)]">
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
                    <td className="px-4 py-2 align-middle text-[var(--admin-text)]">
                      <button type="button" onClick={() => onPatientOpen(appointment)} className="admin-appointment-selected-text inline-flex rounded-full bg-[var(--admin-status-selected-bg)] px-2 py-1 text-xs font-semibold text-[var(--admin-status-selected-text)]" title={`Open ${appointment.patient_name} visit history`}>{visitCounts.get(appointment.phone) ?? 0} {visitCounts.get(appointment.phone) === 1 ? "visit" : "visits"}</button>
                    </td>
                    <td className="px-4 py-2 align-middle text-[var(--admin-text-soft)]">
                      <div className="leading-snug">
                        <div className="admin-appointment-selected-text whitespace-nowrap">{formatCreatedAtDate(appointment.created_at)}</div>
                        <div className="admin-appointment-selected-text whitespace-nowrap">{formatCreatedAtTime(appointment.created_at)}</div>
                      </div>
                    </td>
                    <td className="w-[220px] max-w-[220px] px-4 py-2 align-middle text-[var(--admin-text)]">
                      <MessageCell message={appointment.message} />
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <StatusCell
                        appointment={appointment}
                        isBusy={isBusy}
                        onStatusChange={onStatusChange}
                      />
                    </td>
                    <td className="px-4 py-2 align-middle text-[var(--admin-text)]">
                      <PreferredDateTimeCell
                        appointment={appointment}
                        busyId={busyId}
                        onPreferredDateTimeUpdate={onPreferredDateTimeUpdate}
                      />
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <ActionCell
                        appointment={appointment}
                        isBusy={isBusy}
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
