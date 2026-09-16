"use client";

import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import AppointmentForm from "@/components/sections/AppointmentForm";
import { useAppointmentModal } from "@/components/appointment/AppointmentModalContext";

const MODAL_FORM_ID = "appointment-modal-form";
const MODAL_HEADING_ID = "appointment-modal-heading";

/**
 * Centered modal/dialog for the appointment form. Rendered once near the
 * root of the app; visibility is driven entirely by AppointmentModalContext
 * so any "Book Appointment" button anywhere on the site can open it.
 */
export default function AppointmentModal() {
  const { isOpen, closeModal } = useAppointmentModal();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock background scroll while the modal is open, restore it on close.
  useEffect(() => {
    if (!isOpen) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";

    return () => {
      style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  // Send focus into the dialog when it opens, for keyboard/screen-reader users.
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleOverlayMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    // Only close when the mousedown started on the overlay itself, not on
    // (or dragged from) the dialog card.
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-hidden bg-blue-900/60 p-4 py-4 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_HEADING_ID}
        className="relative w-full max-w-[42rem]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeModal}
          aria-label="Close appointment form"
          className="absolute -top-3 -right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas text-ink shadow-md transition-colors hover:bg-canvas-soft focus-visible:outline-none"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-card">
          <AppointmentForm
            formId={MODAL_FORM_ID}
            headingId={MODAL_HEADING_ID}
            idPrefix="modal-"
          />
        </div>
      </div>
    </div>
  );
}
