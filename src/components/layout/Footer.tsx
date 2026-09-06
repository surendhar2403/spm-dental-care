import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { CONTACT, NAV_LINKS, SITE, TREATMENTS } from "@/lib/constants";
import { buildTelUrl } from "@/lib/utils";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-blue-900 text-canvas">
      <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-canvas p-1">
              <Image
                src="/images/logo.png"
                alt={`${SITE.name} logo`}
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            </span>
            <span className="font-display text-lg font-semibold">{SITE.name}</span>
          </div>
          <p className="text-sm text-canvas/70">{SITE.tagline}</p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Explore
          </span>
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-canvas/80 hover:text-canvas"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Treatments
          </span>
          <ul className="grid grid-cols-1 gap-2">
            {TREATMENTS.slice(0, 8).map((treatment) => (
              <li key={treatment.id}>
                <Link
                  href="#treatments"
                  className="text-sm text-canvas/80 hover:text-canvas"
                >
                  {treatment.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <address className="flex flex-col gap-2 not-italic">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Visit
          </span>
          {CONTACT.locatedIn ? (
            <span className="text-sm text-canvas/80">Located in {CONTACT.locatedIn}</span>
          ) : null}
          {CONTACT.addressLines.map((line) => (
            <span key={line} className="text-sm text-canvas/80">
              {line}
            </span>
          ))}
          <a href={buildTelUrl(CONTACT.phone)} className="text-sm text-canvas/80 hover:text-canvas">
            {CONTACT.phone}
          </a>
          <a
            href={CONTACT.mapsUrl}
            className="text-sm text-canvas/80 underline decoration-canvas/30 underline-offset-2 hover:text-canvas"
          >
            View on Google Maps
          </a>

          <span className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Hours
          </span>
          {CONTACT.hours.map((slot) => (
            <span key={slot.day} className="text-sm text-canvas/80">
              {slot.day}: {slot.time}
            </span>
          ))}
        </address>
      </Container>

      <div className="border-t border-canvas/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-canvas/60">
            &copy; {year} {SITE.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
