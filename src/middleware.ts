import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Gates every /admin/* request.
 *
 * - Anyone signed out -> redirected to /admin/login.
 * - Anyone signed in but not present in public.admins -> signed out and
 *   redirected to /admin/login with an error. Being an authenticated
 *   Supabase user is NOT sufficient by itself (see requirement 5) — only
 *   rows in public.admins count, checked here via the is_admin() RPC
 *   (see supabase/README.md).
 * - /admin/login itself is always reachable when signed out, and bounces
 *   straight to /admin when already signed in as an admin.
 *
 * This is the outer layer of defense. The real security boundary is
 * Postgres Row Level Security on public.appointments — this middleware
 * only decides what the UI shows; it grants no database access itself.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  if (!isAdminArea) {
    return response;
  }

  const isLoginPage = pathname === "/admin/login";

  if (!supabaseUrl || !supabasePublishableKey) {
    // Misconfigured environment — fail closed rather than letting /admin
    // through unauthenticated.
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isLoginPage) return response;
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Signed in — confirm this user is actually an admin, not just any
  // authenticated Supabase user. Uses the is_admin() RPC (SECURITY
  // DEFINER) rather than querying public.admins directly, so this
  // doesn't depend on the calling role having its own SELECT grant on
  // that table.
  const { data: isAdminData } = await supabase.rpc("is_admin");
  const isAdmin = isAdminData === true;

  if (isLoginPage) {
    return isAdmin
      ? NextResponse.redirect(new URL("/admin", request.url))
      : response;
  }

  if (!isAdmin) {
    await supabase.auth.signOut();
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "not_admin");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
