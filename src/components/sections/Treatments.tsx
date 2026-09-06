import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { TREATMENT_GROUPS } from "@/lib/constants";

export default function Treatments() {
  return (
    <section
      id="treatments"
      aria-labelledby="treatments-heading"
      className="bg-canvas-soft py-14 sm:py-20"
    >
      <Container className="flex flex-col gap-14">
        <SectionHeading
          id="treatments-heading"
          eyebrow="Treatments"
          title="Dental treatments at SPM Dental Care"
          description="A range of dental treatments handled under one roof in Kumananchavadi."
          align="center"
        />

        <div className="flex flex-col gap-12">
          {TREATMENT_GROUPS.map((group) => (
            <div key={group.groupName} className="flex flex-col gap-6">
              <h3 className="font-display text-xl text-blue-800">
                {group.groupName}
              </h3>
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {group.treatments.map((treatment) => (
                  <li
                    key={treatment.id}
                    className="flex flex-col gap-3 rounded-card border border-line bg-canvas p-6"
                  >
                    <span
                      aria-hidden="true"
                      className="h-2 w-8 rounded-full bg-gold-600"
                    />
                    <h4 className="font-display text-lg text-ink">
                      {treatment.name}
                    </h4>
                    <p className="text-sm leading-relaxed text-ink/70">
                      {treatment.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
