"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { createClient } from "@/lib/supabase/client";
import type { PublicTestimonial } from "@/types";

const AUTO_ROTATE_MS = 5000;
const REVIEW_AVATAR_COLORS = [
  "bg-[#D9ECF5]",
  "bg-[#E6DDF2]",
  "bg-[#F7DDD2]",
  "bg-[#D9EEE5]",
  "bg-[#F6E8B8]",
  "bg-[#F2D9DF]",
] as const;

function getReviewAvatarColor(review: PublicTestimonial) {
  const key = review.id ?? review.patient_name;
  let hash = 0;

  for (const character of key) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return REVIEW_AVATAR_COLORS[hash % REVIEW_AVATAR_COLORS.length];
}

/**
 * Public testimonials section — reads active reviews from public.testimonials
 * and rotates through them automatically while keeping a clean, minimal style.
 */
export default function Testimonials() {
  const [reviews, setReviews] = useState<PublicTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(1);
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timerReset, setTimerReset] = useState(0);
  const dragStartX = useRef<number | null>(null);

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
      setPage(0);
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
    function updateVisibleCount() {
      setVisibleCount(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1);
    }

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const pageCount = Math.max(1, Math.ceil(reviews.length / visibleCount));

  useEffect(() => {
    setPage(0);
  }, [visibleCount]);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  useEffect(() => {
    if (!reviews.length || pageCount <= 1 || isPaused) return;

    const timerId = window.setTimeout(() => {
      setPage((current) => (current + 1) % pageCount);
    }, AUTO_ROTATE_MS);

    return () => window.clearTimeout(timerId);
  }, [isPaused, page, pageCount, reviews.length, timerReset]);

  function goPrev() {
    if (pageCount <= 1) return;
    setPage((current) => (current - 1 + pageCount) % pageCount);
    setIsPaused(false);
    setTimerReset((current) => current + 1);
  }

  function goNext() {
    if (pageCount <= 1) return;
    setPage((current) => (current + 1) % pageCount);
    setIsPaused(false);
    setTimerReset((current) => current + 1);
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    setIsPaused(false);
    setTimerReset((current) => current + 1);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragStartX.current = event.clientX;
    setIsPaused(true);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;

    const distance = event.clientX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(distance) > 48) {
      if (distance > 0) goPrev();
      else goNext();
    }

    setIsPaused(false);
  }

  const pages = Array.from({ length: pageCount }, (_, pageIndex) =>
    reviews.slice(pageIndex * visibleCount, (pageIndex + 1) * visibleCount),
  );

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="bg-[#C5DCDC] py-14 sm:py-20">
      <Container className="flex flex-col items-center gap-6 px-4 text-center sm:px-8 lg:px-10">
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
        ) : !reviews.length ? (
          <div className="w-full max-w-3xl rounded-card border border-line bg-canvas p-6">
            <p className="text-sm text-ink/60">No patient reviews available yet.</p>
          </div>
        ) : (
          <div className="relative w-full max-w-[1100px] px-4 sm:px-6">
            <button
              type="button"
              aria-label="Previous reviews"
              onClick={goPrev}
              className="absolute left-0 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card text-xl text-blue-700 shadow-sm transition-colors hover:bg-blue-700 hover:text-white disabled:pointer-events-none disabled:opacity-35 sm:h-11 sm:w-11"
            >
              ‹
            </button>

            <div
              className="overflow-hidden touch-pan-y"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => {
                dragStartX.current = null;
                setIsPaused(false);
              }}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${page * 100}%)` }}
              >
                {pages.map((pageReviews, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="grid w-full shrink-0 min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {pageReviews.map((review) => (
                      <article
                        key={review.id}
                        className="flex h-[22rem] min-h-0 min-w-0 flex-col rounded-card border border-line bg-card p-5 text-left shadow-[0_8px_30px_rgba(16,44,69,0.06)] sm:p-6"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold text-[#102C45] ${getReviewAvatarColor(review)}`}>
                            {review.patient_name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{review.patient_name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink/60">
                              <span>{review.source}</span>
                              <span className="inline-flex items-center rounded-full border border-line bg-canvas-soft px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-blue-800">
                                Google
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-1 text-gold-600" aria-label={`${review.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <span key={starIndex} className={starIndex < review.rating ? "text-gold-600" : "text-line"}>
                              ★
                            </span>
                          ))}
                        </div>

                        <blockquote className="mt-4 min-h-0 min-w-0 flex-1 overflow-y-auto border-t border-line pt-4 text-base leading-7 text-ink/90 sm:text-lg sm:leading-8">
                          “{review.review_text}”
                        </blockquote>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label="Next reviews"
              onClick={goNext}
              className="absolute right-0 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card text-xl text-blue-700 shadow-sm transition-colors hover:bg-blue-700 hover:text-white disabled:pointer-events-none disabled:opacity-35 sm:h-11 sm:w-11"
            >
              ›
            </button>

            {pageCount > 1 ? (
              <div className="mt-5 flex items-center justify-center gap-2">
                {pages.map((_, pageIndex) => (
                  <button
                    key={pageIndex}
                    type="button"
                    aria-label={`Show review group ${pageIndex + 1}`}
                    aria-current={pageIndex === page ? "true" : undefined}
                    onClick={() => goToPage(pageIndex)}
                    className={`h-2 rounded-full transition-all duration-300 ${pageIndex === page ? "w-7 bg-blue-700" : "w-2 bg-line"}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </section>
  );
}
