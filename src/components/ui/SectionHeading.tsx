import SmileDivider from "@/components/ui/SmileDivider";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Set when the section sits on the dark blue background (e.g. none yet, reserved for future use) */
  inverted?: boolean;
  id?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverted = false,
  id,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const eyebrowColor = inverted ? "text-gold-500" : "text-blue-600";
  const titleColor = inverted ? "text-canvas" : "text-ink";
  const descriptionColor = inverted ? "text-canvas/80" : "text-ink/70";

  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignment}`}>
      <span
        className={`text-xs font-semibold uppercase tracking-[0.2em] ${eyebrowColor}`}
      >
        {eyebrow}
      </span>
      <h2 id={id} className={`text-3xl font-medium sm:text-4xl ${titleColor}`}>
        {title}
      </h2>
      <SmileDivider colorClassName={inverted ? "text-gold-500" : "text-gold-600"} />
      {description ? (
        <p className={`text-base leading-relaxed sm:text-lg ${descriptionColor}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
