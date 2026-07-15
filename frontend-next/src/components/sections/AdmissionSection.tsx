"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: AdmissionSection
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * A thin, full-width banner inviting prospective students to reach out about
 * enrolling, linking through to the Contact page.
 *
 * WHY IT EXISTS:
 * Gives undecided visitors a clear, low-friction path to admissions help.
 *
 * HOW IT WORKS (Technical Overview):
 * Copy + CTA sit inside the constrained container; the blob photo is
 * absolutely positioned against the full-width section so it bleeds to the
 * viewport's right edge on large screens, matching the reference banner.
 * ============================================================================
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const ADMISSION_BG =
  "radial-gradient(120% 90% at 50% 78%, rgba(238,250,244,0.9) 0%, rgba(238,250,244,0) 60%), " +
  "linear-gradient(180deg, #b7d3c5 0%, #c4dcd0 30%, #cfe4d7 62%, #d9eee0 100%)";

const BLOB_RADIUS = "58% 42% 46% 54% / 54% 46% 54% 46%";

export default function AdmissionSection() {
  const { t } = useTranslation();

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: ADMISSION_BG }}
      aria-labelledby="admission-heading"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center py-10 lg:py-0 lg:min-h-[260px]">

        {/* Copy + CTA */}
        <ScrollReveal direction="right" className="flex-1 text-center lg:text-left py-6 lg:py-10 lg:pr-20">
          <h2
            id="admission-heading"
            className="font-display text-[30px] sm:text-[38px] lg:text-[42px] font-bold text-brand-dark leading-tight mb-3 xl:whitespace-nowrap"
          >
            {t("admission.heading")}
          </h2>
          <p className="text-[16px] text-brand-body leading-relaxed mb-9 xl:whitespace-nowrap">
            {t("admission.body")}
          </p>
          <Button
            asChild
            className="rounded-full h-12 px-8 gap-2.5 text-base border-2 border-brand-dark text-brand-dark bg-transparent hover:bg-brand-dark hover:text-white transition-colors duration-200"
          >
            <Link href="/contact">
              {t("admission.cta")}
              <ArrowRight size={19} />
            </Link>
          </Button>
        </ScrollReveal>

        {/* Reserves layout space on large screens for the bleeding photo */}
        <div className="hidden lg:block lg:w-[40%] shrink-0" aria-hidden="true" />

        {/* Mobile / tablet photo — normal flow */}
        <ScrollReveal
          direction="left"
          delay={0.1}
          className="w-full max-w-[420px] h-[240px] lg:hidden"
        >
          <div className="relative w-full h-full overflow-hidden shadow-xl" style={{ borderRadius: BLOB_RADIUS }}>
            <Image
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80"
              alt="Students studying together on campus"
              fill
              className="object-cover object-center"
              sizes="420px"
            />
          </div>
        </ScrollReveal>
      </div>

      {/* Desktop photo — bleeds to the viewport's right edge */}
      <ScrollReveal
        direction="left"
        delay={0.1}
        className="hidden lg:block absolute top-6 bottom-6 right-8 w-[40%] max-w-170"
      >
        <div className="relative w-full h-full overflow-hidden shadow-xl" style={{ borderRadius: BLOB_RADIUS }}>
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80"
            alt="Students studying together on campus"
            fill
            className="object-cover object-center"
            sizes="760px"
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
