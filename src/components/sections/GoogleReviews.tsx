import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { GOOGLE_RATING } from "@/lib/constants";

/**
 * Shows only the real, provided Google rating and review count.
 * Deliberately contains no review text — real reviews live on Google,
 * and should never be reproduced or invented here.
 */
export default function GoogleReviews() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="bg-canvas-soft py-14 sm:py-20"
    >
      <Container className="flex flex-col items-center gap-6 text-center">
        <SectionHeading
          id="reviews-heading"
          eyebrow="Patient reviews"
          title="Rated by our patients on Google"
          align="center"
        />

        <div className="flex flex-col items-center gap-2">
          <span aria-hidden="true" className="text-3xl text-gold-600">
            ★★★★★
          </span>
          <p className="text-lg font-semibold text-ink">
            {GOOGLE_RATING.score} out of 5
          </p>
          <p className="text-sm text-ink/70">
            Based on {GOOGLE_RATING.reviewCount} Google reviews
          </p>
        </div>

        <Button href={GOOGLE_RATING.mapsUrl} variant="ghost">
          View our reviews on Google
        </Button>
      </Container>
    </section>
  );
}
