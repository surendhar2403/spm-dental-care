"use client";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SmileDivider from "@/components/ui/SmileDivider";
import HeroSlider from "@/components/sections/HeroSlider";
import { useAppointmentModal } from "@/components/appointment/AppointmentModalContext";
import { CONTACT, GOOGLE_RATING, SITE } from "@/lib/constants";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/utils";

export default function Hero() {
  const { openModal } = useAppointmentModal();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-blue-900 text-canvas"
    >
      <HeroSlider />

      <Container
        size="wide"
        className="relative z-10 flex flex-col items-start gap-[clamp(0.75rem,3vh,1.5rem)] pt-[clamp(6rem,14vh,8rem)] pb-[clamp(2rem,8vh,4rem)]"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
          {SITE.locality}
        </span>

        <h1
          id="hero-heading"
          className="max-w-3xl font-hero break-words text-[clamp(1.9rem,6.5vh,5rem)] font-bold uppercase leading-[0.92] tracking-tight"
        >
          Your Smile.
          <br />
          Our Care.
        </h1>

        <SmileDivider colorClassName="text-gold-500" />

        <p className="max-w-lg text-base leading-relaxed text-canvas/85 sm:text-lg">
          {SITE.description}
        </p>

        {/* Real Google rating — do not add or invent any other statistics here. */}
        <div className="flex items-center gap-2 text-sm text-canvas/90">
          <span aria-hidden="true" className="text-gold-500">
            ★★★★★
          </span>
          <span className="font-semibold">{GOOGLE_RATING.score} on Google</span>
          <a
            href={GOOGLE_RATING.mapsUrl}
            className="text-canvas/70 underline decoration-canvas/30 underline-offset-2 hover:text-canvas"
          >
            ({GOOGLE_RATING.reviewCount} reviews)
          </a>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <Button type="button" onClick={openModal} variant="primary">
            Book an Appointment
          </Button>
          <Button href={buildTelUrl(CONTACT.phone)} variant="secondary">
            Call Now
          </Button>
          <Button
            href={buildWhatsAppUrl(
              CONTACT.whatsapp,
              "Hi, I'd like to book an appointment at SPM Dental Care.",
            )}
            variant="secondary"
          >
            WhatsApp Us
          </Button>
        </div>
      </Container>
    </section>
  );
}
