"use client";

import Link from "next/link";
import { Zap, TrendingUp, Trophy, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

const CARD_BG =
  "radial-gradient(120% 90% at 50% 78%, rgba(238,250,244,0.9) 0%, rgba(238,250,244,0) 60%), " +
  "linear-gradient(180deg, #b7d3c5 0%, #c4dcd0 30%, #cfe4d7 62%, #d9eee0 100%)";

interface FeatureConfig {
  icon:        LucideIcon;
  titleKey:    string;
  descKey:     string;
  ctaKey:      string;
  ctaHref:     string;
  offset:      string;
}

const featureConfigs: FeatureConfig[] = [
  {
    icon:     Zap,
    titleKey: "features.earnXp.title",
    descKey:  "features.earnXp.description",
    ctaKey:   "features.earnXp.cta",
    ctaHref:  "#how-it-works",
    offset:   "lg:mt-0",
  },
  {
    icon:     TrendingUp,
    titleKey: "features.trackProgress.title",
    descKey:  "features.trackProgress.description",
    ctaKey:   "features.trackProgress.cta",
    ctaHref:  "/student",
    offset:   "lg:mt-10",
  },
  {
    icon:     Trophy,
    titleKey: "features.joinLeaderboard.title",
    descKey:  "features.joinLeaderboard.description",
    ctaKey:   "features.joinLeaderboard.cta",
    ctaHref:  "/courses",
    offset:   "lg:mt-20",
  },
  {
    icon:     Sparkles,
    titleKey: "features.aiLearning.title",
    descKey:  "features.aiLearning.description",
    ctaKey:   "features.aiLearning.cta",
    ctaHref:  "/student",
    offset:   "lg:mt-28",
  },
];

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-white" aria-labelledby="features-heading">
      <div className="w-10/12 mx-auto py-20">

        <ScrollReveal direction="up" className="flex flex-col items-center text-center mb-12">
          <p className="text-sm font-semibold text-brand-blue uppercase tracking-widest mb-3">
            {t("features.eyebrow")}
          </p>
          <h2
            id="features-heading"
            className="text-[32px] font-bold text-brand-dark leading-tight mb-3.5"
          >
            {t("features.heading")}
          </h2>
          <p className="text-[15px] text-brand-body leading-relaxed max-w-150">
            {t("features.body")}
          </p>
        </ScrollReveal>

        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start"
          staggerChildren={0.09}
          delayChildren={0.1}
        >
          {featureConfigs.map(({ icon: Icon, titleKey, descKey, ctaKey, ctaHref, offset }) => (
            <StaggerItem key={titleKey} className={offset}>
              <article
                className="flex flex-col rounded-2xl shadow-sm border border-brand-border p-5 gap-4 transition-shadow duration-250 hover:shadow-lg"
                style={{ background: CARD_BG }}
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-[#1B4332]" strokeWidth={2.2} />
                </div>

                {/* Title */}
                <h3 className="font-bold text-[15px] leading-snug text-brand-dark">
                  {t(titleKey)}
                </h3>

                {/* Description */}
                <p className="text-sm text-brand-body leading-relaxed flex-1">
                  {t(descKey)}
                </p>

                {/* CTA */}
                <Link
                  href={ctaHref}
                  className="self-start text-sm font-semibold text-[#1B7A5A] hover:underline underline-offset-2 transition-colors"
                  aria-label={`${t(ctaKey)} — ${t(titleKey)}`}
                >
                  {t(ctaKey)} →
                </Link>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
}
