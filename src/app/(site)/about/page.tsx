import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { CONTACT, SITE } from "@/lib/constants";

const APPROACH_POINTS = [
  {
    title: "Patient First",
    description: "Every visit is centered on patient comfort and individual dental needs.",
  },
  {
    title: "Clear Guidance",
    description: "Straightforward communication helps patients understand their care.",
  },
  {
    title: "Comfortable Care",
    description: "A modern, clean clinic environment is designed to help patients feel at ease.",
  },
  {
    title: "Modern Practice",
    description: "The clinic provides general and preventive dental care in a comfortable setting.",
  },
];

const WHY_CHOOSE_US = [
  "Patient-focused care built around comfort and dental needs.",
  "A modern, clean clinic environment in Shalom Enterprises on Trunk Rd.",
  "Multiple dental treatments available under one roof.",
  "Convenient appointment options by phone or WhatsApp.",
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-canvas-soft pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pt-40">
        <Container className="flex flex-col gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
            About SPM Dental Care
          </span>
          <h1 className="max-w-4xl font-display text-4xl font-medium leading-tight text-blue-900 sm:text-5xl lg:text-6xl">
            Patient-Focused Dental Care in Kumananchavadi
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/70 sm:text-lg">
            {SITE.name} provides comfortable, modern and patient-focused dental care in
            Kumananchavadi, Chennai, with a straightforward experience for every visit.
          </p>
        </Container>
      </section>

      <section className="py-10 sm:py-14" aria-labelledby="clinic-approach-heading">
        <Container className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
          <SectionHeading
            id="clinic-approach-heading"
            eyebrow="About the clinic"
            title="Care that keeps patients at the centre"
            description="The clinic is focused on making dental care clear, comfortable and straightforward, from the first conversation through each visit."
          />

          <div className="flex flex-1 flex-col gap-4 text-base leading-relaxed text-ink/70 sm:text-lg">
            <p>
              SPM Dental Care offers a comfortable and patient-friendly environment for
              people in and around Kumananchavadi, Kattupakkam and Ponnamallee.
            </p>
            <p>
              Clear communication helps patients understand their care, while the clinic&apos;s
              focus on preventive and general dental care supports a practical treatment
              experience in a modern clinical environment.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-canvas-soft py-10 sm:py-14" aria-labelledby="approach-heading">
        <Container className="flex flex-col gap-8">
          <SectionHeading
            id="approach-heading"
            eyebrow="Our approach"
            title="A simpler, more comfortable way to visit the dentist"
            align="center"
          />

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {APPROACH_POINTS.map((point) => (
              <li
                key={point.title}
                className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-6"
              >
                <span aria-hidden="true" className="h-2 w-8 rounded-full bg-gold-600" />
                <h3 className="font-display text-xl text-blue-800">{point.title}</h3>
                <p className="text-sm leading-relaxed text-ink/70">{point.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-10 sm:py-14" aria-labelledby="why-heading">
        <Container className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
          <SectionHeading
            id="why-heading"
            eyebrow="Why choose SPM Dental Care"
            title="Thoughtful care in a convenient location"
          />

          <ul className="flex flex-1 flex-col gap-4 text-base leading-relaxed text-ink/70 sm:text-lg">
            {WHY_CHOOSE_US.map((reason) => (
              <li key={reason} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-2 w-2 flex-none rounded-full bg-gold-600" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-canvas-soft py-10 sm:py-14" aria-labelledby="about-location-heading">
        <Container className="flex flex-col gap-6">
          <SectionHeading
            id="about-location-heading"
            eyebrow="Location"
            title="Find us in Kumananchavadi, Chennai"
            description="SPM Dental Care is located in Shalom Enterprises on Trunk Rd, Kumananchavadi, Chennai."
          />
          <Button href={CONTACT.mapsUrl} variant="ghost" className="self-start">
            Get Directions
          </Button>
        </Container>
      </section>

      <section className="bg-blue-900 py-10 text-canvas sm:py-14" aria-labelledby="about-cta-heading">
        <Container className="flex flex-col items-start gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Take the next step
          </span>
          <h2 id="about-cta-heading" className="text-3xl font-medium sm:text-4xl">
            Ready to take the next step?
          </h2>
          <Button href="/#appointment" variant="primary">
            Book an Appointment
          </Button>
        </Container>
      </section>
    </>
  );
}
