"use client";

import { useEffect, useRef, useState } from "react";

interface StatusUpdateToastData {
  id: number;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function StatusUpdateToast({
  toast,
  onDismiss,
}: {
  toast: StatusUpdateToastData | null;
  onDismiss: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const onDismissRef = useRef(onDismiss);

  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!toast) return;

    setIsVisible(false);
    const enterFrame = requestAnimationFrame(() => setIsVisible(true));
    const closeTimer = window.setTimeout(() => setIsVisible(false), 8000);
    const removeTimer = window.setTimeout(() => onDismissRef.current(), 8400);

    return () => {
      cancelAnimationFrame(enterFrame);
      window.clearTimeout(closeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [toast?.id]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`admin-action-toast fixed bottom-5 left-1/2 z-[100] flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium shadow-lg transition-all duration-400 ease-out sm:bottom-6 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <span
        className="admin-action-toast-icon flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
        >
          <path d="m4 10 4 4 8-8" />
        </svg>
      </span>
      <span>{toast.message}</span>
      {toast.action ? (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
          className="ml-1 shrink-0 px-1 py-0.5 text-[11px] font-semibold underline underline-offset-2 transition-opacity hover:opacity-75"
        >
          {toast.action.label}
        </button>
      ) : null}
    </div>
  );
}