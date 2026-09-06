import { CONTACT, GOOGLE_RATING, SITE } from "@/lib/constants";

/**
 * Dentist/LocalBusiness structured data. Every value here traces back to
 * information explicitly provided by the clinic — do not add fields
 * (priceRange, founder, awards, etc.) that weren't supplied.
 */
export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: SITE.name,
    image: `${SITE.url}/images/logo.png`,
    telephone: `+91${CONTACT.phone}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.addressLines.join(", "),
      addressLocality: "Chennai",
      addressRegion: "Tamil Nadu",
      postalCode: "600056",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "21:00",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: GOOGLE_RATING.score,
      reviewCount: GOOGLE_RATING.reviewCount,
    },
    url: SITE.url,
    hasMap: CONTACT.mapsUrl,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
