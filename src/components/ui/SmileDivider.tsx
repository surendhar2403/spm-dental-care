type SmileDividerVariant = "underline" | "sectionTop";

interface SmileDividerProps {
  variant?: SmileDividerVariant;
  className?: string;
  /** Tailwind color utility applied via currentColor, e.g. "text-gold-600" */
  colorClassName?: string;
}

/**
 * The site's signature mark: a soft, asymmetric arc echoing the curve of a
 * smile — used as a heading accent and as the transition between the hero
 * and the sections below it. Deliberately not a literal tooth icon and not
 * a full symmetric wave.
 */
export default function SmileDivider({
  variant = "underline",
  className = "",
  colorClassName = "text-gold-600",
}: SmileDividerProps) {
  if (variant === "sectionTop") {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        className={`block h-16 w-full sm:h-24 ${className}`}
      >
        <path
          d="M0,0 C 280,90 620,4 900,40 C 1120,68 1300,18 1440,0 L1440,96 L0,96 Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 120 14"
      className={`h-3 w-20 ${colorClassName} ${className}`}
    >
      <path
        d="M2 9.5C22 1.5 46 0.5 62 4.5C80 9 100 10.5 118 4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
