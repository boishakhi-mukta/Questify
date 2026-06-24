"use client";

import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const scrollToNext = () => {
  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
};

export default function HeroBanner() {
  return (
    <section
      className="w-full min-h-[65vh] flex items-center px-6 md:px-12 py-16 lg:py-24"
      style={{
        background:
          "linear-gradient(160deg, var(--color-brand-white) 0%, var(--color-brand-bg) 50%, var(--color-brand-blue-light) 100%)",
      }}
      aria-labelledby="hero-heading"
    >
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

        {/* ── Left: text content ───────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Eyebrow */}
          <p
            className="fade-in-up text-sm font-semibold text-brand-blue uppercase tracking-widest"
            style={{ animationDelay: "0ms" }}
          >
            Gamified Learning Platform
          </p>

          {/* h1 — main headline */}
          <h1
            id="hero-heading"
            className="fade-in-up text-[clamp(2.5rem,6vw,80px)] font-bold text-brand-dark leading-[1.07] tracking-tight"
            style={{ animationDelay: "80ms" }}
          >
            Learn the skills to<br />
            <span className="text-brand-blue">shape your future</span>
          </h1>

          {/* h2 — subheadline */}
          <h2
            className="fade-in-up text-2xl font-semibold text-brand-body leading-snug"
            style={{ animationDelay: "180ms" }}
          >
            Education that rewards your progress
          </h2>

          {/* Description */}
          <p
            className="fade-in-up text-base text-brand-body leading-relaxed max-w-[480px]"
            style={{ animationDelay: "260ms" }}
          >
            Complete assignments, attend classes, and master course materials
            to earn XP points. Climb the leaderboard, unlock achievements,
            and get certified — taught by expert instructors.
          </p>

          {/* CTAs */}
          <div
            className="fade-in-up flex items-center gap-3 flex-wrap mt-2"
            style={{ animationDelay: "360ms" }}
          >
            <Button asChild size="lg" aria-label="Browse all available courses">
              <Link href="/courses">Explore Courses</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              aria-label="Create a free Questify account"
            >
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>

          {/* Smooth-scroll nudge */}
          <button
            onClick={scrollToNext}
            className="fade-in-up mt-4 self-start flex items-center gap-1.5 text-sm text-brand-body/60 hover:text-brand-blue transition-colors group"
            style={{ animationDelay: "480ms" }}
            aria-label="Scroll down to learn how Questify works"
          >
            <span>See how it works</span>
            <ChevronDown
              className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* ── Right: Lottie animation ───────────────────────── */}
        <div
          className="fade-in-up flex justify-center items-center"
          style={{ animationDelay: "160ms" }}
          role="img"
          aria-label="Animated illustration of an online learning platform"
        >
          <DotLottieReact
            src="/Online Learning Platform.lottie"
            loop
            autoplay
            className="w-full max-w-[520px]"
          />
        </div>

      </div>
    </section>
  );
}
