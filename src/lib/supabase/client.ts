"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Browser-side Supabase client. Used by both the admin login/dashboard and
 * the public appointment form (src/components/sections/AppointmentForm.tsx)
 * — there is deliberately only one browser client in this project, so both
 * areas always read the same env vars the same way.
 *
 * Uses @supabase/ssr's createBrowserClient instead of the plain
 * createClient so the auth session is stored in cookies (not just
 * localStorage). That's what lets src/middleware.ts and server components
 * read the same session to gate /admin routes server-side.
 *
 * Only ever configured with the public "publishable" key — the same key
 * already used by the public site. The secret/service_role key must never
 * appear here or anywhere in frontend code; access control is enforced by
 * Postgres Row Level Security, not by which key this client happens to hold.
 */
export function createClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL " +
        "and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    );
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
