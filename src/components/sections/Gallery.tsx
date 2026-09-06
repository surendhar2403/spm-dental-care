import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { GALLERY_IMAGES } from "@/lib/constants";

export default function Gallery() {
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="py-14 sm:py-20">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          id="gallery-heading"
          eyebrow="Gallery"
          title="Inside SPM Dental Care"
          align="center"
        />

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {GALLERY_IMAGES.map((item) => (
            <li
              key={item.id}
              className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-canvas-soft"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
