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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .5 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.6 14.3c-.2.6-1.4 1.2-2 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1 0-1.5.8-2.2 1-2.5.3-.3.6-.4.9-.4h.6c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.1.6.2.3.8 1.3 1.8 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.5.2.5.3.1.2.1.6-.1 1.2Z" />
    </svg>
  );
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

  const visitHistory = [...appointments].sort((a, b) => {
    const getScheduledTime = (appointment: Appointment) => {
      const scheduled = new Date(`${appointment.preferred_date}T${appointment.preferred_time ?? "00:00"}`).getTime();
      return Number.isNaN(scheduled) ? new Date(appointment.created_at).getTime() : scheduled;
    };

    return getScheduledTime(b) - getScheduledTime(a) || b.created_at.localeCompare(a.created_at);
  });
  const firstVisit = visitHistory[visitHistory.length - 1] ?? appointments[appointments.length - 1];
  const lastVisit = visitHistory[0] ?? appointments[0];
  const latestMessage = [...appointments]
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
              <div className="mt-1 flex items-center gap-3">
                <a href={buildTelUrl(patient.phone)} aria-label={`Call ${patient.phone}`} title={`Call ${patient.phone}`} className="inline-flex min-h-9 items-center gap-1.5 text-sm text-[var(--admin-link)] hover:underline">
                  <PhoneIcon />
                  <span>{patient.phone}</span>
                </a>
                <a href={buildWhatsAppUrl(patient.phone)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${patient.phone}`} title={`WhatsApp ${patient.phone}`} className="inline-flex h-9 w-9 items-center justify-center text-[var(--admin-success)] hover:opacity-80">
                  <WhatsAppIcon />
                </a>
              </div>
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
              {visitHistory.length === 0 ? <p className="rounded-xl border border-dashed border-line p-4 text-sm text-[var(--admin-text-soft)]">No visits yet.</p> : visitHistory.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-[var(--admin-surface)] p-3">
                  <div className="min-w-0"><p className="text-sm font-semibold text-[var(--admin-text)]">{formatDate(appointment.preferred_date)}</p><p className="text-xs text-[var(--admin-text-soft)]">{formatTime(appointment.preferred_time)}</p></div>
                  <p className="min-w-0 flex-1 truncate text-sm text-[var(--admin-text)]">{appointment.treatment}</p>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${STATUS_STYLES[appointment.status]}`}>{formatStatusLabel(appointment.status)}</span>
                </div>
              ))}
            </div>
          ) : (
            <dl className="mt-3 divide-y divide-[var(--admin-border)] rounded-xl border border-line bg-[var(--admin-surface)] px-3">
              <div className="flex justify-between gap-3 py-3"><dt className="text-xs text-[var(--admin-text-soft)]">Name</dt><dd className="text-right text-sm font-medium text-[var(--admin-text)]">{patient.patient_name}</dd></div>
              <div className="flex justify-between gap-3 py-3"><dt className="text-xs text-[var(--admin-text-soft)]">Mobile</dt><dd className="text-right text-sm font-medium text-[var(--admin-text)]">{patient.phone}</dd></div>
              <div className="flex justify-between gap-3 py-3"><dt className="text-xs text-[var(--admin-text-soft)]">Appointments</dt><dd className="text-right text-sm font-medium text-[var(--admin-text)]">{appointments.length}</dd></div>
              <div className="flex flex-col gap-1 py-3"><dt className="text-xs text-[var(--admin-text-soft)]">Message</dt><dd className="text-sm font-medium text-[var(--admin-text)]">{latestMessage || "No message available."}</dd></div>
            </dl>
          )}

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
