"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Automatic, read-only visual warning — NOT a status. Shown alongside a
 * CONFIRMED appointment's status once its scheduled date & time have
 * passed (see isConfirmedAppointmentPast in appointmentDisplay.ts). This is
 * intentionally a compact indicator-only alert so the patient row stays on a
 * single line without creating extra vertical space.
 */
export default function MissedAppointmentAlert({ className = "" }: { className?: string }) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isVisible) return;

    const updateTooltipPosition = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      if (!trigger || !tooltip) return;

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth || 170;
      const tooltipHeight = tooltip.offsetHeight || 24;
      const padding = 8;
      const gap = 10;

      let top = triggerRect.top - tooltipHeight - gap;
      let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;

      if (top < padding) {
        top = triggerRect.bottom + gap;
      }

      left = Math.min(Math.max(left, padding), window.innerWidth - tooltipWidth - padding);
      top = Math.max(padding, top);

      setPosition({ top, left });
    };

    updateTooltipPosition();

    const handleWindowChange = () => updateTooltipPosition();
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, { passive: true });

    return () => {
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange);
    };
  }, [isVisible]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Appointment time has passed"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="admin-missed-alert-trigger relative inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500/90 shadow-sm ring-1 ring-red-200 transition-opacity hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
      />

      {isVisible && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={tooltipRef}
              role="tooltip"
              className="admin-missed-alert-tooltip pointer-events-none fixed whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white shadow-lg shadow-slate-900/20 dark:bg-slate-800"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 99999,
              }}
            >
              <span className="relative block">Appointment time has passed!</span>
              <span
                className="absolute left-1/2 top-full -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-slate-900 dark:border-t-slate-800"
                aria-hidden="true"
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
