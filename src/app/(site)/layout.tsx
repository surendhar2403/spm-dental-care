import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";
import StructuredData from "@/components/StructuredData";
import { AppointmentModalProvider } from "@/components/appointment/AppointmentModalContext";
import AppointmentModal from "@/components/appointment/AppointmentModal";
import { SITE } from "@/lib/constants";
import "../globals.css";

// metadataBase (SITE.url) is still a placeholder domain — update once the
// real production domain is connected, and swap the OG image for a real one.
export const metadata: Metadata = {
  title: "SPM Dental Care | Dentist in Kumananchavadi, Chennai",
  description:
    "SPM Dental Care offers root canal treatment, dental implants, braces, and general dentistry in Kumananchavadi, Chennai. Rated 4.9 on Google.",
  metadataBase: new URL(SITE.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SPM Dental Care | Dentist in Kumananchavadi, Chennai",
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <StructuredData />
        <AppointmentModalProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <AppointmentModal />
          <BackToTop />
        </AppointmentModalProvider>
      </body>
    </html>
  );
}
