"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: TestimonialsSection
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Displays a carousel of feedback quotes from student users.
 * 
 * WHY IT EXISTS:
 * Builds credibility using real feedback.
 * 
 * HOW IT WORKS (Technical Overview):
 * Styled review cards arranged in a grid or horizontal layout list.
 * ============================================================================
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";
import type { Testimonial } from "@/hooks/useTestimonials";
import { useTranslation } from "react-i18next";

// ── Star rating ────────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < rating
              ? "text-[#F59E0B] fill-[#F59E0B]"
              : "text-brand-border fill-brand-border"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ── Testimonial card ───────────────────────────────────────────────────────────
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { t } = useTranslation();
  return (
    <article
      className="h-full bg-white rounded-[10px] border border-brand-border p-7 flex flex-col gap-5 shadow-sm"
      aria-label={`Testimonial from ${testimonial.name}`}
    >
      <blockquote className="flex-1">
        <p className="text-[18px] italic leading-relaxed text-brand-dark">
          &ldquo;{t(testimonial.quoteKey)}&rdquo;
        </p>
      </blockquote>

      <footer className="flex items-center gap-4">
        <div
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white text-base font-bold shrink-0 select-none"
          style={{ backgroundColor: testimonial.avatarColor }}
          aria-hidden="true"
        >
          {testimonial.initials}
        </div>

        <div>
          <StarRating rating={testimonial.rating} />
          <p className="text-sm font-bold text-brand-dark mt-1 leading-snug">
            {testimonial.name}
          </p>
          <p className="text-xs text-brand-body/70 leading-snug">
            {t(testimonial.roleKey)}
          </p>
        </div>
      </footer>
    </article>
  );
}

// ── Main section ───────────────────────────────────────────────────────────────
export default function TestimonialsSection() {
  const { t } = useTranslation();
  const { testimonials } = useTestimonials();
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = testimonials.length;

  const goTo = useCallback(
    (index: number) => {
      const clamped = ((index % total) + total) % total;
      const track = trackRef.current;
      const card = cardRefs.current[clamped];
      if (!track || !card) return;
      track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
      setActiveIndex(clamped);
    },
    [total]
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((curr) => {
        const nextIdx = (curr + 1) % total;
        const track = trackRef.current;
        const card = cardRefs.current[nextIdx];
        if (track && card) {
          track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
        }
        return nextIdx;
      });
    }, 4500);
    return () => clearInterval(id);
  }, [isPaused, total]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const { scrollLeft, scrollWidth } = track;
      const approxCardWidth = scrollWidth / total;
      const index = Math.min(Math.round(scrollLeft / approxCardWidth), total - 1);
      setActiveIndex(index);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [total]);

  return (
    <section className="w-full bg-white" aria-labelledby="testimonials-heading">
      <div className="max-w-6xl mx-auto py-16 px-6 md:px-12">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <p className="text-sm font-semibold text-brand-blue uppercase tracking-widest mb-3">
            {t("testimonials.eyebrow")}
          </p>
          <h2
            id="testimonials-heading"
            className="text-[32px] font-bold text-brand-dark leading-tight mb-3.5"
          >
            {t("testimonials.heading")}
          </h2>
          <p className="text-[15px] text-brand-body max-w-[540px]">
            {t("testimonials.subheading")}
          </p>
        </div>

        {/* Carousel track */}
        <div
          ref={trackRef}
          className="relative flex gap-5 overflow-x-scroll snap-x snap-mandatory scrollbar-hide pb-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          role="region"
          aria-label="Testimonials carousel"
          aria-live="polite"
        >
          {testimonials.map((item, i) => (
            <div
              key={item.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="snap-start shrink-0 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
              aria-hidden={i !== activeIndex}
            >
              <TestimonialCard testimonial={item} />
            </div>
          ))}
        </div>

        {/* Navigation bar */}
        <div className="mt-8 flex items-center justify-between">

          {/* Prev / Next arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-brand-border bg-white flex items-center justify-center text-brand-body hover:border-brand-blue hover:text-brand-blue transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-brand-border bg-white flex items-center justify-center text-brand-body hover:border-brand-blue hover:text-brand-blue transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial indicators">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={activeIndex === i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  activeIndex === i
                    ? "w-5 h-2.5 bg-brand-blue"
                    : "w-2.5 h-2.5 bg-brand-border hover:bg-brand-body/40"
                }`}
              />
            ))}
          </div>

          {/* Counter (hidden on mobile) */}
          <p className="hidden sm:block text-sm text-brand-body/60 font-medium tabular-nums w-10 text-right">
            {activeIndex + 1}&thinsp;/&thinsp;{total}
          </p>

        </div>
      </div>
    </section>
  );
}
