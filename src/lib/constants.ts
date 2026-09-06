import type { ClinicValue, ContactDetails, NavLink, Treatment } from "@/types";

/**
 * SITE CONTENT
 * ---------------------------------------------------------------------------
 * This now holds real clinic details supplied by the client (name, dentist,
 * phone, address, hours, treatments, Google rating). It does NOT hold real
 * photos or the logo — none were uploaded yet, so components render labeled
 * placeholder blocks for those until real image files are provided.
 *
 * Do not add invented statistics, review text, years of experience,
 * specialties, or awards here — only what was explicitly supplied.
 */

export const SITE = {
  name: "SPM Dental Care",
  shortName: "SPM Dental",
  tagline: "Your Smile, Our Care",
  description:
    "Quality dental care in Kumananchavadi, Chennai — with comprehensive treatments designed around your comfort and oral health.",
  // Placeholder until a production domain is connected.
  url: "https://www.example.com",
  locality: "Kumananchavadi, Chennai",
};

/**
 * Hero slider images. Note: these were supplied by the client as
 * "professional dental images," but their EXIF metadata carries a photo
 * agency copyright tag and the people/settings don't match SPM Dental
 * Care's own clinic — they read as stock photography, not real clinic
 * photos. Swap these for genuine SPM Dental Care photography when
 * available (see clinic-reception.jpg, clinic-room.jpg, dental-chair.jpg
 * for the clinic's real photos already in use elsewhere on the site).
 */
export const HERO_IMAGES = [
  {
    id: "hero-1",
    src: "/images/hero-1.jpg",
    alt: "Dentist reviewing a digital dental X-ray on a monitor",
  },
  {
    id: "hero-2",
    src: "/images/hero-2.jpg",
    alt: "Dental team treating a patient in a dental chair",
  },
  {
    id: "hero-3",
    src: "/images/hero-3.jpg",
    alt: "Close-up of a patient's healthy, bright smile",
  },
  {
    id: "hero-4",
    src: "/images/hero-4.jpg",
    alt: "Dentist examining a young patient's teeth",
  },
];

export const NAV_LINKS: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Treatments", href: "#treatments" },
  { label: "Our Dentist", href: "#dentist" },
  { label: "Reviews", href: "#reviews" },
  { label: "Gallery", href: "#gallery" },
  { label: "Location", href: "#location" },
  { label: "Contact", href: "#appointment" },
];

export const TREATMENT_GROUPS: { groupName: string; treatments: Treatment[] }[] = [
  {
    groupName: "Restorative Care",
    treatments: [
      {
        id: "root-canal",
        name: "Root Canal Treatment",
        description: "Treatment to relieve pain and save an infected or damaged tooth.",
      },
      {
        id: "dental-crowns",
        name: "Dental Crowns",
        description: "Custom caps that restore the shape, strength, and appearance of a tooth.",
      },
      {
        id: "dental-fillings",
        name: "Dental Fillings",
        description: "Restoring teeth affected by decay or minor damage.",
      },
      {
        id: "dental-implants",
        name: "Dental Implants",
        description:
          "Long-lasting tooth replacement solutions designed to restore function, comfort, and a natural-looking smile.",
      },
    ],
  },
  {
    groupName: "Preventive & General Care",
    treatments: [
      {
        id: "teeth-cleaning",
        name: "Teeth Cleaning",
        description: "Professional cleaning to help maintain healthy teeth and gums.",
      },
      {
        id: "mouth-ulcers",
        name: "Mouth Ulcers",
        description: "Assessment and care for mouth ulcers and related discomfort.",
      },
      {
        id: "gum-treatment",
        name: "Advanced Gum Treatment",
        description: "Care focused on treating gum-related issues.",
      },
      {
        id: "laser-dentistry",
        name: "Laser Dentistry",
        description: "Laser-based treatment options for select dental procedures.",
      },
    ],
  },
  {
    groupName: "Extractions & Replacement",
    treatments: [
      {
        id: "tooth-extractions",
        name: "Tooth Extractions",
        description: "Safe removal of teeth that are damaged, decayed, or causing problems.",
      },
      {
        id: "wisdom-teeth",
        name: "Wisdom Teeth Extraction",
        description: "Removal of impacted or problematic wisdom teeth.",
      },
      {
        id: "dentures",
        name: "Dentures",
        description: "Removable replacements for missing teeth.",
      },
    ],
  },
  {
    groupName: "Orthodontics & Kids",
    treatments: [
      {
        id: "dental-braces",
        name: "Dental Braces",
        description: "Traditional braces to gradually align and straighten teeth.",
      },
      {
        id: "aligners",
        name: "Aligners",
        description: "Clear aligner options for straightening teeth.",
      },
      {
        id: "kids-dentistry",
        name: "Kids Dentistry",
        description: "Dental care designed for younger patients.",
      },
    ],
  },
];

