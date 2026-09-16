"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LogoutButton from "./LogoutButton";
import {
  ADMIN_THEMES,
  applyAdminTheme,
  getStoredAdminDarkMode,
  getStoredAdminTheme,
  type AdminThemeKey,
} from "@/lib/adminTheme";

function DarkModeToggleButton({
  isDarkMode,
  onToggle,
}: {
  isDarkMode: boolean;
  onToggle: () => void;
}) {
  const label = isDarkMode ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onToggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas text-ink transition-colors hover:bg-canvas-soft focus:outline-none focus:ring-2 focus:ring-blue-600"
    >
      {isDarkMode ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
          <path d="M21 12.8A8.8 8.8 0 0 1 11.2 3a8.8 8.8 0 1 0 9.8 9.8Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

export default function AdminHeaderSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<AdminThemeKey>("soft-blue");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({ position: "fixed" });
  const [colorMenuStyle, setColorMenuStyle] = useState<React.CSSProperties>({ position: "fixed" });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const colorMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = getStoredAdminTheme();
    setSelectedTheme(savedTheme);
    setIsDarkMode(getStoredAdminDarkMode());
  }, []);

  useEffect(() => {
    applyAdminTheme(selectedTheme, isDarkMode);
  }, [selectedTheme, isDarkMode]);

  useEffect(() => {
    if (!isOpen && !isColorMenuOpen) return;

    function updateMenuPosition() {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 24);
      const left = Math.min(Math.max(rect.right - width, 12), window.innerWidth - width - 12);
      const maxTop = Math.max(12, window.innerHeight - 320);
      const top = Math.min(rect.bottom + 8, maxTop);

      setMenuStyle({
        position: "fixed",
        top,
        left,
        width,
        maxWidth: "calc(100vw - 24px)",
        zIndex: 9999,
      });
    }

    function updateColorMenuPosition() {
      if (!isColorMenuOpen || !menuRef.current) return;

      const menuRect = menuRef.current.getBoundingClientRect();
      const width = Math.min(260, window.innerWidth - 24);
      const left = menuRect.right + 8 + width <= window.innerWidth - 12
        ? menuRect.right + 8
        : Math.max(12, menuRect.left - width - 8);
      const top = Math.min(menuRect.top + 8, Math.max(12, window.innerHeight - 260));

      setColorMenuStyle({
        position: "fixed",
        top,
        left,
        width,
        maxWidth: "calc(100vw - 24px)",
        zIndex: 10000,
      });
    }

    updateMenuPosition();
    updateColorMenuPosition();

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && menuRef.current.contains(target)) {
        if (colorMenuRef.current && colorMenuRef.current.contains(target)) {
          return;
        }
        return;
      }
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }
      if (colorMenuRef.current && colorMenuRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
      setIsColorMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsColorMenuOpen(false);
      }
    }

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("resize", updateColorMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("scroll", updateColorMenuPosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("resize", updateColorMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("scroll", updateColorMenuPosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isColorMenuOpen]);

  function triggerAction(action: "doctors" | "treatments" | "testimonials" | "clinic" | "bin") {
    window.dispatchEvent(
      new CustomEvent("admin-settings-action", {
        detail: { action },
      }),
    );
    setIsOpen(false);
    setIsColorMenuOpen(false);
  }

  const menuContent = isOpen ? (
    <div
      ref={menuRef}
      style={menuStyle}
      className="max-h-[calc(100vh-24px)] overflow-y-auto overflow-x-hidden rounded-xl border border-line bg-canvas p-1.5 shadow-lg shadow-ink/10"
    >
      <div className="flex flex-col gap-1"> 
        <button
          type="button"
          onClick={() => setIsColorMenuOpen((open) => !open)}
          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink whitespace-nowrap transition-colors hover:bg-canvas-soft"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center text-base leading-none">🎨</span>
            <span>Admin Appearance</span>
          </span>
          <span aria-hidden="true" className="text-base text-ink/70">›</span>
        </button>

        <button
          type="button"
          onClick={() => triggerAction("doctors")}
          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink whitespace-nowrap transition-colors hover:bg-canvas-soft"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center text-base leading-none">🩺</span>
            <span>Manage Doctors</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => triggerAction("treatments")}
          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink whitespace-nowrap transition-colors hover:bg-canvas-soft"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center text-base leading-none">🦷</span>
            <span>Manage Treatments</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => triggerAction("testimonials")}
          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink whitespace-nowrap transition-colors hover:bg-canvas-soft"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center text-base leading-none">⭐</span>
            <span>Manage Reviews</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => triggerAction("clinic")}
          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink whitespace-nowrap transition-colors hover:bg-canvas-soft"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center text-base leading-none">🏥</span>
            <span>Manage Clinic Info</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => triggerAction("bin")}
          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink whitespace-nowrap transition-colors hover:bg-canvas-soft"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center text-base leading-none">🗑️</span>
            <span>Recently Deleted</span>
          </span>
          <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-canvas-soft px-1.5 py-0.5 text-xs font-semibold text-ink/70">
            5
          </span>
        </button>

        <div className="my-1 h-px bg-line" />

        <LogoutButton menuItem />
      </div>
    </div>
  ) : null;

  const colorMenuContent = isColorMenuOpen ? (
    <div
      ref={colorMenuRef}
      style={colorMenuStyle}
      className="max-h-[calc(100vh-24px)] overflow-y-auto overflow-x-hidden rounded-xl border border-line bg-canvas p-1.5 shadow-lg shadow-ink/10"
    >
      <div className="flex flex-col gap-1">
        {ADMIN_THEMES.map((theme) => {
          const isSelected = selectedTheme === theme.key;

          return (
            <button
              key={theme.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                setSelectedTheme(theme.key);
                setIsColorMenuOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-canvas-soft"
            >
              <span className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-5 w-5 rounded-full border border-line"
                  style={{ backgroundColor: theme.color }}
                />
                <span>{theme.name}</span>
              </span>

              {isSelected ? (
                <span aria-label="Selected theme" className="text-base text-blue-600">
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative flex items-center gap-2">
      <DarkModeToggleButton isDarkMode={isDarkMode} onToggle={() => setIsDarkMode((value) => !value)} />

      <button
        ref={buttonRef}
        type="button"
        aria-label="Open settings menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas text-ink transition-colors hover:bg-canvas-soft focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.86l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15.8 19.4a1.7 1.7 0 0 0-1.08 1.57V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9.6 19.4a1.7 1.7 0 0 0-1.86.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15.8a1.7 1.7 0 0 0-1.57-1.08H2.94a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9.6a1.7 1.7 0 0 0-.34-1.86l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9.6 4.6a1.7 1.7 0 0 0 1.08-1.57V2.94a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.8 4.6a1.7 1.7 0 0 0 1.86-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9.6a1.7 1.7 0 0 0 1.57 1.08h.09a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
        </svg>
      </button>

      {isOpen && typeof document !== "undefined" ? createPortal(menuContent, document.body) : null}
      {isColorMenuOpen && typeof document !== "undefined" ? createPortal(colorMenuContent, document.body) : null}
    </div>
  );
}
