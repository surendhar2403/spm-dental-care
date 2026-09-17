import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import AdminHeaderSettings from "./AdminHeaderSettings";

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
    <div className="admin-shell min-h-screen bg-canvas-soft">
      <header className="admin-dashboard-header relative overflow-hidden">
        <div aria-hidden="true" className="admin-dashboard-header-highlight pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex w-full items-center justify-between px-4 py-2 sm:px-6 sm:py-2">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-full border border-white/70 bg-[#f7faf9] p-1 shadow-[0_5px_14px_rgba(2,35,39,0.3)] sm:h-9 sm:w-9">
              <Image
                src="/images/logo-transparent.png"
                alt="SPM Dental Care logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                unoptimized
                priority
              />
            </span>
            <div className="min-w-0">
              <p className="admin-brand font-display truncate text-lg font-semibold tracking-[0.01em] text-white sm:text-xl">SPM Dental Care</p>
              <p className="mt-1 text-xs font-medium tracking-[0.08em] text-white/70">Admin Dashboard</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3 pr-1 sm:pr-2">
            <span className="hidden max-w-[280px] truncate text-sm text-white/75 sm:inline">{user.email}</span>
            <AdminHeaderSettings />
          </div>
        </div>
      </header>
      <main className="w-full px-4 py-4 sm:px-6 sm:py-3">{children}</main>
    </div>
  );
}
