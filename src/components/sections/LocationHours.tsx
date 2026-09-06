import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { CONTACT } from "@/lib/constants";

// Key-free embed: Google Maps supports a plain search query in an iframe.
const mapsEmbedQuery = encodeURIComponent(
  `Shalom Enterprises, ${CONTACT.addressLines.join(" ")}`,
);
const mapsEmbedSrc = `https://www.google.com/maps?q=${mapsEmbedQuery}&output=embed`;

export default function LocationHours() {
  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="bg-canvas-soft py-14 sm:py-20"
    >
      <Container className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="flex flex-1 flex-col gap-8">
          <SectionHeading
            id="location-heading"
            eyebrow="Location"
            title="Find us in Kumananchavadi"
          />

          <address className="flex flex-col gap-1 not-italic text-sm text-ink/80">
            {CONTACT.locatedIn ? (
              <p className="font-medium text-ink">Located in {CONTACT.locatedIn}</p>
            ) : null}
            {CONTACT.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>

          <Button href={CONTACT.mapsUrl} variant="ghost" className="self-start">
            Get Directions
          </Button>

          <div className="flex flex-col gap-2 border-t border-line pt-6">
            <h3 className="font-display text-lg text-blue-800">Opening Hours</h3>
            <ul>
              {CONTACT.hours.map((slot) => (
                <li key={slot.day} className="text-sm text-ink/80">
                  <span className="font-medium text-ink">{slot.day}:</span>{" "}
                  {slot.time}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full flex-1 overflow-hidden rounded-card border border-line">
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
