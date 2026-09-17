"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { useAppointmentModal } from "@/components/appointment/AppointmentModalContext";

const INSTAGRAM_URL = "https://www.instagram.com/spm_dental_care?stkn=MXgxYWoybGZ0ZWx2bQ==";
const EMAIL_URL = "mailto:spmhameed999@gmail.com";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { openModal } = useAppointmentModal();

  const wordmarkColor = "text-white";
  const navLinkColor = "text-white/85 hover:text-[#2A9D9A]";
  const iconColor = "border-white/30 text-white";

  useEffect(() => {
    let frameId: number | null = null;

    function updateHeaderProgress() {
      frameId = null;
      setScrollProgress(Math.min(window.scrollY / 96, 1));
    }

    function handleScroll() {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateHeaderProgress);
      }
    }

    updateHeaderProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const tealOpacity = (0.7 + scrollProgress * 0.18).toFixed(3);
  const middleOpacity = (0.52 + scrollProgress * 0.36).toFixed(3);
  const lowerOpacity = (0.28 + scrollProgress * 0.6).toFixed(3);
  const blurAmount = `${Math.round(12 + scrollProgress * 4)}px`;

  const fadeExtension = Math.round((1 - scrollProgress) * 56);
  const fadeEnd = Math.round(48 + scrollProgress * 52);
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 overflow-visible transition-[background-color,backdrop-filter] duration-300"
      style={{
        backgroundColor: "transparent",
      }}
    >
      <style>{`
        @keyframes spm-logo-float {
          0%, 100% { transform: perspective(420px) translateY(0) rotateX(0deg) rotateY(-3deg); }
          50% { transform: perspective(420px) translateY(-2px) rotateX(3deg) rotateY(3deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .spm-logo-badge { animation: none !important; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0"
        style={{
          height: `calc(100% + ${fadeExtension}px)`,
          backgroundImage: `linear-gradient(to bottom, rgba(10, 75, 78, ${tealOpacity}) 0%, rgba(10, 75, 78, ${middleOpacity}) 42%, rgba(10, 75, 78, ${lowerOpacity}) 70%, rgba(10, 75, 78, ${lowerOpacity}) 100%)`,
          backdropFilter: `blur(${blurAmount})`,
          WebkitBackdropFilter: `blur(${blurAmount})`,
          maskImage: `linear-gradient(to bottom, black 0%, black ${fadeEnd}%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${fadeEnd}%, transparent 100%)`,
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5 sm:px-8 sm:py-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 sm:gap-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="spm-logo-badge flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-full border border-white/80 bg-[#F7FAF9] p-0.5 shadow-[0_5px_14px_rgba(16,44,69,0.34)] sm:h-[52px] sm:w-[52px] sm:p-1" style={{ animation: "spm-logo-float 4s ease-in-out infinite" }}>
            <span className="flex h-full w-full scale-[1.22] items-center justify-center">
              <Image
                src="/images/logo-transparent.png"
                alt={`${SITE.name} logo`}
                width={64}
                height={64}
                className="h-full w-full object-contain drop-shadow-[0_1px_2px_rgba(16,44,69,0.22)]"
                unoptimized
                priority
              />
            </span>
          </span>
          <span className="flex min-w-0 flex-col items-start">
            <span
              className={`whitespace-nowrap font-display text-[1.3125rem] font-bold uppercase leading-none tracking-[0.015em] max-[374px]:text-lg sm:text-[2rem] ${wordmarkColor}`}
              style={{ fontFamily: '"DM Serif Display", "Bodoni MT", Didot, Georgia, serif' }}
            >
              {SITE.name}
            </span>
            <span className="mt-1 whitespace-nowrap text-[0.5rem] font-medium uppercase leading-none tracking-[0.13em] text-white/95 sm:text-[0.6875rem] sm:tracking-[0.18em]">
              Healthy Smiles, Brighter Lives
            </span>
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#E2C276] bg-[#C5963A] px-4 py-2 text-sm font-medium text-blue-900 shadow-[0_4px_12px_rgba(197,150,58,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A97B2D] hover:shadow-[0_7px_16px_rgba(197,150,58,0.3)] focus-visible:outline-none"
            >
              Book Appointment
            </button>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              title="Follow us on Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-[linear-gradient(135deg,#F58529_0%,#DD2A7B_45%,#8134AF_72%,#515BD4_100%)] text-white shadow-[0_4px_12px_rgba(221,42,123,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-white hover:shadow-[0_7px_16px_rgba(221,42,123,0.34)] focus-visible:outline-none"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href={EMAIL_URL}
              aria-label="Email us"
              title="Email us"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#12304A] text-white shadow-[0_4px_12px_rgba(16,44,69,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-white/30 hover:bg-[#1A4566] hover:shadow-[0_7px_16px_rgba(16,44,69,0.26)] focus-visible:outline-none"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </a>
          </div>
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
          className="relative border-t border-white/15 bg-[#176B69]/95 px-6 pb-6 pt-2 backdrop-blur-md lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-2 py-3 text-base font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-[#2A9D9A]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-2 border-t border-white/15 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                openModal();
              }}
              className="inline-flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-[#E2C276] bg-[#C5963A] px-4 py-2.5 text-sm font-medium text-blue-900 shadow-[0_4px_12px_rgba(197,150,58,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A97B2D] hover:shadow-[0_7px_16px_rgba(197,150,58,0.3)] focus-visible:outline-none"
            >
              Book Appointment
            </button>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              title="Follow us on Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-[linear-gradient(135deg,#F58529_0%,#DD2A7B_45%,#8134AF_72%,#515BD4_100%)] text-white shadow-[0_4px_12px_rgba(221,42,123,0.22)] transition-all duration-300 hover:border-white hover:shadow-[0_7px_16px_rgba(221,42,123,0.34)] focus-visible:outline-none"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href={EMAIL_URL}
              aria-label="Email us"
              title="Email us"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#12304A] text-white shadow-[0_4px_12px_rgba(16,44,69,0.2)] transition-all duration-300 hover:border-white/30 hover:bg-[#1A4566] hover:shadow-[0_7px_16px_rgba(16,44,69,0.26)] focus-visible:outline-none"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
