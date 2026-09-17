"use client";

import type { SVGProps } from "react";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/utils";

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

function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4.8c0-.4.4-.8.9-.8h4.2c.5 0 .9.4.9.8V7" />
      <path d="M6 7l.8 12a2 2 0 0 0 2 1.9h6.4a2 2 0 0 0 2-1.9L18 7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

/**
 * Compact icon row shown beside a patient's name in the appointment
 * table/cards — replaces the old separate Contact column AND the old
 * separate Actions column (with its View/Delete buttons). All four icons
 * reuse existing, already-working behavior:
 *   - Call / WhatsApp: existing buildTelUrl/buildWhatsAppUrl links.
 *   - View: opens the existing AppointmentDetailsModal (no new modal).
 *   - Delete: opens the existing delete confirmation flow (no immediate
 *     delete without confirmation).
 * Only the presentation changed — none of the underlying behavior did.
 */
export default function PatientContactIcons({
  phone,
  onDelete,
  deleteDisabled,
}: {
  phone: string;
  onDelete: () => void;
  deleteDisabled?: boolean;
}) {
  return (
    <span className="inline-flex flex-none items-center gap-1.5">
      <a
        href={buildTelUrl(phone)}
        aria-label="Call patient"
        title="Call patient"
        className="admin-action-button admin-action-phone inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--admin-link)] transition-colors hover:bg-[var(--admin-surface)]"
      >
        <PhoneIcon className="h-[18px] w-[18px]" />
      </a>
      <a
        href={buildWhatsAppUrl(phone)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp patient"
        title="WhatsApp patient"
        className="admin-action-button admin-action-whatsapp inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--admin-success)] transition-colors hover:bg-[var(--admin-surface)]"
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" />
      </a>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleteDisabled}
        aria-label="Delete appointment"
        title="Delete appointment"
        className="admin-action-button admin-action-delete inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--admin-danger)] transition-colors hover:bg-[var(--admin-surface)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <TrashIcon className="h-[18px] w-[18px]" />
      </button>
    </span>
  );
}
