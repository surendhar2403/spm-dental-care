"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { createClient } from "@/lib/supabase/client";
import type { ClinicGalleryImage } from "@/types";
import { GALLERY_IMAGES as FALLBACK_GALLERY_IMAGES } from "@/lib/constants";

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState<ClinicGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("clinic_gallery")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });

        if (error) {
          console.error("[Gallery] Supabase error:", error);
          setGalleryImages([]);
          return;
        }

        setGalleryImages((data ?? []) as ClinicGalleryImage[]);
      } catch (err) {
        console.error("[Gallery] Unexpected error:", err);
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, []);

  const items = galleryImages.length > 0 ? galleryImages : FALLBACK_GALLERY_IMAGES.map((item) => ({
    id: item.id,
    title: item.alt,
    image_url: item.src,
    storage_path: null,
    sort_order: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  function closeLightbox() {
    setSelectedIndex(null);
  }

  function showPrevious() {
    setSelectedIndex((current) => {
      if (current === null || items.length === 0) return current;
      return (current - 1 + items.length) % items.length;
    });
  }

  function showNext() {
    setSelectedIndex((current) => {
      if (current === null || items.length === 0) return current;
      return (current + 1) % items.length;
    });
  }

  useEffect(() => {
    if (selectedIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;

    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) > 48) {
      if (distance > 0) showPrevious();
      else showNext();
    }
  }

  const selectedItem = selectedIndex === null ? null : items[selectedIndex];

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="bg-canvas-soft py-14 sm:py-20">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          id="gallery-heading"
          eyebrow="Gallery"
          title="Inside SPM Dental Care"
          align="center"
        />

        {loading && galleryImages.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="aspect-[4/3] animate-pulse rounded-card border border-line bg-canvas-soft" />
            ))}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-card shadow-[0_8px_30px_rgba(16,44,69,0.06)]"
              >
                <button
                  type="button"
                  aria-label={`Open ${item.title || "clinic gallery image"}`}
                  onClick={() => setSelectedIndex(items.findIndex((galleryItem) => galleryItem.id === item.id))}
                  className="absolute inset-0 h-full w-full focus-visible:outline-none"
                >
                  <Image
                    src={item.image_url}
                    alt={item.title || "Clinic gallery image"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Container>

      {selectedItem && selectedIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image viewer"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm transition-opacity duration-300 sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close gallery"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-2xl text-white shadow-lg transition-colors hover:bg-white hover:text-blue-900 sm:right-6 sm:top-6"
          >
            <span aria-hidden="true">×</span>
          </button>

          <button
            type="button"
            aria-label="Previous image"
            onClick={showPrevious}
            className="absolute left-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-2xl text-white shadow-lg transition-colors hover:bg-white hover:text-blue-900 sm:left-6 sm:h-12 sm:w-12"
          >
            <span aria-hidden="true">‹</span>
          </button>

          <div className="flex max-h-full max-w-full touch-none items-center justify-center">
            <img
              key={selectedItem.id}
              src={selectedItem.image_url}
              alt={selectedItem.title || "Clinic gallery image"}
              className="max-h-[calc(100vh-7rem)] max-w-[calc(100vw-6rem)] object-contain transition-transform duration-300 sm:max-h-[calc(100vh-6rem)] sm:max-w-[calc(100vw-10rem)]"
            />
          </div>

          <button
            type="button"
            aria-label="Next image"
            onClick={showNext}
            className="absolute right-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-2xl text-white shadow-lg transition-colors hover:bg-white hover:text-blue-900 sm:right-6 sm:h-12 sm:w-12"
          >
            <span aria-hidden="true">›</span>
          </button>

          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm font-medium text-white/90 sm:bottom-6">
            {selectedIndex + 1} / {items.length}
          </span>
        </div>
      ) : null}
    </section>
  );
}
