"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const ADMISSION_BG =
  "radial-gradient(120% 90% at 50% 78%, rgba(238,250,244,0.9) 0%, rgba(238,250,244,0) 60%), " +
  "linear-gradient(180deg, #b7d3c5 0%, #c4dcd0 30%, #cfe4d7 62%, #d9eee0 100%)";

export default function AdmissionSection() {
  const { t } = useTranslation();

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: ADMISSION_BG }}
      aria-labelledby="admission-heading"
    >
      <div className="relative z-10 w-10/12 mx-auto flex flex-col lg:flex-row items-center py-12 lg:py-0 lg:min-h-[320px]">
        {/* Copy + CTA */}
        <ScrollReveal
          direction="right"
          className="flex-1 text-center lg:text-left lg:pr-8"
        >
          <h2
            id="admission-heading"
            className="font-display text-[28px] sm:text-[36px] lg:text-[40px] font-bold text-brand-dark leading-tight mb-3"
          >
            {t("admission.heading")}
          </h2>
          <p className="text-[16px] text-brand-body leading-relaxed mb-10">
            {t("admission.body")}
          </p>
          <Button
            asChild
            className="rounded-full h-12 px-8 gap-2.5 text-base shadow-md shadow-brand-blue/25 hover:shadow-brand-blue/40 hover:-translate-y-0.5 transition-all duration-200 mt-6"
          >
            <Link href="/contact">
              {t("admission.cta")}
              <ArrowRight size={19} />
            </Link>
          </Button>
        </ScrollReveal>

        {/* Spacer — reserves width for the absolute circle on desktop */}
        <div
          className="hidden lg:block w-70 shrink-0"
          aria-hidden="true"
        />

        {/* Mobile blob — inline below text */}
        <ScrollReveal direction="left" delay={0.1} className="mt-8 lg:hidden">
          <div
            className="w-56 h-56 sm:w-64 sm:h-64 relative overflow-hidden shadow-2xl"
            style={{ borderRadius: "60% 40% 34% 66% / 56% 44% 56% 44%" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80"
              alt="Team of learners collaborating"
              fill
              className="object-cover object-center"
              sizes="256px"
            />
          </div>
        </ScrollReveal>
      </div>

      {/* Desktop blob — absolutely positioned, fills section height */}
      <ScrollReveal
        direction="left"
        delay={0.1}
        className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-[6%]"
      >
        <div
          className="w-72.5 h-72.5 xl:w-77.5 xl:h-77.5 relative overflow-hidden shadow-2xl"
          style={{ borderRadius: "60% 40% 34% 66% / 56% 44% 56% 44%" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80"
            alt="Team of learners collaborating"
            fill
            className="object-cover object-center"
            sizes="310px"
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
