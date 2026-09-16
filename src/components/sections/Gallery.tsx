"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { createClient } from "@/lib/supabase/client";
import type { ClinicGalleryImage } from "@/types";
import { GALLERY_IMAGES as FALLBACK_GALLERY_IMAGES } from "@/lib/constants";

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState<ClinicGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="py-14 sm:py-20">
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
                className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-canvas-soft"
              >
                <Image
                  src={item.image_url}
                  alt={item.title || "Clinic gallery image"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
