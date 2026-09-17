"use client";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SmileDivider from "@/components/ui/SmileDivider";
import HeroSlider from "@/components/sections/HeroSlider";
import { useAppointmentModal } from "@/components/appointment/AppointmentModalContext";
import { CONTACT, GOOGLE_RATING, SITE } from "@/lib/constants";
import { buildTelUrl } from "@/lib/utils";

const HERO_BENEFITS = [
  "Personalized Treatment",
  "Safe & Hygienic Environment",
  "Caring & Experienced Team",
] as const;

function HeroBenefitIcon({ index }: { index: number }) {
  const sharedProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
    "aria-hidden": true,
  };

  if (index === 0) {
    return (
      <svg {...sharedProps}>
        <path d="M20.5 8.8c0 5.3-8.5 10.1-8.5 10.1S3.5 14.1 3.5 8.8A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.5 2.6Z" />
        <path d="M8.5 10.5h2M13.5 10.5h2M12 8.5v4" />
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg {...sharedProps}>
        <path d="m12 3 7 3v5.2c0 4.4-2.9 7.7-7 9.8-4.1-2.1-7-5.4-7-9.8V6l7-3Z" />
        <path d="m8.8 11.8 2.1 2.1 4.4-4.4" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 20c.5-3.1 2.4-5 5.5-5s5 1.9 5.5 5M14 15.5c2.9-.2 5 1.4 5.5 4.5" />
    </svg>
  );
}

export default function Hero() {
  const { openModal } = useAppointmentModal();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#F7FAF9] text-blue-900"
    >
      <HeroSlider />

      <Container
        size="wide"
        className="relative z-10 flex w-full flex-col items-start gap-[clamp(0.75rem,3vh,1.5rem)] pt-[clamp(6rem,14vh,8rem)] pb-[clamp(4.5rem,10vh,6rem)] lg:max-w-[1440px] lg:pr-[48%]"
      >
        <span className="rounded-sm bg-white/35 px-2 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#A97820] shadow-[0_2px_8px_rgba(255,255,255,0.2)] backdrop-blur-sm">
          {SITE.locality}
        </span>

        <h1
          id="hero-heading"
          className="max-w-3xl break-words font-sans text-[clamp(2.15rem,6vh,4.25rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.02em] text-blue-900"
        >
          YOUR SMILE.
          <br />
          <span className="text-gold-500">OUR PRIORITY.</span>
        </h1>

        <SmileDivider colorClassName="text-gold-500" />

        <p className="max-w-lg text-base leading-relaxed text-blue-900/75 sm:text-lg">
          {SITE.description}
        </p>

        {/* Real Google rating — do not add or invent any other statistics here. */}
        <div className="flex items-center gap-2 text-sm text-blue-900/80">
          <span aria-hidden="true" className="text-gold-500">
            ★★★★★
          </span>
          <span className="font-semibold">{GOOGLE_RATING.score} on Google</span>
          <a
            href={GOOGLE_RATING.mapsUrl}
            className="text-blue-900/65 underline decoration-blue-900/25 underline-offset-2 hover:text-blue-900"
          >
            ({GOOGLE_RATING.reviewCount} reviews)
          </a>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <Button
            type="button"
            onClick={openModal}
            variant="primary"
            className="!bg-[#0F9D95] !text-white shadow-[0_8px_22px_rgba(15,157,149,0.28)] transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:!bg-[#087F7A] hover:!text-white"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 flex-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
              <path d="M16 2.5v4M8 2.5v4M3 9.5h18" />
            </svg>
            Book an Appointment
          </Button>
          <Button
            href={buildTelUrl(CONTACT.phone)}
            variant="secondary"
            className="!border-[#C5963A] !bg-[#C5963A] !text-white shadow-[0_8px_20px_rgba(16,44,69,0.2)] transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:!border-[#A97B2D] hover:!bg-[#A97B2D] hover:!text-white"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 flex-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6.5 3.5h3l1.5 4-2 1.5a15 15 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2C11.1 19.5 4.5 12.9 4.5 5.5a2 2 0 0 1 2-2Z" />
            </svg>
            Call Now
          </Button>
        </div>

        <ul className="grid w-full max-w-3xl grid-cols-1 gap-3 pb-2 pt-1 text-blue-900/80 sm:grid-cols-3 sm:gap-0">
          {HERO_BENEFITS.map((benefit, index) => (
            <li
              key={benefit}
              className={`flex min-w-0 items-center justify-center gap-3 px-4 sm:my-2 sm:px-5 ${index > 0 ? "sm:border-l sm:border-blue-900/15" : ""}`}
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-blue-900/25 bg-white/35 text-blue-900 shadow-[0_2px_8px_rgba(16,44,69,0.12)] backdrop-blur-sm">
                <HeroBenefitIcon index={index} />
              </span>
              <span className="min-w-0 max-w-[11rem] text-xs font-medium leading-[1.25] text-blue-900/80 sm:text-[0.6875rem]">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </Container>

    </section>
  );
}
