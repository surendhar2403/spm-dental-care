import type { ElementType, ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /**
   * "default" (max-w-6xl / 1152px) is used by every regular section.
   * "wide" (1440px, slightly tighter large-screen padding) is used only by
   * the Header and Hero, so their content uses more of the viewport on
   * large screens without looking edge-to-edge or losing mobile padding.
   */
  size?: "default" | "wide";
}

/**
 * Consistent max-width + horizontal padding wrapper used by every section,
 * so page rhythm stays aligned as new sections are added later.
 */
export default function Container({
  children,
  as: Tag = "div",
  className = "",
  size = "default",
}: ContainerProps) {
  const sizeClasses =
    size === "wide"
      ? "max-w-[1440px] px-6 sm:px-8 lg:px-8"
      : "max-w-6xl px-6 sm:px-8 lg:px-10";

  return (
    <Tag className={`mx-auto w-full ${sizeClasses} ${className}`}>
      {children}
    </Tag>
  );
}
