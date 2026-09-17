"use client";

import type { SVGProps } from "react";
import { useState } from "react";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/utils";
import type { Appointment } from "@/types/admin";
import {
  STATUS_STYLES,
  formatDate,
  formatStatusLabel,
  formatTime,
} from "./appointmentDisplay";

interface TodaysAppointmentsProps {
  /** Appointments already filtered down to today's preferred_date. */
  appointments: Appointment[];
  onViewRequest: (appointment: Appointment) => void;
}

function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .5 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8Z" />
    </svg>
  );
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.6 14.3c-.2.6-1.4 1.2-2 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1 0-1.5.8-2.2 1-2.5.3-.3.6-.4.9-.4h.6c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.1.6.2.3.8 1.3 1.8 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.5.2.5.3.1.2.1.6-.1 1.2Z" />
    </svg>
  );
}

function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M16 2.5v4M8 2.5v4M3 9.5h18" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function TodaysAppointments({
  appointments,
  onViewRequest,
}: TodaysAppointmentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // preferred_time can be null (patient hasn't been given a confirmed time
  // yet) — push those to the end instead of ahead of timed appointments.
  const sorted = [...appointments].sort((a, b) =>
    (a.preferred_time ?? "\uffff").localeCompare(b.preferred_time ?? "\uffff"),
  );

  return (
    <section
      aria-labelledby="todays-appointments-heading"
      className="overflow-hidden rounded-card border border-line bg-canvas"
    >
      <button
        type="button"
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
        aria-controls="todays-appointments-content"
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--admin-surface)]"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CalendarIcon className="h-5 w-5 shrink-0 text-[var(--admin-link)]" aria-hidden="true" />
          <span id="todays-appointments-heading" className="admin-heading truncate font-display text-base text-[var(--admin-text)]">
            Today&apos;s Appointments
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[var(--admin-text-soft)]">
          <span className="font-semibold text-[var(--admin-success)]">
            {sorted.length} {sorted.length === 1 ? "appointment" : "appointments"}
          </span>
          <ChevronIcon
            className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </span>
      </button>

      <div
        id="todays-appointments-content"
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-line p-3">
            {sorted.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line bg-canvas-soft px-4 py-5 text-center text-sm text-[var(--admin-text-soft)]">
                No appointments scheduled for today.
              </div>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {sorted.map((appointment) => {
                  const dateTime = `${formatDate(appointment.preferred_date)}, ${formatTime(appointment.preferred_time)}`;

                  return (
                    <li
                      key={appointment.id}
                      className="flex min-w-0 flex-col gap-2 rounded-lg border border-line bg-canvas-soft px-3 py-2 text-sm transition-colors hover:bg-[var(--admin-surface)] md:grid md:grid-cols-[minmax(5rem,0.7fr)_minmax(7rem,1fr)_minmax(8rem,1.4fr)_auto] md:items-center md:gap-3"
                    >
                      <span className="text-xs font-semibold text-[var(--admin-text-soft)]">
                        {formatTime(appointment.preferred_time)}
                      </span>

                      <span className="truncate font-medium text-[var(--admin-text)]">
                        {appointment.patient_name}
                      </span>
                      <span className="flex min-w-0 flex-col text-xs text-[var(--admin-text-soft)] sm:flex-row sm:items-center sm:gap-2">
                        <span className="truncate">{appointment.treatment}</span>
                        <span className="hidden text-[var(--admin-border)] sm:inline" aria-hidden="true">•</span>
                        <span className="truncate">{dateTime}</span>
                      </span>

                      <div className="flex items-center justify-between gap-3 md:justify-end">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold leading-none ${STATUS_STYLES[appointment.status]}`}>
                          {formatStatusLabel(appointment.status)}
                        </span>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <a
                            href={buildTelUrl(appointment.phone)}
                            aria-label="Call patient"
                            title="Call patient"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--admin-link)] transition-colors hover:bg-[var(--admin-surface)] hover:text-[var(--admin-link-strong)]"
                          >
                            <PhoneIcon className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={buildWhatsAppUrl(appointment.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open WhatsApp"
                            title="Open WhatsApp"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--admin-success)] transition-colors hover:bg-[var(--admin-surface)]"
                          >
                            <WhatsAppIcon className="h-3.5 w-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => onViewRequest(appointment)}
                            aria-label="View appointment"
                            title="View appointment"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--admin-text-soft)] transition-colors hover:bg-[var(--admin-surface)] hover:text-[var(--admin-text)]"
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
