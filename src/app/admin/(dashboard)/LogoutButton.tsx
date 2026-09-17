"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  menuItem?: boolean;
};

export default function LogoutButton({ menuItem = false }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  if (menuItem) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="admin-logout-menu-item group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="flex items-center gap-3">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="admin-logout-icon h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
          >
            <path d="M14 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H14" />
            <path d="M12 12h8M17 8l4 4-4 4" />
          </svg>
          <span>{isLoggingOut ? "Signing out…" : "Log out"}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex items-center justify-center rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoggingOut ? "Signing out…" : "Log out"}
    </button>
  );
}
