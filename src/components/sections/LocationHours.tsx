"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { CONTACT as FALLBACK_CONTACT } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { ClinicSettings } from "@/types";

export default function LocationHours() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("clinic_settings")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("[LocationHours] Supabase error:", error);
          setSettings(null);
          return;
        }

        setSettings((data ?? null) as ClinicSettings | null);
      } catch (err) {
        console.error("[LocationHours] Unexpected error:", err);
        setSettings(null);
      }
    }

    fetchSettings();
  }, []);

  const addressLines = settings ? [settings.address_line_1, settings.address_line_2, [settings.city, settings.state, settings.pincode, settings.country].filter(Boolean).join(", ")].filter(Boolean) as string[] : FALLBACK_CONTACT.addressLines;
  const locatedIn = settings?.business_name ?? FALLBACK_CONTACT.locatedIn;
  const title = settings?.location_heading ?? "Find us in Kumananchavadi";
  const mapUrl = settings?.map_url ?? FALLBACK_CONTACT.mapsUrl;
  const openingHours = settings?.opening_hours ? settings.opening_hours.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => ({ day: line.split(":")[0] ?? line, time: line.includes(":") ? line.slice(line.indexOf(":") + 1).trim() : line })) : FALLBACK_CONTACT.hours;

  const mapsEmbedQuery = encodeURIComponent(
    `${locatedIn ?? "SPM Dental Care"}, ${addressLines.join(" ")}`,
  );
  const mapsEmbedSrc = `https://www.google.com/maps?q=${mapsEmbedQuery}&output=embed`;

  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="bg-[#C5DCDC] py-14 sm:py-20"
    >
      <Container className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="flex flex-1 flex-col gap-8">
          <SectionHeading
            id="location-heading"
            eyebrow="Location"
            title={title}
          />

          <address className="flex flex-col gap-1 not-italic text-sm text-ink/80">
            {locatedIn ? (
              <p className="font-medium text-ink">Located in {locatedIn}</p>
            ) : null}
            {addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>

          <Button href={mapUrl} variant="ghost" className="self-start">
            Get Directions
          </Button>

          <div className="flex flex-col gap-2 border-t border-line pt-6">
            <h3 className="font-display text-lg text-blue-800">Opening Hours</h3>
            <ul>
              {openingHours.map((slot) => (
                <li key={slot.day} className="text-sm text-ink/80">
                  <span className="font-medium text-ink">{slot.day}:</span>{" "}
                  {slot.time}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full flex-1 overflow-hidden rounded-card border border-line bg-card p-2 shadow-[0_8px_30px_rgba(16,44,69,0.06)]">
          <iframe
            title="SPM Dental Care location on Google Maps"
            src={mapsEmbedSrc}
            className="h-80 w-full lg:h-full lg:min-h-[360px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Container>
    </section>
  );
}
