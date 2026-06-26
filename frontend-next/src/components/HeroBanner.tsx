"use client";

import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "@/components/ui/button";

export default function HeroBanner() {
  return (
    <section className="w-full bg-brand-bg py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4">

        {/* Left — text + CTAs */}
        <div className="flex flex-col gap-5 flex-1">
          <p className="text-sm font-semibold text-brand-blue uppercase tracking-widest">
            Welcome to Questify
          </p>
          <h1 className="text-5xl font-bold text-brand-dark leading-[1.15]">
            Every Click Counts. Every Achievement Matters.
          </h1>
          <p className="text-base text-brand-body leading-relaxed max-w-[520px]">
            Learn, participate, and earn rewards through an engaging learning experience
            designed to keep students motivated and successful.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Button asChild size="lg">
              <Link href="/courses">Explore Courses</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Right — Lottie animation */}
        <div className="flex-1 flex justify-center">
          <DotLottieReact
            src="/Online Learning Platform.lottie"
            loop
            autoplay
            className="w-full max-w-[420px]"
          />
        </div>

      </div>
    </section>
  );
}
