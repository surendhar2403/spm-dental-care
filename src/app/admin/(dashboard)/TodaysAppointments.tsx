"use client";

import { buildTelUrl, buildWhatsAppUrl } from "@/lib/utils";
import type { Appointment } from "@/types/admin";
import { STATUS_STYLES, formatTime } from "./appointmentDisplay";

interface TodaysAppointmentsProps {
  /** Appointments already filtered down to today's preferred_date. */
  appointments: Appointment[];
  onViewRequest: (appointment: Appointment) => void;
}

export default function TodaysAppointments({
  appointments,
  onViewRequest,
}: TodaysAppointmentsProps) {
  // preferred_time can be null (patient hasn't been given a confirmed time
  // yet) — push those to the end instead of ahead of timed appointments.
  const sorted = [...appointments].sort((a, b) =>
    (a.preferred_time ?? "\uffff").localeCompare(b.preferred_time ?? "\uffff"),
  );

  return (
    <section
      aria-labelledby="todays-appointments-heading"
      className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-4"
    >
      <div className="flex items-center justify-between">
        <h2 id="todays-appointments-heading" className="font-display text-lg text-ink">
          Today&apos;s Appointments
        </h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {sorted.length}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-canvas-soft p-6 text-center text-sm text-ink/60">
          No appointments scheduled for today.
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {sorted.map((appointment) => (
            <li
              key={appointment.id}
              className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">{appointment.patient_name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[appointment.status]}`}
                  >
                    {appointment.status}
                  </span>
                </div>
                <div className="text-sm text-ink/70">
                  {appointment.treatment} · {formatTime(appointment.preferred_time)}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
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
                <button
                  type="button"
                  onClick={() => onViewRequest(appointment)}
                  className="font-medium text-blue-900 hover:underline"
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
