"use client";

import Link from "next/link";
import { Zap, TrendingUp, Trophy, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

interface FeatureConfig {
  icon:       LucideIcon;
  headerBg:   string;
  accentBg:   string;
  iconColor:  string;
  titleKey:   string;
  descKey:    string;
  ctaKey:     string;
  ctaHref:    string;
}

const featureConfigs: FeatureConfig[] = [
  {
    icon:      Zap,
    headerBg:  "#2DCE9A",
    accentBg:  "#EDFAF5",
    iconColor: "text-[#1B9970]",
    titleKey:  "features.earnXp.title",
    descKey:   "features.earnXp.description",
    ctaKey:    "features.earnXp.cta",
    ctaHref:   "#how-it-works",
  },
  {
    icon:      TrendingUp,
    headerBg:  "#1B7A5A",
    accentBg:  "#E0F5ED",
    iconColor: "text-[#1B7A5A]",
    titleKey:  "features.trackProgress.title",
    descKey:   "features.trackProgress.description",
    ctaKey:    "features.trackProgress.cta",
    ctaHref:   "/student",
  },
  {
    icon:      Trophy,
    headerBg:  "#1B4332",
    accentBg:  "#D6EFE5",
    iconColor: "text-[#1B4332]",
    titleKey:  "features.joinLeaderboard.title",
    descKey:   "features.joinLeaderboard.description",
    ctaKey:    "features.joinLeaderboard.cta",
    ctaHref:   "/courses",
  },
  {
    icon:      Sparkles,
    headerBg:  "#25B585",
    accentBg:  "#E8FAF4",
    iconColor: "text-[#1B9970]",
    titleKey:  "features.aiLearning.title",
    descKey:   "features.aiLearning.description",
    ctaKey:    "features.aiLearning.cta",
    ctaHref:   "/student",
  },
];

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-brand-bg" aria-labelledby="features-heading">
      <div className="max-w-6xl mx-auto py-16 px-6 md:px-12">

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
          <p className="text-[15px] text-brand-body leading-relaxed max-w-[600px]">
            {t("features.body")}
          </p>
        </ScrollReveal>

        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          staggerChildren={0.09}
          delayChildren={0.1}
        >
          {featureConfigs.map(({ icon: Icon, headerBg, accentBg, iconColor, titleKey, descKey, ctaKey, ctaHref }) => (
            <StaggerItem key={titleKey}>
              <article className="flex flex-col rounded-2xl overflow-hidden shadow-sm border border-brand-border h-full transition-shadow duration-250 hover:shadow-lg">

                {/* Column header — solid brand color */}
                <div className="p-5 shrink-0" style={{ background: headerBg }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.18)" }}>
                    <Icon size={20} className="text-white" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-white font-bold text-[15px] leading-snug">
                    {t(titleKey)}
                  </h3>
                </div>

                {/* Content area */}
                <div className="flex-1 bg-white p-5 flex flex-col gap-4">

                  {/* Description nested card */}
                  <div className="rounded-xl p-4 flex-1" style={{ background: accentBg }}>
                    <p className="text-sm text-brand-body leading-relaxed">
                      {t(descKey)}
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    href={ctaHref}
                    className={`self-start text-sm font-semibold ${iconColor} hover:underline underline-offset-2 transition-colors`}
                    aria-label={`${t(ctaKey)} — ${t(titleKey)}`}
                  >
                    {t(ctaKey)} →
                  </Link>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
}
