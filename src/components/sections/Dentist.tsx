"use client";

import { useEffect, useState, type SVGProps } from "react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { createClient } from "@/lib/supabase/client";
import type { PublicDoctor } from "@/types";

/**
 * Small elegant line icons, one per specialty. Kept local to this section
 * (rather than pulling in an icon library) so the rest of the app's
 * dependency footprint is untouched.
 */
function IconGum(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3c-3 0-6 1.6-6 5 0 5 2.5 9.2 6 12.2 3.5-3 6-7.2 6-12.2 0-3.4-3-5-6-5Z" />
      <path d="M9 9.3c1 .9 5 .9 6 0" />
    </svg>
  );
}

function IconAligner(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 9.5c0-2 1.2-3.2 3-3.2h9c1.8 0 3 1.2 3 3.2" />
      <path d="M5.2 9.8c.5 3.2 2.2 6.4 6.8 6.4s6.3-3.2 6.8-6.4" />
      <path d="M8.3 9.8v2.1M12 9.8v2.9M15.7 9.8v2.1" />
    </svg>
  );
}

function IconRoot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.5c-3.3 0-5.8 1.9-5.8 4.8 0 1.4.5 2.4 1 3.3-.3 2.9-1 6.3.9 10 .5 1 1.4 1 1.9-.1.6-1.4.8-2.9 1-4.4.2 1.5.4 3 1 4.4.5 1.1 1.4 1.1 1.9.1 1.9-3.7 1.2-7.1.9-10 .5-.9 1-1.9 1-3.3 0-2.9-2.5-4.8-5.8-4.8Z" />
    </svg>
  );
}

function IconJaw(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5.2 12c0-4.3 3.1-8.5 7-8.5s6.8 3.3 6.8 7.2c0 2-1 3-1 4.8 0 1.5-1 2.1-2.1 2.1h-.9v1.8c0 1.1-1.2 1.9-2.1 1l-1-1" />
      <path d="M9.2 10.9h.01" />
      <path d="M13.8 15c1 .5 2.1.3 2.6-.6" />
    </svg>
  );
}

/**
 * Icon lookup is keyed by SPECIALTY TEXT rather than a fixed doctor id.
 * The doctor grid used to be a hardcoded array with hand-picked id slugs
 * (e.g. "mohammed-ibrahim") that this map matched directly; now that
 * doctors come from public.doctors, ids are database-generated UUIDs, so
 * they can no longer be used as lookup keys. Matching on `specialty`
 * instead keeps the exact same icon showing for the clinic's existing
 * four specialists (their specialty text is unchanged), while any new
 * specialty an admin adds later simply falls through to the IconGum
 * default below — never a redesign, just a graceful fallback.
 */
const SPECIALTY_ICONS: Record<string, (props: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  Periodontics: IconGum,
  Orthodontics: IconAligner,
  "Root Canal Care": IconRoot,
  "Maxillofacial Surgery": IconJaw,
};

type DoctorsLoadState = "loading" | "loaded" | "error";

/**
 * "Meet Our Dental Specialists" section. A simple, balanced 4-card grid —
 * every card shares identical size, background, and typography. No card
 * is featured or highlighted by default; the only state change is a
 * uniform hover lift applied equally to all four.
 *
 * The doctor list is loaded live from public.doctors (active doctors
 * only, sort_order then created_at) — see fetchDoctors() below — instead
 * of a hardcoded constant, so this section always reflects Admin ->
 * Manage Doctors after a page refresh. Mirrors the same fetch pattern
 * already used by the public "Book Appointment" form's treatment
 * dropdown (see AppointmentForm.tsx's fetchTreatments()): anon Supabase
 * client, explicit loading/error states, and no silent fallback to stale
 * hardcoded data if the query fails.
 */
export default function Dentist() {
  const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
  const [loadState, setLoadState] = useState<DoctorsLoadState>("loading");

  async function fetchDoctors() {
    setLoadState("loading");

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch (configError) {
      // eslint-disable-next-line no-console
      console.error("[dentist section] Supabase client could not be created:", configError);
      setLoadState("error");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, credentials, specialty, description, experience")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        // Full error detail (including RLS/permission errors) goes to the
        // console for debugging; the UI only ever shows a generic,
        // friendly error state — never a hardcoded fallback list.
        // eslint-disable-next-line no-console
        console.error("[dentist section] fetchDoctors Supabase error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setLoadState("error");
        return;
      }

      setDoctors((data ?? []) as PublicDoctor[]);
      setLoadState("loaded");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[dentist section] fetchDoctors unexpected error:", err);
      setLoadState("error");
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <section id="dentist" aria-labelledby="dentist-heading" className="bg-canvas py-14 sm:py-20">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          id="dentist-heading"
          eyebrow="Meet Our Team"
          title="Our Dental Specialists"
          align="center"
        />

        {loadState === "loading" ? (
          <p className="text-center text-sm text-ink/60">Loading our specialists…</p>
        ) : loadState === "error" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-ink/60">
              We couldn&apos;t load our specialists right now. Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={fetchDoctors}
              className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-2 text-xs font-semibold text-canvas transition-colors hover:bg-blue-800"
            >
              Retry
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <p className="text-center text-sm text-ink/60">Specialist details coming soon.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doctor) => {
              const initials = doctor.name
                .replace(/^Dr\.?\s*/i, "")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const Icon = SPECIALTY_ICONS[doctor.specialty ?? ""] ?? IconGum;

              return (
                <li
                  key={doctor.id}
                  className="group flex flex-col items-center gap-4 rounded-card border border-line bg-card p-7 text-center shadow-[0_8px_30px_rgba(16,44,69,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-700 transition-colors duration-200 group-hover:bg-blue-700 group-hover:text-canvas"
                  >
                    <Icon className="h-6 w-6" />
                  </span>

                  <span
                    aria-hidden="true"
                    className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-blue-700 font-display text-xl text-canvas ring-2 ring-blue-100"
                  >
                    {initials}
                  </span>

                  <div className="flex flex-col gap-1">
                    <span className="font-display text-lg text-ink sm:text-xl">{doctor.name}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-600">
                      {doctor.credentials}
                    </span>
                  </div>

                  <span aria-hidden="true" className="h-px w-10 flex-none bg-line" />

                  <span className="text-sm font-medium text-blue-700">{doctor.specialty}</span>

                  <p className="text-sm leading-relaxed text-ink/70">{doctor.description}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
