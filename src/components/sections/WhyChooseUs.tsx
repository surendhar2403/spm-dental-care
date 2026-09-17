import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { CLINIC_VALUES } from "@/lib/constants";

const FEATURE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=82",
    alt: "Dentist providing comfortable treatment to a patient",
  },
  {
    src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=82",
    alt: "Bright dental treatment room at SPM Dental Care",
  },
  {
    src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=82",
    alt: "Modern dental chair and equipment at SPM Dental Care",
  },
  {
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=82",
    alt: "Reception and consultation area at SPM Dental Care",
  },
  {
    src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=82",
    alt: "Smartphone appointment booking visual",
  },
] as const;

function FeatureIcon({ index }: { index: number }) {
  const sharedProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6",
    "aria-hidden": true,
  };

  if (index === 0) {
    return (
      <svg {...sharedProps}>
        <path d="M20.8 8.8c0 5.6-8.8 10.3-8.8 10.3S3.2 14.4 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
        <path d="m8 10.5 2.2 2.2 5-5" />
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg {...sharedProps}>
        <path d="m3.5 10 8.5-7 8.5 7" />
        <path d="M5.5 9v10.5h13V9M9 19.5v-6h6v6" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg {...sharedProps}>
        <path d="M12 3.5c-3.2 0-5.5 2-5.5 5.1 0 1.5.5 2.4.9 3.3.5 1 .5 4.7 1.8 7.1.5.9 1.3.9 1.7-.1l1.1-3.2 1.1 3.2c.4 1 1.2 1 1.7.1 1.3-2.4 1.3-6.1 1.8-7.1.4-.9.9-1.8.9-3.3 0-3.1-2.3-5.1-5.5-5.1Z" />
        <path d="M8.5 10.5h7M9.5 8.5h5" />
      </svg>
    );
  }

  if (index === 3) {
    return (
      <svg {...sharedProps}>
        <path d="M20 10.5c0 4.6-8 10-8 10s-8-5.4-8-10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10.5" r="2.5" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h3" />
      <path d="m15 15 1.2 1.2L19 13.5" />
    </svg>
  );
}

export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      aria-labelledby="why-choose-us-heading"
      className="relative isolate overflow-hidden bg-[linear-gradient(135deg,_#D5E6E6_0%,_#C5DCDC_100%)] py-9 sm:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-[45%] border border-white/30 rotate-12"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-10 h-80 w-80 rounded-[42%] border border-blue-900/10 -rotate-12"
      />

      <Container className="relative z-10 flex flex-col gap-6 px-3.5 sm:gap-10 sm:px-8 lg:px-10 [&>div:first-child]:gap-1.5 [&>div:first-child_span]:text-[0.6875rem] [&>div:first-child_h2]:text-[1.75rem] [&>div:first-child_p]:text-[0.8125rem] [&>div:first-child_p]:leading-[1.4] sm:[&>div:first-child]:gap-3 sm:[&>div:first-child_span]:text-xs sm:[&>div:first-child_h2]:text-4xl sm:[&>div:first-child_p]:text-lg sm:[&>div:first-child_p]:leading-relaxed">
        <SectionHeading
          id="why-choose-us-heading"
          eyebrow="Why choose us"
          title="A clinic built around patient comfort"
          description="We combine modern dentistry, a caring team, and a comfortable environment to give you the best possible experience."
          align="center"
        />

        <ul className="grid grid-cols-2 gap-2 sm:gap-6 lg:grid-cols-5">
          {CLINIC_VALUES.map((value, index) => (
            <li
              key={value.title}
              className="group flex h-full flex-col overflow-visible rounded-[0.875rem] border border-line bg-card shadow-[0_8px_30px_rgba(16,44,69,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-card"
            >
              <div className="relative h-[5.25rem] overflow-visible rounded-t-[0.875rem] min-[375px]:h-24 sm:h-40 sm:rounded-t-card">
                <div className="absolute inset-0 overflow-hidden rounded-t-card">
                  <img
                    src={FEATURE_IMAGES[index]!.src}
                    alt={FEATURE_IMAGES[index]!.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <span className="absolute -bottom-[1.125rem] left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-card bg-[#E1F0EF] text-[#176B69] shadow-sm transition-colors duration-300 group-hover:bg-[#176B69] group-hover:text-white sm:-bottom-6 sm:h-12 sm:w-12 sm:border-4">
                  <span className="[&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
                    <FeatureIcon index={index} />
                  </span>
                </span>
              </div>

              <div className="flex flex-1 flex-col items-center px-2 pb-3 pt-7 text-center sm:px-5 sm:pb-6 sm:pt-9">
                <span className="text-[0.6875rem] font-semibold tracking-[0.12em] text-blue-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-1.5 font-display text-[0.8125rem] leading-[1.2] text-blue-800 min-[375px]:text-sm sm:mt-3 sm:text-lg sm:leading-snug">
                  {value.title}
                </span>
                <p className="mt-1.5 text-[0.65625rem] leading-[1.4] text-ink/70 min-[375px]:text-[0.6875rem] sm:mt-3 sm:text-sm sm:leading-relaxed">
                  {value.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
