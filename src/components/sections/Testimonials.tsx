"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { createClient } from "@/lib/supabase/client";
import type { PublicTestimonial } from "@/types";

const AUTO_ROTATE_MS = 5000;

/**
 * Public testimonials section — reads active reviews from public.testimonials
 * and rotates through them automatically while keeping a clean, minimal style.
 */
export default function Testimonials() {
  const [reviews, setReviews] = useState<PublicTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  async function fetchReviews() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, patient_name, review_text, rating, source, sort_order, created_at")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[Testimonials] Supabase error:", error);
        setError("We couldn’t load patient reviews right now. Please try again soon.");
        setReviews([]);
        return;
      }

      setReviews((data ?? []) as PublicTestimonial[]);
      setIndex(0);
    } catch (err) {
      console.error("[Testimonials] Unexpected error:", err);
      setError("We couldn’t load patient reviews right now. Please try again soon.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (!reviews.length || reviews.length <= 1) return;

    const timerId = window.setTimeout(() => {
      setIndex((current) => (current + 1) % reviews.length);
    }, AUTO_ROTATE_MS);

    return () => window.clearTimeout(timerId);
  }, [index, reviews]);

  function goPrev() {
    if (!reviews.length || reviews.length <= 1) return;
    setIndex((current) => (current - 1 + reviews.length) % reviews.length);
  }

  function goNext() {
    if (!reviews.length || reviews.length <= 1) return;
    setIndex((current) => (current + 1) % reviews.length);
  }

  const activeReview = reviews[index] ?? null;

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="bg-canvas-soft py-14 sm:py-20">
      <Container className="flex flex-col items-center gap-6 text-center">
        <SectionHeading
          id="reviews-heading"
          eyebrow="Patient reviews"
          title="What our patients say"
          align="center"
        />

        {loading ? (
          <div className="w-full max-w-3xl animate-pulse">
            <div className="h-52 rounded-card border border-line bg-canvas p-6" />
          </div>
        ) : error ? (
          <div className="w-full max-w-3xl rounded-card border border-line bg-canvas p-6 text-center">
            <p className="text-sm text-ink/70">{error}</p>
            <button
              type="button"
              onClick={fetchReviews}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-canvas transition-colors hover:bg-blue-800"
            >
              Retry
            </button>
          </div>
        ) : !activeReview ? (
          <div className="w-full max-w-3xl rounded-card border border-line bg-canvas p-6">
            <p className="text-sm text-ink/60">No patient reviews available yet.</p>
          </div>
        ) : (
          <div className="w-full max-w-3xl">
            <div className="rounded-card border border-line bg-canvas p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-800">
                  {activeReview.patient_name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-gold-600" aria-label={`${activeReview.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <span key={starIndex} className={starIndex < activeReview.rating ? "text-gold-600" : "text-line"}>
                        ★
                      </span>
                    ))}
                  </div>

                  <blockquote className="text-base leading-relaxed text-ink/90 sm:text-lg">
                    “{activeReview.review_text}”
                  </blockquote>

                  <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-ink">{activeReview.patient_name}</p>
                      <p className="text-sm text-ink/60">{activeReview.source}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-line bg-canvas-soft px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">
                      Google
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {reviews.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  aria-label="Previous review"
                  onClick={goPrev}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas text-lg text-ink transition-colors hover:bg-canvas-soft"
                >
                  ‹
                </button>

                <div className="flex items-center gap-2">
                  {reviews.map((_, reviewIndex) => (
                    <button
                      key={reviewIndex}
                      type="button"
                      aria-label={`Show review ${reviewIndex + 1}`}
                      onClick={() => setIndex(reviewIndex)}
                      className={`h-2.5 rounded-full transition-all ${reviewIndex === index ? "w-8 bg-blue-900" : "w-2.5 bg-line"}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  aria-label="Next review"
                  onClick={goNext}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas text-lg text-ink transition-colors hover:bg-canvas-soft"
                >
                  ›
                </button>
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </section>
  );
}
