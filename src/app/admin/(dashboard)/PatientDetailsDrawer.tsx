"use client";

import { useState } from "react";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/utils";
import type { Appointment } from "@/types/admin";
import { formatDate, formatStatusLabel, formatTime, STATUS_STYLES } from "./appointmentDisplay";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

export default function PatientDetailsDrawer({
  appointments,
  visitCount,
  onClose,
  onBookNewAppointment,
}: {
  appointments: Appointment[];
  visitCount: number;
  onClose: () => void;
  onBookNewAppointment: (patient: { name: string; phone: string }) => void;
}) {
  const [activeTab, setActiveTab] = useState<"history" | "personal">("history");
  const patient = appointments[0];
  if (!patient) return null;

  const completedVisits = appointments
    .filter((appointment) => appointment.status === "completed")
    .sort((a, b) => b.preferred_date.localeCompare(a.preferred_date) || b.created_at.localeCompare(a.created_at));
  const firstVisit = completedVisits[completedVisits.length - 1] ?? appointments[appointments.length - 1];
  const lastVisit = completedVisits[0] ?? appointments[0];
  const note = [...appointments]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .find((appointment) => appointment.message?.trim())?.message;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/35" role="presentation" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-details-heading"
        className="admin-patient-drawer flex h-full w-full max-w-md flex-col border-l border-line bg-[var(--admin-surface-strong)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3 sm:px-5">
          <h2 id="patient-details-heading" className="font-display text-lg text-[var(--admin-heading)]">Patient Details</h2>
          <button type="button" onClick={onClose} aria-label="Close patient details" title="Close patient details" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-[var(--admin-text-soft)] transition-colors hover:bg-[var(--admin-surface)] hover:text-[var(--admin-text)]">
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <section className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--admin-status-selected-bg)] text-sm font-bold text-[var(--admin-status-selected-text)]">
              {initials(patient.patient_name)}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-[var(--admin-text)]">{patient.patient_name}</h3>
              <a href={buildTelUrl(patient.phone)} className="mt-1 block text-sm text-[var(--admin-link)] hover:underline">{patient.phone}</a>
              <a href={buildWhatsAppUrl(patient.phone)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex text-xs font-semibold text-[var(--admin-success)] hover:underline">WhatsApp</a>
            </div>
            <div className="shrink-0 rounded-xl border border-[var(--admin-status-selected-border)] bg-[var(--admin-status-selected-bg)] px-3 py-2 text-center">
              <div className="text-xl font-bold text-[var(--admin-status-selected-text)]">{visitCount}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-status-selected-text)]">visits</div>
            </div>
          </section>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-line bg-[var(--admin-surface)] p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-soft)]">First Visit</p><p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">{firstVisit ? formatDate(firstVisit.preferred_date) : "—"}</p></div>
            <div className="rounded-xl border border-line bg-[var(--admin-surface)] p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-soft)]">Last Visit</p><p className="mt-1 text-sm font-semibold text-[var(--admin-text)]">{lastVisit ? formatDate(lastVisit.preferred_date) : "—"}</p></div>
          </div>

          <div className="mt-5 flex border-b border-line">
            <button type="button" onClick={() => setActiveTab("history")} className={`border-b-2 px-3 py-2 text-xs font-semibold ${activeTab === "history" ? "border-[var(--admin-link)] text-[var(--admin-link)]" : "border-transparent text-[var(--admin-text-soft)]"}`}>Visit History</button>
            <button type="button" onClick={() => setActiveTab("personal")} className={`border-b-2 px-3 py-2 text-xs font-semibold ${activeTab === "personal" ? "border-[var(--admin-link)] text-[var(--admin-link)]" : "border-transparent text-[var(--admin-text-soft)]"}`}>Personal Info</button>
          </div>

          {activeTab === "history" ? (
            <div className="mt-3 flex flex-col gap-2">
              {completedVisits.length === 0 ? <p className="rounded-xl border border-dashed border-line p-4 text-sm text-[var(--admin-text-soft)]">No completed visits yet.</p> : completedVisits.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-[var(--admin-surface)] p-3">
                  <div className="min-w-0"><p className="text-sm font-semibold text-[var(--admin-text)]">{formatDate(appointment.preferred_date)}</p><p className="text-xs text-[var(--admin-text-soft)]">{formatTime(appointment.preferred_time)}</p></div>
                  <p className="min-w-0 flex-1 truncate text-sm text-[var(--admin-text)]">{appointment.treatment}</p>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${STATUS_STYLES.completed}`}>{formatStatusLabel(appointment.status)}</span>
                </div>
              ))}
            </div>
          ) : (
            <dl className="mt-3 divide-y divide-[var(--admin-border)] rounded-xl border border-line bg-[var(--admin-surface)] px-3">
              <div className="flex justify-between gap-3 py-3"><dt className="text-xs text-[var(--admin-text-soft)]">Name</dt><dd className="text-right text-sm font-medium text-[var(--admin-text)]">{patient.patient_name}</dd></div>
              <div className="flex justify-between gap-3 py-3"><dt className="text-xs text-[var(--admin-text-soft)]">Mobile</dt><dd className="text-right text-sm font-medium text-[var(--admin-text)]">{patient.phone}</dd></div>
              <div className="flex justify-between gap-3 py-3"><dt className="text-xs text-[var(--admin-text-soft)]">Appointments</dt><dd className="text-right text-sm font-medium text-[var(--admin-text)]">{appointments.length}</dd></div>
            </dl>
          )}

          <section className="mt-5"><h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-soft)]">Notes</h3><p className="mt-2 rounded-xl border border-line bg-[var(--admin-surface)] p-3 text-sm text-[var(--admin-text-soft)]">{note || "No patient notes available."}</p></section>
        </div>

        <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-line p-4 sm:px-5">
          <a href={buildTelUrl(patient.phone)} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--admin-success)] px-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">Call</a>
          <a href={buildWhatsAppUrl(patient.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--admin-success)] px-3 text-sm font-semibold text-[var(--admin-success)] transition-colors hover:bg-[var(--admin-success)]/10">WhatsApp</a>
          <button type="button" onClick={() => onBookNewAppointment({ name: patient.patient_name, phone: patient.phone })} className="col-span-2 inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-900 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800">+ Book New Appointment</button>
        </footer>
      </aside>
    </div>
  );
}
