"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HERO_IMAGES } from "@/lib/constants";

const SLIDE_INTERVAL_MS = 5000;

/**
 * Full-bleed, auto-advancing hero image slider with a crossfade transition.
 * All slides are rendered up front (each an <Image fill>), so the browser
 * fetches all four immediately and every transition is just an opacity
 * change — no flash, no layout shift, no re-fetching mid-slide.
 */
export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Respect reduced-motion: show a single static image, no auto-rotation.
    if (prefersReducedMotion) {
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, SLIDE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function goToSlide(index: number) {
    setActiveIndex(index);
    // Restart the auto-advance timer from a full interval after a manual jump.
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveIndex((current) => (current + 1) % HERO_IMAGES.length);
      }, SLIDE_INTERVAL_MS);
    }
  }

  return (
    <div className="absolute inset-0">
      {HERO_IMAGES.map((image, index) => (
        <div
          key={image.id}
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image.src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-[center_30%]"
          />
        </div>
      ))}

      {/* Light left-to-right veil keeps the copy readable while preserving every slide. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,250,249,0.96)_0%,rgba(247,250,249,0.86)_34%,rgba(247,250,249,0.38)_58%,rgba(16,44,69,0.08)_100%),linear-gradient(0deg,rgba(16,44,69,0.2),transparent_36%)]" />

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-8">
        {HERO_IMAGES.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`Show slide ${index + 1} of ${HERO_IMAGES.length}`}
            aria-current={index === activeIndex}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "w-6 bg-gold-500"
                : "w-2 bg-canvas/50 hover:bg-canvas/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
