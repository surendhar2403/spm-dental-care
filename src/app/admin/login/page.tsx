"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Shown for both wrong-password and unknown-email cases, deliberately —
// never reveals which one it was.
const INVALID_CREDENTIALS_ERROR = "Incorrect email or password.";
const NOT_ADMIN_ERROR = "That account isn't authorized for the admin dashboard.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

function ToothMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
      <path d="M7.2 4.8C8.7 3.7 10.1 4.3 12 5c1.9-.7 3.3-1.3 4.8-.2 2.2 1.6 2 4.6 1.2 6.5-.7 1.7-1.1 5.7-2.4 7.2-.6.7-1.5.5-1.9-.4L12 13.3l-1.7 4.8c-.4.9-1.3 1.1-1.9.4C7.1 17 6.7 13 6 11.3c-.8-1.9-1-4.9 1.2-6.5Z" />
      <path d="M9 8.3c.8-.5 1.8-.5 3 0 1.2-.5 2.2-.5 3 0" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "not_admin" ? NOT_ADMIN_ERROR : null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !data.user) {
        // TEMP DIAGNOSTIC: log the real Supabase error so the actual cause
        // (bad credentials vs. misconfiguration vs. network/API-key issue)
        // is visible in the browser console, even though the UI still
        // shows the deliberately-vague message below.
        // eslint-disable-next-line no-console
        console.error("[admin login] signInWithPassword failed:", {
          message: signInError?.message,
          status: signInError?.status,
          name: signInError?.name,
          code: (signInError as { code?: string } | undefined)?.code,
        });
        setError(INVALID_CREDENTIALS_ERROR);
        setIsSubmitting(false);
        return;
      }

      // Confirm this is actually an admin (public.admins), not just any
      // authenticated Supabase user, before treating sign-in as successful.
      // Uses the is_admin() RPC (SECURITY DEFINER) rather than querying
      // public.admins directly, so this doesn't depend on the calling
      // role having its own SELECT grant on that table.
      const { data: isAdmin, error: adminCheckError } = await supabase.rpc("is_admin");

      if (adminCheckError || !isAdmin) {
        // TEMP DIAGNOSTIC: same as above — log the real error behind the
        // "not authorized" message so a genuine RPC/permission failure
        // isn't indistinguishable from "signed in but not an admin".
        // eslint-disable-next-line no-console
        console.error("[admin login] is_admin() check failed:", {
          isAdmin,
          message: adminCheckError?.message,
          code: (adminCheckError as { code?: string } | undefined)?.code,
          details: (adminCheckError as { details?: string } | undefined)?.details,
          hint: (adminCheckError as { hint?: string } | undefined)?.hint,
        });
        await supabase.auth.signOut();
        setError(NOT_ADMIN_ERROR);
        setIsSubmitting(false);
        return;
      }

      router.push(redirectedFrom || "/admin");
      router.refresh();
    } catch (err) {
      // TEMP DIAGNOSTIC: this branch is what actually shows
      // "Something went wrong. Please try again." — it only runs when
      // something THROWS (missing env vars in createClient(), a network/
      // fetch failure, an unexpected exception inside supabase-js), never
      // for a normal Supabase auth error object. Logging the real error
      // here is the fastest way to tell those cases apart.
      // eslint-disable-next-line no-console
      console.error("[admin login] unexpected exception:", err);
      const detail = err instanceof Error ? err.message : String(err);
      setError(`${GENERIC_ERROR} (${detail})`);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4faf9] px-4 py-8 text-[#12304a] sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-[#deefed]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full border-[22px] border-[#d7ebe8] opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full border-[18px] border-[#e4f2f0] opacity-80" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-md">
        <div className="mb-5 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#176b69] text-[#d9f7ee] shadow-[0_10px_24px_rgba(23,107,105,0.2)]">
            <ToothMarkIcon />
          </span>
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#176b69]">SPM DENTAL CARE</p>
            <p className="mt-1 text-xs font-medium text-[#5d7288]">Appointment Management System</p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(18,48,74,0.14)] backdrop-blur-md sm:p-8">
          <div className="border-b border-[#e2eeee] pb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5d928c]">Secure workspace</p>
            <h1 className="mt-2 font-display text-3xl text-[#12304a]">Admin Portal</h1>
            <p className="mt-2 max-w-xs text-sm leading-5 text-[#5d7288]">Manage appointments and patient care with clarity.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-[0.12em] text-[#47637a]">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#4f8d88]" aria-hidden="true">
                  <EmailIcon />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-[#d6e5e6] bg-[#f8fcfc] px-4 py-3 pl-11 text-sm text-[#12304a] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#91a4b2] focus:border-[#2b8884] focus:bg-white focus:ring-4 focus:ring-[#2b8884]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-xs font-bold uppercase tracking-[0.12em] text-[#47637a]">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#4f8d88]" aria-hidden="true">
                  <LockIcon />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-[#d6e5e6] bg-[#f8fcfc] px-4 py-3 pl-11 pr-12 text-sm text-[#12304a] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#91a4b2] focus:border-[#2b8884] focus:bg-white focus:ring-4 focus:ring-[#2b8884]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-2.5 my-1 inline-flex w-9 items-center justify-center rounded-lg text-[#5d7288] transition-colors hover:bg-[#e8f4f2] hover:text-[#176b69] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b8884] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            {error ? (
              <p role="alert" className="rounded-lg border border-[#f3c4c4] bg-[#fff5f5] px-3 py-2 text-xs leading-4 text-[#b42318]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#176b69] px-6 text-sm font-bold tracking-wide text-white shadow-[0_10px_20px_rgba(23,107,105,0.18)] transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#125a58] hover:shadow-[0_14px_24px_rgba(23,107,105,0.24)] active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2b8884]/25 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] font-medium text-[#7a8e9d]">Authorized clinic staff only</p>
        </div>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
