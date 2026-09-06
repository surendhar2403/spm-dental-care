import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { CLINIC_VALUES } from "@/lib/constants";

export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      aria-labelledby="why-choose-us-heading"
      className="py-14 sm:py-20"
    >
      <Container className="flex flex-col gap-12">
        <SectionHeading
          id="why-choose-us-heading"
          eyebrow="Why choose us"
          title="A clinic built around patient comfort"
          align="center"
        />

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {CLINIC_VALUES.map((value) => (
            <li
              key={value.title}
              className="flex flex-col gap-2 rounded-card border border-line bg-canvas-soft p-6"
            >
              <span
                aria-hidden="true"
                className="h-2 w-8 rounded-full bg-gold-600"
              />
              <span className="font-display text-lg text-blue-800">
                {value.title}
              </span>
              <p className="text-sm leading-relaxed text-ink/70">
                {value.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
