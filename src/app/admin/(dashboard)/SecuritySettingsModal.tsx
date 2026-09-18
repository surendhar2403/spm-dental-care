"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SecurityForm = "admin" | null;

interface SecuritySettingsModalProps {
  onClose: () => void;
}

const initialFields = {
  current: "",
  next: "",
  confirm: "",
};

export default function SecuritySettingsModal({ onClose }: SecuritySettingsModalProps) {
  const [activeForm, setActiveForm] = useState<SecurityForm>(null);
  const [fields, setFields] = useState(initialFields);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  function openForm(form: SecurityForm) {
    setActiveForm(form);
    setFields(initialFields);
    setError("");
    setMessage("");
  }

  function updateField(field: keyof typeof initialFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setError("");
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeForm) return;
    if (fields.next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (fields.next !== fields.confirm) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (activeForm === "admin" && !fields.current) {
      setError("Please enter the current Admin password.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");
    const supabase = createClient();

    try {
      if (activeForm === "admin") {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData.user?.email;
        if (!email) {
          setError("Unable to verify the current Admin account.");
          return;
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: fields.current });
        if (signInError) {
          setError("Incorrect current Admin password.");
          return;
        }
        const { error: updateError } = await supabase.auth.updateUser({ password: fields.next });
        if (updateError) {
          setError(updateError.message || "Unable to update the Admin password.");
          return;
        }
      }

      setFields(initialFields);
      setActiveForm(null);
      setMessage("Admin password updated.");
    } catch {
      setError("Unable to update the password right now.");
    } finally {
      setIsSaving(false);
    }
  }

  const formTitle = "Change Admin Password";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="security-settings-title" className="w-full max-w-md rounded-card border border-line bg-[var(--admin-surface-strong)] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="security-settings-title" className="text-lg font-semibold text-[var(--admin-heading)]">Security</h2>
            <p className="mt-1 text-xs text-[var(--admin-text-soft)]">Manage the Admin account securely.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="Close security settings" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface)] disabled:opacity-50">×</button>
        </div>

        {!activeForm ? (
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-line bg-[var(--admin-surface)] p-3">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm font-semibold text-[var(--admin-heading)]">Admin Account</p><p className="mt-1 text-xs text-[var(--admin-text-soft)]">Admin Password</p></div>
                <button type="button" onClick={() => openForm("admin")} className="rounded-full bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800">Change Password</button>
              </div>
            </div>
            {error ? <p role="alert" className="text-xs text-red-600">{error}</p> : null}
            {message ? <p className="text-xs text-emerald-700">{message}</p> : null}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--admin-heading)]">{formTitle}</h3>
            <PasswordField label="Current Password" value={fields.current} onChange={(value) => updateField("current", value)} disabled={isSaving} />
            <PasswordField label="New Password" value={fields.next} onChange={(value) => updateField("next", value)} disabled={isSaving} />
            <PasswordField label="Confirm New Password" value={fields.confirm} onChange={(value) => updateField("confirm", value)} disabled={isSaving} />
            {error ? <p role="alert" className="text-xs text-red-600">{error}</p> : null}
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => openForm(null)} disabled={isSaving} className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-surface)]">Cancel</button><button type="submit" disabled={isSaving} className="rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{isSaving ? "Updating..." : "Update Password"}</button></div>
          </form>
        )}
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block text-xs font-medium text-[var(--admin-text)]">
      {label}
      <span className="relative mt-1.5 block">
        <input type={isVisible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} minLength={8} className="w-full rounded-lg border border-line bg-[var(--admin-surface)] px-3 py-2.5 pr-10 text-sm text-[var(--admin-text)] focus:border-blue-600 focus:outline-none disabled:opacity-60" />
        <button type="button" onClick={() => setIsVisible((visible) => !visible)} disabled={disabled} aria-label={isVisible ? `Hide ${label}` : `Show ${label}`} title={isVisible ? `Hide ${label}` : `Show ${label}`} className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--admin-text-soft)] hover:bg-[var(--admin-surface-strong)] disabled:opacity-50">
          {isVisible ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" /><path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5 0 8.7 4 9.8 6-.4.8-1.2 2-2.5 3.1" /><path d="M6.1 6.1C4.3 7.3 3.2 9 2.2 10.5" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M2.2 12s3.5-6 9.8-6 9.8 6 9.8 6-3.5 6-9.8 6-9.8-6-9.8-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
          )}
        </button>
      </span>
    </label>
  );
}
