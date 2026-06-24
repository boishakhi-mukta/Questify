"use client";

import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "@/components/ui/button";

export default function HeroBanner() {
  return (
    <section className="w-full bg-brand-bg py-16 px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">

        {/* Left column */}
        <div className="flex-1 flex flex-col gap-5">
          <h1 className="text-5xl font-bold text-brand-dark leading-[1.15]">
            Learn the skills to <br /> shape your future
          </h1>

          <p className="text-base text-brand-body leading-relaxed max-w-[460px]">
            Access world-class courses, earn certifications, and track your
            progress with gamified learning. Taught by expert instructors.
          </p>

          <div className="flex items-center gap-4 flex-wrap mt-1">
            <Button asChild size="lg">
              <Link href="/courses">Explore Courses</Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Right column — Lottie animation */}
        <div className="flex-1 flex justify-center w-full">
          <DotLottieReact
            src="/Online Learning Platform.lottie"
            loop
            autoplay
            className="w-full max-w-[480px]"
          />
        </div>

      </div>
    </section>
  );
}
