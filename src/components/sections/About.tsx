import Image from "next/image";
import Container from "@/components/ui/Container";
import SmileDivider from "@/components/ui/SmileDivider";
import { SITE } from "@/lib/constants";

/**
 * "About the Clinic" section. Contained, brochure-style two-column layout —
 * matches the pattern used by the Dentist section (moderate, rounded image
 * card + text), not a full-bleed edge-to-edge image. Mobile source order is
 * image, then text, which stacks correctly since this is a column on
 * mobile and a row on desktop.
 */
export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-14 sm:py-20">
      <Container className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md flex-1 overflow-hidden rounded-card border border-line bg-canvas-soft lg:mx-0">
          <Image
            src="/images/about-dental-treatment.jpg"
            alt="Dentist performing a dental treatment procedure"
            fill
            sizes="(max-width: 1024px) 100vw, 500px"
            className="object-cover object-[50%_35%]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
            About the clinic
          </span>

          <h2
            id="about-heading"
            className="font-display break-words text-3xl font-medium leading-tight tracking-normal text-blue-900 sm:text-4xl lg:text-5xl"
          >
            Patient-Focused
            <br />
            Dental Care
            <br />
            in Kumananchavadi
          </h2>

          <SmileDivider colorClassName="text-gold-600" />

          <p className="text-base leading-relaxed text-ink/70 sm:text-lg">
            {SITE.name} offers dental care from a modern, comfortable
            clinic located in Shalom Enterprises on Trunk Rd,
            Kumananchavadi. The clinic is focused on making every visit
            straightforward and comfortable for patients in and around
            Kattupakkam and Ponnamallee.
          </p>

          <a
            href="#treatments"
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-blue-700 transition-colors hover:text-gold-600"
          >
            Learn More
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        </div>
      </Container>
    </section>
  );
}
