import type { Metadata } from "next";
import "../globals.css";

/**
 * Root layout for everything under /admin. Deliberately separate from
 * src/app/(site)/layout.tsx (the public site's root layout) so the admin
 * login and dashboard never inherit the public Header, Footer, or booking
 * modal — this is its own isolated area, per Next.js's "multiple root
 * layouts" pattern (each top-level route group/segment gets its own
 * <html>/<body>).
 *
 * Reuses the same design tokens (globals.css) and body font as the public
 * site so the admin UI still looks like it belongs to SPM Dental Care, but
 * intentionally does not import Header/Footer/AppointmentModal.
 */

export const metadata: Metadata = {
  title: "Admin — SPM Dental Care",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink">{children}</body>
    </html>
  );
}
