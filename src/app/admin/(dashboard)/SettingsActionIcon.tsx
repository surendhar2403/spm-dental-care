"use client";

import type { ButtonHTMLAttributes } from "react";

export type SettingsActionIconName = "edit" | "trash" | "eye" | "eye-off" | "x" | "upload" | "chevron-up" | "chevron-down";

interface SettingsActionIconProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: SettingsActionIconName;
  label: string;
  tone?: "neutral" | "danger" | "success" | "warning";
}

export default function SettingsActionIcon({
  icon,
  label,
  tone = "neutral",
  className = "",
  ...props
}: SettingsActionIconProps) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      aria-label={label}
      title={label}
      className={`admin-settings-icon-button admin-settings-icon-button-${tone} ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {icon === "edit" ? <path d="m4 16.5-.8 3.3 3.3-.8L18.8 6.7a2.3 2.3 0 0 0-3.3-3.3L4 16.5Z" /> : null}
        {icon === "trash" ? <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></> : null}
        {icon === "eye" ? <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.75" /></> : null}
        {icon === "eye-off" ? <><path d="m3 3 18 18M10.6 5.8A10.8 10.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.2 3.7M6.2 6.3C3.8 8.1 2.5 12 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.2 3.3-.6" /><path d="M9.9 9.9a2.75 2.75 0 0 0 3.9 3.9" /></> : null}
        {icon === "x" ? <><path d="m6 6 12 12M18 6 6 18" /></> : null}
        {icon === "upload" ? <><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M5 20h14" /></> : null}
        {icon === "chevron-up" ? <path d="m6 14 6-6 6 6" /> : null}
        {icon === "chevron-down" ? <path d="m6 10 6 6 6-6" /> : null}
      </svg>
    </button>
  );
}
