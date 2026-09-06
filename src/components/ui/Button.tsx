import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface SharedProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

interface ButtonAsLink extends SharedProps {
  href: string;
  onClick?: () => void;
}

interface ButtonAsButton
  extends SharedProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: undefined;
}

type ButtonProps = ButtonAsLink | ButtonAsButton;

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-gold-600 text-blue-900 hover:bg-gold-500 focus-visible:bg-gold-500",
  secondary:
    "bg-transparent text-canvas border border-canvas/40 hover:bg-canvas/10",
  ghost: "bg-transparent text-blue-900 border border-blue-900/20 hover:bg-blue-100",
};

const BASE_STYLES =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 whitespace-nowrap";

export default function Button({
  children,
  variant = "primary",
  className = "",
  href,
  onClick,
  ...rest
}: ButtonProps) {
  const classes = `${BASE_STYLES} ${VARIANT_STYLES[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      onClick={onClick}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
