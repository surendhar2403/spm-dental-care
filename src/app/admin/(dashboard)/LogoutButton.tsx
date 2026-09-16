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
        className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink whitespace-nowrap transition-colors hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="flex items-center gap-3">
          <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center text-base leading-none">
            ⎋
          </span>
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
