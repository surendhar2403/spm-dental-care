import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

/**
 * Wraps every page under /admin (dashboard, and any future admin pages)
 * except /admin/login, which lives outside this route group so it's never
 * itself subject to this redirect.
 *
 * This is a second, server-side check in addition to src/middleware.ts —
 * belt and braces. Neither check grants any database access by itself;
 * public.appointments' Row Level Security policies are what actually
 * decide what an admin session is allowed to read or change.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Uses the is_admin() RPC (SECURITY DEFINER) rather than querying
  // public.admins directly, so this doesn't depend on the calling role
  // having its own SELECT grant on that table.
  const { data: isAdminData } = await supabase.rpc("is_admin");

  if (isAdminData !== true) {
    redirect("/admin/login?error=not_admin");
  }

  return (
    <div className="min-h-screen bg-canvas-soft">
      <header className="border-b border-line bg-canvas">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="font-display text-lg text-ink">SPM Dental Care</p>
            <p className="text-xs text-ink/60">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ink/60 sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
