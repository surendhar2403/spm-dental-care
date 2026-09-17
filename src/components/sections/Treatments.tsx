"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TreatmentDetailsModal, { type TreatmentDetails } from "@/components/sections/TreatmentDetailsModal";
import { TREATMENT_GROUPS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { ReactNode, SVGProps } from "react";

interface PublicTreatmentRow {
  id: string;
  name: string;
  price: number | null;
}

type TreatmentIconProps = SVGProps<SVGSVGElement> & { children: ReactNode };

function IconFrame({ children, ...props }: TreatmentIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

function TreatmentIcon({ id, ...props }: { id: string } & SVGProps<SVGSVGElement>) {
  switch (id) {
    case "dental-crowns":
      return (
        <IconFrame {...props}>
          <path d="m4 7 2 11h12l2-11-5 4-3-6-3 6-5-4Z" />
          <path d="M7 18h10" />
        </IconFrame>
      );
    case "dental-fillings":
      return (
        <IconFrame {...props}>
          <path d="M12 3.5c-3.2 0-5.5 2-5.5 5.1 0 1.5.5 2.4.9 3.3.5 1 .5 4.7 1.8 7.1.5.9 1.3.9 1.7-.1l1.1-3.2 1.1 3.2c.4 1 1.2 1 1.7.1 1.3-2.4 1.3-6.1 1.8-7.1.4-.9.9-1.8.9-3.3 0-3.1-2.3-5.1-5.5-5.1Z" />
          <circle cx="12" cy="9" r="1.5" />
        </IconFrame>
      );
    case "dental-implants":
      return (
        <IconFrame {...props}>
          <path d="M12 3.5c-3.2 0-5.5 2-5.5 5.1 0 1.5.5 2.4.9 3.3.4.8.5 2.3.7 3.8" />
          <path d="M17.1 11.9c.4-.9.9-1.8.9-3.3 0-3.1-2.3-5.1-5.5-5.1" />
          <path d="M10 15.7h4M10 18h4M10.4 20.5h3.2M12 14v6.5" />
        </IconFrame>
      );
    case "teeth-cleaning":
      return (
        <IconFrame {...props}>
          <path d="M12 3.5c-3.2 0-5.5 2-5.5 5.1 0 1.5.5 2.4.9 3.3.5 1 .5 4.7 1.8 7.1.5.9 1.3.9 1.7-.1l1.1-3.2 1.1 3.2c.4 1 1.2 1 1.7.1 1.3-2.4 1.3-6.1 1.8-7.1.4-.9.9-1.8.9-3.3 0-3.1-2.3-5.1-5.5-5.1Z" />
          <path d="M19 3v3M17.5 4.5h3M5 16v3M3.5 17.5h3" />
        </IconFrame>
      );
    case "mouth-ulcers":
      return (
        <IconFrame {...props}>
          <path d="M4 8.5c2.3 1.5 4.9 2.2 8 2.2s5.7-.7 8-2.2c-.3 5.2-3.4 8-8 8s-7.7-2.8-8-8Z" />
          <path d="M7 13.5c1.4 1 2.9 1.5 5 1.5s3.6-.5 5-1.5" />
          <circle cx="9" cy="12.5" r=".7" />
        </IconFrame>
      );
    case "gum-treatment":
      return (
        <IconFrame {...props}>
          <path d="M4 10.5c2.3 1.3 5 2 8 2s5.7-.7 8-2" />
          <path d="M5.5 10.8v3.3c0 2.2 1.5 3.4 3 3.4 1.3 0 2.1-.7 3.5-.7s2.2.7 3.5.7c1.5 0 3-1.2 3-3.4v-3.3" />
          <path d="M8 7.5c1.1-1.4 2.4-2 4-2s2.9.6 4 2" />
        </IconFrame>
      );
    case "laser-dentistry":
      return (
        <IconFrame {...props}>
          <path d="m4 18 7-7" />
          <path d="m6 20 7-7" />
          <path d="m12 5 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" />
          <path d="M17 13v5M14.5 15.5h5" />
        </IconFrame>
      );
    case "tooth-extractions":
      return (
        <IconFrame {...props}>
          <path d="M12 3.5c-3.2 0-5.5 2-5.5 5.1 0 1.5.5 2.4.9 3.3.5 1 .5 4.7 1.8 7.1.5.9 1.3.9 1.7-.1l1.1-3.2 1.1 3.2c.4 1 1.2 1 1.7.1 1.3-2.4 1.3-6.1 1.8-7.1.4-.9.9-1.8.9-3.3 0-3.1-2.3-5.1-5.5-5.1Z" />
          <path d="M19 13v6M16.5 16.5H21" />
        </IconFrame>
      );
    case "wisdom-teeth":
      return (
        <IconFrame {...props}>
          <path d="M12 3.5c-3.2 0-5.5 2-5.5 5.1 0 1.5.5 2.4.9 3.3.5 1 .5 4.7 1.8 7.1.5.9 1.3.9 1.7-.1l1.1-3.2 1.1 3.2c.4 1 1.2 1 1.7.1 1.3-2.4 1.3-6.1 1.8-7.1.4-.9.9-1.8.9-3.3 0-3.1-2.3-5.1-5.5-5.1Z" />
          <path d="M9 8h6M10 6.5l1 1.5 1-1.5 1 1.5 1-1.5" />
        </IconFrame>
      );
    case "dentures":
      return (
        <IconFrame {...props}>
          <path d="M4 9.5c1.3 4.5 4 7 8 7s6.7-2.5 8-7c-2.3 1-5 1.5-8 1.5S6.3 10.5 4 9.5Z" />
          <path d="M6 9.5V7.8c0-1.7 1.3-2.8 2.8-2.8h6.4C16.7 5 18 6.1 18 7.8v1.7M8 11v3M12 11v4M16 11v3" />
        </IconFrame>
      );
    case "dental-braces":
      return (
        <IconFrame {...props}>
          <path d="M5.5 6.5c.6 5.9 2.2 11 6.5 11s5.9-5.1 6.5-11" />
          <path d="M6.5 11h11M8 9.5v3M12 9.5v3M16 9.5v3" />
          <circle cx="8" cy="11" r="1" />
          <circle cx="12" cy="11" r="1" />
          <circle cx="16" cy="11" r="1" />
        </IconFrame>
      );
    case "aligners":
      return (
        <IconFrame {...props}>
          <path d="M4.5 8.5c.7-2 2.4-3 4.2-3h6.6c1.8 0 3.5 1 4.2 3" />
          <path d="M5.5 9c.7 4.2 2.5 7 6.5 7s5.8-2.8 6.5-7" />
          <path d="M8.5 9v2M12 9v3M15.5 9v2" />
        </IconFrame>
      );
    case "kids-dentistry":
      return (
        <IconFrame {...props}>
          <path d="M12 3.5c-3.2 0-5.5 2-5.5 5.1 0 1.5.5 2.4.9 3.3.5 1 .5 4.7 1.8 7.1.5.9 1.3.9 1.7-.1l1.1-3.2 1.1 3.2c.4 1 1.2 1 1.7.1 1.3-2.4 1.3-6.1 1.8-7.1.4-.9.9-1.8.9-3.3 0-3.1-2.3-5.1-5.5-5.1Z" />
          <circle cx="9.5" cy="8.5" r=".7" />
          <circle cx="14.5" cy="8.5" r=".7" />
          <path d="M9.5 11.5c1.4 1.2 3.6 1.2 5 0" />
        </IconFrame>
      );
    case "root-canal":
    default:
      return (
        <IconFrame {...props}>
          <path d="M12 3.5c-3.2 0-5.5 2-5.5 5.1 0 1.5.5 2.4.9 3.3.5 1 .5 4.7 1.8 7.1.5.9 1.3.9 1.7-.1l1.1-3.2 1.1 3.2c.4 1 1.2 1 1.7.1 1.3-2.4 1.3-6.1 1.8-7.1.4-.9.9-1.8.9-3.3 0-3.1-2.3-5.1-5.5-5.1Z" />
          <path d="M12 11v8M10.5 14h3" />
        </IconFrame>
      );
  }
}

export default function Treatments() {
  const [treatments, setTreatments] = useState<PublicTreatmentRow[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentDetails | null>(null);

  useEffect(() => {
    async function fetchTreatments() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("treatments")
          .select("id, name, price")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });

        if (error) {
          console.error("[Treatments] Supabase error:", error);
          return;
        }

        setTreatments((data ?? []) as PublicTreatmentRow[]);
      } catch (error) {
        console.error("[Treatments] Unexpected error:", error);
      }
    }

    fetchTreatments();
  }, []);

  function normalizeTreatmentName(name: string) {
    return name.trim().toLowerCase().replace(/\s+/g, " ").replace(/\bbraces\b/g, "dental braces");
  }

  function isActualTreatmentName(name: string) {
    const normalized = normalizeTreatmentName(name);
    return !normalized.includes("other") && !normalized.includes("not sure");
  }

  function slugifyTreatmentName(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "treatment";
  }

  const treatmentCatalog = TREATMENT_GROUPS.flatMap((group) =>
    group.treatments.map((treatment) => ({ ...treatment, groupName: group.groupName })),
  );

  const activeTreatmentCards =
    treatments.length > 0
      ? treatments
          .filter((treatment) => isActualTreatmentName(treatment.name))
          .map((treatment) => {
            const lookupName = normalizeTreatmentName(treatment.name === "Braces" ? "Dental Braces" : treatment.name);
            const match = treatmentCatalog.find(
              (item) => normalizeTreatmentName(item.name) === lookupName,
            );

            return {
              id: match?.id ?? slugifyTreatmentName(treatment.name),
              name: treatment.name,
              description: match?.description ?? "Dental care treatment.",
              price: treatment.price ?? null,
              groupName: match?.groupName ?? "Additional Treatments",
            };
          })
      : TREATMENT_GROUPS.flatMap((group) =>
          group.treatments
            .filter((treatment) => isActualTreatmentName(treatment.name))
            .map((treatment) => ({
              ...treatment,
              price: null,
              groupName: group.groupName,
            })),
        );

  const orderedGroups = [
    "Restorative Care",
    "Preventive & General Care",
    "Extractions & Replacement",
    "Orthodontics & Kids",
    "Additional Treatments",
  ];

  const groupedBySection = new Map<string, typeof activeTreatmentCards>();

  for (const treatment of activeTreatmentCards) {
    const groupName = orderedGroups.includes(treatment.groupName) ? treatment.groupName : "Additional Treatments";
    const existing = groupedBySection.get(groupName) ?? [];
    existing.push(treatment);
    groupedBySection.set(groupName, existing);
  }

  const visibleGroups = orderedGroups
    .filter((groupName) => groupedBySection.has(groupName))
    .map((groupName) => ({
      groupName,
      treatments: groupedBySection.get(groupName) ?? [],
    }));

  function formatPrice(price: number | null | undefined) {
    if (price === null || price === undefined || !Number.isFinite(price)) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  return (
    <section
      id="treatments"
      aria-labelledby="treatments-heading"
      className="relative isolate overflow-hidden bg-[#D5E6E6] py-10 sm:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.52), transparent 35%), radial-gradient(circle at 8% 58%, rgba(140,207,199,0.2), transparent 30%), radial-gradient(circle at 92% 88%, rgba(255,255,255,0.38), transparent 32%), linear-gradient(135deg, #D5E6E6 0%, #C5DCDC 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-16 h-80 w-80 rounded-full border border-white/45 rotate-12"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-36 bottom-0 h-96 w-96 rounded-[46%] border border-white/35 -rotate-12"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 h-40 w-[70%] -translate-x-1/2 rounded-[50%] border border-white/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-12 h-72 w-[82%] -translate-x-1/2 rounded-[50%] border border-white/[0.12]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[14%] top-9 h-14 w-14 opacity-[0.16] [background-image:radial-gradient(circle,_#8CCFC7_1.5px,_transparent_1.5px)] [background-size:14px_14px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-14 right-[20%] h-14 w-14 opacity-[0.13] [background-image:radial-gradient(circle,_#8CCFC7_1.5px,_transparent_1.5px)] [background-size:14px_14px]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 1000 600"
        className="pointer-events-none absolute inset-0 h-full w-full text-[#176B69] opacity-[0.08]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M-40 390c150-130 290-130 420-35 110 80 220 105 340 35 105-61 190-49 320 38" />
        <path d="M-20 445c135-90 263-93 390-20 131 76 239 80 366 3 102-62 180-61 286-7" />
        <ellipse cx="500" cy="145" rx="330" ry="92" />
        <path d="M860 130c-49 0-82 35-82 83 0 28 11 46 17 62 9 23 6 104 29 143 10 17 26 16 34-6l16-54 16 54c8 22 24 23 34 6 23-39 20-120 29-143 6-16 17-34 17-62 0-48-33-83-82-83Z" />
        <path d="M820 248c14 12 28 18 40 18s26-6 40-18M828 300c10 8 21 12 32 12s22-4 32-12" />
      </svg>

      <Container className="relative z-10 flex flex-col gap-7 px-4 sm:gap-10 sm:px-8 lg:px-10">
        <SectionHeading
          id="treatments-heading"
          eyebrow="Treatments"
          title="Dental treatments at SPM Dental Care"
          description="A range of dental treatments handled under one roof in Kumananchavadi."
          align="center"
        />

        <div className="flex flex-col gap-6 sm:gap-8">
          {visibleGroups.map((group) => (
            <div key={group.groupName} className="flex flex-col gap-3 sm:gap-5">
              <h3 className="font-display text-base text-blue-900 sm:text-xl">
                {group.groupName}
              </h3>
              <ul className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-4">
                {group.treatments.map((treatment) => (
                  <li
                    key={treatment.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Learn more about ${treatment.name}`}
                    onClick={() => setSelectedTreatment(treatment)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedTreatment(treatment);
                      }
                    }}
                    className="group flex h-full cursor-pointer flex-col gap-2 rounded-[1rem] border border-line bg-card p-3 shadow-[0_8px_30px_rgba(16,44,69,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 sm:gap-3 sm:rounded-card sm:p-6"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCEAEA] text-[#176B69] transition-colors duration-300 group-hover:bg-[#176B69] group-hover:text-white sm:h-10 sm:w-10">
                      <TreatmentIcon id={treatment.id} className="h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5" />
                    </span>
                    <h4 className="font-display text-[0.9375rem] leading-snug text-ink sm:text-lg">
                      {treatment.name}
                    </h4>
                    {formatPrice(treatment.price) ? (
                      <span className="text-sm font-semibold text-blue-700">
                        {formatPrice(treatment.price)}
                      </span>
                    ) : null}
                    <p className="text-[0.6875rem] leading-[1.45] text-ink/70 sm:text-sm sm:leading-relaxed">
                      {treatment.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <TreatmentDetailsModal
        treatment={selectedTreatment}
        onClose={() => setSelectedTreatment(null)}
      />
    </section>
  );
}
