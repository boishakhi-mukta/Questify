"use client";

import { Star } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";
import type { Testimonial } from "@/hooks/useTestimonials";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

// Per-card scatter config: [rotateDeg, translateYpx]  — row 1 then row 2
const SCATTER: [number, number][] = [
  [-3.5, -10],  // row 1 col 1
  [ 2.0,  12],  // row 1 col 2
  [-1.8,  -4],  // row 1 col 3
  [ 1.5,   8],  // row 1 col 4
  [ 2.8,   6],  // row 2 col 1
  [-2.2, -14],  // row 2 col 2
  [ 3.0,  10],  // row 2 col 3
  [-1.5,  -8],  // row 2 col 4
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-brand-border fill-brand-border"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ScatteredCard({ testimonial, rotate, ty }: { testimonial: Testimonial; rotate: number; ty: number }) {
  const { t } = useTranslation();
  return (
    <article
      className="bg-white rounded-2xl border border-brand-border/70 shadow-md p-5 flex flex-col gap-3 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] hover:rotate-0 cursor-default"
      style={{ transform: `rotate(${rotate}deg) translateY(${ty}px)` }}
      aria-label={`Testimonial from ${testimonial.name}`}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 select-none ring-2 ring-white ring-offset-2"
          style={{ backgroundColor: testimonial.avatarColor }}
          aria-hidden="true"
        >
          {testimonial.initials}
        </div>
        <p className="font-bold text-brand-dark text-sm leading-snug">{testimonial.name}</p>
      </div>

      {/* Stars + rating text */}
      <div className="flex items-center gap-2">
        <StarRating rating={testimonial.rating} />
        <span className="text-[11px] text-brand-body/60 font-medium">
          {testimonial.rating}.0 out of 5 stars
        </span>
      </div>

      {/* Quote */}
      <blockquote>
        <p className="text-[13px] text-brand-body leading-relaxed">
          {t(testimonial.quoteKey)}
        </p>
      </blockquote>

      {/* Role */}
      <p className="text-[11px] text-brand-body/50 font-medium">{t(testimonial.roleKey)}</p>
    </article>
  );
}

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const { testimonials } = useTestimonials();

  return (
    <section className="w-full bg-white" aria-labelledby="testimonials-heading">
      <div className="max-w-6xl mx-auto py-20 px-4 md:px-6">

        {/* Heading */}
        <ScrollReveal direction="up" className="flex flex-col items-center text-center mb-16">
          <h2
            id="testimonials-heading"
            className="text-[34px] font-bold text-brand-dark leading-tight max-w-105"
          >
            {t("testimonials.heading")}
          </h2>
        </ScrollReveal>

        {/* Desktop: 4-col × 2-row scattered grid */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="hidden sm:grid grid-cols-4 gap-5 pb-14">
            {testimonials.map((item, i) => {
              const [rotate, ty] = SCATTER[i] ?? [0, 0];
              return (
                <ScatteredCard
                  key={item.id}
                  testimonial={item}
                  rotate={rotate}
                  ty={ty}
                />
              );
            })}
          </div>
        </ScrollReveal>

        {/* Mobile: 2-col grid */}
        <div className="sm:hidden grid grid-cols-2 gap-4">
          {testimonials.map((item) => (
            <ScatteredCard key={item.id} testimonial={item} rotate={0} ty={0} />
          ))}
        </div>

      </div>
    </section>
  );
}