// Flattened list, kept for components that don't need the grouping.
export const TREATMENTS: Treatment[] = TREATMENT_GROUPS.flatMap(
  (group) => group.treatments,
);

export const CLINIC_VALUES: ClinicValue[] = [
  {
    title: "Patient-focused care",
    description: "Every visit is centered on your comfort and your dental needs.",
  },
  {
    title: "Comfortable clinic environment",
    description: "A modern, clean space designed to put patients at ease.",
  },
  {
    title: "Multiple dental treatments",
    description: "From routine cleanings to implants, handled under one roof.",
  },
  {
    title: "Convenient Kumananchavadi location",
    description: "Located in Shalom Enterprises on Trunk Rd, easy to find and reach.",
  },
  {
    title: "Easy appointment options",
    description: "Reach the clinic directly by phone or WhatsApp to book a visit.",
  },
];

export const DENTAL_SPECIALISTS = [
  {
    id: "mohammed-ibrahim",
    name: "Dr Mohammed Ibrahim",
    credentials: "MDS",
    specialty: "Periodontics",
    description: "Cares for gum health and the supporting structures around your teeth.",
  },
  {
    id: "sabiha-naz",
    name: "Dr Sabiha Naz",
    credentials: "MDS",
    specialty: "Orthodontics",
    description: "Aligns teeth and bite for a straighter, healthier smile.",
  },
  {
    id: "saji-ravichandran",
    name: "Dr Saji Ravichandran",
    credentials: "BDS",
    specialty: "Root Canal Care",
    description: "Treats infected or damaged tooth pulp to relieve pain and save the tooth.",
  },
  {
    id: "abirami",
    name: "Dr Abirami",
    credentials: "MDS",
    specialty: "Maxillofacial Surgery",
    description: "Handles surgical needs of the jaw, face, and mouth.",
  },
];

export const GOOGLE_RATING = {
  score: 4.9,
  reviewCount: 14,
  mapsUrl: "https://maps.app.goo.gl/EwTgAWer4MD6tK6EA",
};

export const CONTACT: ContactDetails = {
  phone: "8838524738",
  whatsapp: "8838524738",
  addressLines: [
    "24W8+428, Trunk Rd, MSS Nagar,",
    "Kumananchavadi, Ponnamallee, Kattupakkam,",
    "Chennai, Tamil Nadu 600056",
  ],
  locatedIn: "Shalom Enterprises",
  hours: [{ day: "Monday – Sunday", time: "9:00 AM – 9:00 PM" }],
  mapsUrl: "https://maps.app.goo.gl/EwTgAWer4MD6tK6EA",
};

export const GALLERY_IMAGES = [
  {
    id: "reception",
    src: "/images/clinic-reception.jpg",
    alt: "Consultation and reception area at SPM Dental Care",
  },
  {
    id: "treatment-room",
    src: "/images/clinic-room.jpg",
    alt: "Treatment room with dental chair at SPM Dental Care",
  },
  {
    id: "clinic-interior",
    src: "/images/dental-chair.jpg",
    alt: "Waiting area and dental equipment at SPM Dental Care",
  },
];
