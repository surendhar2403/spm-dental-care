"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Shown for both wrong-password and unknown-email cases, deliberately —
// never reveals which one it was.
const INVALID_CREDENTIALS_ERROR = "Incorrect email or password.";
const NOT_ADMIN_ERROR = "That account isn't authorized for the admin dashboard.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          status: adminCheckError?.status,
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
    <div className="flex min-h-screen items-center justify-center bg-canvas-soft px-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-canvas p-8 shadow-sm">
        <h1 className="font-display text-2xl text-ink">Admin Login</h1>
        <p className="mt-1 text-sm text-ink/60">SPM Dental Care — appointment management</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-blue-600 focus:outline-none disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-blue-600 focus:outline-none disabled:opacity-60"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-900 px-6 py-3 text-sm font-semibold tracking-wide text-canvas transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
