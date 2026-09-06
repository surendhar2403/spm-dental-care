import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Server-side Supabase client for the admin area (Server Components, the
 * /admin layout's session check, etc). Reads/writes the same cookie-based
 * session that src/middleware.ts and the browser client
 * (src/lib/supabase/client.ts) use, via @supabase/ssr.
 *
 * Only ever configured with the public "publishable" key — never the
 * secret/service_role key. This client has no elevated privileges; it
 * simply reads the signed-in user's own session, and Postgres Row Level
 * Security (see supabase/README + SQL) is what actually decides what that
 * user is allowed to read or change.
 */
export async function createClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL " +
        "and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll was called from a Server Component (no request/response
          // to write cookies to). Safe to ignore: middleware.ts already
          // refreshes the session cookie on every /admin request.
        }
      },
    },
  });
}
