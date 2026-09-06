"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAppointmentModal } from "@/components/appointment/AppointmentModalContext";
import { NAV_LINKS, SITE } from "@/lib/constants";

// Once the page has scrolled past the hero's transparent zone, the header
// switches to a solid background so it stays readable over lighter sections.
const SCROLL_THRESHOLD_PX = 24;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { openModal } = useAppointmentModal();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // While transparent (top of the hero), text/icons go light over the photo.
  // Once scrolled, the header becomes solid and text/icons go dark again.
  const wordmarkColor = isScrolled ? "text-blue-900" : "text-canvas";
  const navLinkColor = isScrolled
    ? "text-ink/80 hover:text-blue-700"
    : "text-canvas/90 hover:text-gold-400";
  const iconColor = isScrolled
    ? "border-blue-900/20 text-blue-900"
    : "border-canvas/40 text-canvas";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? "border-b border-line/70 bg-canvas/95 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* Subtle top-down darkening so the logo/nav stay legible over any hero photo, even before the hero's own overlay has much effect near the very top edge. */}
      {!isScrolled && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-900/55 to-transparent"
        />
      )}

      <div className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5 sm:px-8 sm:py-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 sm:gap-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/images/logo-transparent.png"
            alt={`${SITE.name} logo`}
            width={64}
            height={64}
            className="h-14 w-14 flex-none object-contain sm:h-16 sm:w-16"
            priority
          />
          <span
            className={`font-display text-xl font-bold uppercase tracking-wide max-[374px]:text-lg sm:text-3xl ${wordmarkColor}`}
          >
            {SITE.name}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${navLinkColor}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            onClick={openModal}
            variant={isScrolled ? "ghost" : "secondary"}
            className="text-sm"
          >
            Book Appointment
          </Button>
        </nav>

        <button
          type="button"
          className={`inline-flex items-center justify-center rounded-full border p-2 lg:hidden ${iconColor}`}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h16M4 12h16M4 17h16"
              />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="relative border-t border-line/70 bg-canvas px-6 pb-6 pt-2 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-2 py-3 text-base font-medium text-ink/80 hover:bg-blue-100 hover:text-blue-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              openModal();
            }}
            variant="primary"
            className="mt-4 w-full"
          >
            Book Appointment
          </Button>
        </nav>
      ) : null}
    </header>
  );
}
