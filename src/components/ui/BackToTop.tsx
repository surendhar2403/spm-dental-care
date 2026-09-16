"use client";

import { useEffect, useState } from "react";

// Button appears once the page has scrolled roughly one viewport-ish section
// down, and hides again as soon as the user is back near the top.
const SHOW_AFTER_SCROLL_PX = 400;

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > SHOW_AFTER_SCROLL_PX);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleClick() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      tabIndex={isVisible ? 0 : -1}
      className={`fixed right-4 bottom-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-blue-100 bg-blue-900/95 text-canvas shadow-lg backdrop-blur transition-all duration-300 hover:bg-blue-800 focus-visible:bg-blue-800 sm:right-6 sm:bottom-6 sm:h-12 sm:w-12 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 sm:h-6 sm:w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
