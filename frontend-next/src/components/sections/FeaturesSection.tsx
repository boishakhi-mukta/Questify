"use client";

import Link from "next/link";
import { Zap, TrendingUp, Trophy, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

interface FeatureConfig {
  icon:      LucideIcon;
  iconColor: string;
  iconBg:    string;
  cardFrom:  string;
  cardTo:    string;
  titleKey:  string;
  descKey:   string;
  ctaKey:    string;
  ctaHref:   string;
}

const featureConfigs: FeatureConfig[] = [
  {
    icon:      Zap,
    iconColor: "text-[#2563EB]",
    iconBg:    "bg-[#DBEAFE]",
    cardFrom:  "#EBF3FF",
    cardTo:    "#DDE8FC",
    titleKey:  "features.earnXp.title",
    descKey:   "features.earnXp.description",
    ctaKey:    "features.earnXp.cta",
    ctaHref:   "#how-it-works",
  },
  {
    icon:      TrendingUp,
    iconColor: "text-[#059669]",
    iconBg:    "bg-[#D1FAE5]",
    cardFrom:  "#E6F4EE",
    cardTo:    "#D1EDE0",
    titleKey:  "features.trackProgress.title",
    descKey:   "features.trackProgress.description",
    ctaKey:    "features.trackProgress.cta",
    ctaHref:   "/student",
  },
  {
    icon:      Trophy,
    iconColor: "text-[#7C3AED]",
    iconBg:    "bg-[#EDE9FB]",
    cardFrom:  "#EDE9FB",
    cardTo:    "#DDD5F8",
    titleKey:  "features.joinLeaderboard.title",
    descKey:   "features.joinLeaderboard.description",
    ctaKey:    "features.joinLeaderboard.cta",
    ctaHref:   "/courses",
  },
  {
    icon:      Sparkles,
    iconColor: "text-[#D97706]",
    iconBg:    "bg-[#FEF3C7]",
    cardFrom:  "#FEF6E4",
    cardTo:    "#FDE8C4",
    titleKey:  "features.aiLearning.title",
    descKey:   "features.aiLearning.description",
    ctaKey:    "features.aiLearning.cta",
    ctaHref:   "/student",
  },
];

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-white" aria-labelledby="features-heading">
      <div className="max-w-6xl mx-auto py-16 px-6 md:px-12">

        {/* Section header */}
        <ScrollReveal direction="up" className="flex flex-col items-center text-center mb-12">
          <p className="text-sm font-semibold text-brand-blue uppercase tracking-widest mb-3">
            {t("features.eyebrow")}
          </p>
          <h2 id="features-heading" className="text-[32px] font-bold text-brand-dark leading-tight mb-3.5">
            {t("features.heading")}
          </h2>
          <p className="text-[15px] text-brand-body leading-relaxed max-w-[600px]">
            {t("features.body")}
          </p>
        </ScrollReveal>

        {/* Feature cards grid */}
        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          staggerChildren={0.09}
          delayChildren={0.1}
        >
          {featureConfigs.map(({ icon: Icon, iconColor, iconBg, cardFrom, cardTo, titleKey, descKey, ctaKey, ctaHref }) => (
            <StaggerItem key={titleKey}>
              <article
                className="flex flex-col gap-4 rounded-[10px] p-7 w-full h-full border border-transparent transition-shadow duration-250 hover:-translate-y-1 hover:shadow-lg hover:border-brand-border"
                style={{ background: `linear-gradient(145deg, ${cardFrom} 0%, ${cardTo} 100%)` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`} aria-hidden="true">
                  <Icon size={22} className={iconColor} strokeWidth={2.2} />
                </div>
                <h3 className="text-base font-bold text-brand-dark leading-snug">{t(titleKey)}</h3>
                <p className="text-sm text-brand-body leading-relaxed flex-1">{t(descKey)}</p>
                <Link
                  href={ctaHref}
                  className={`self-start text-sm font-semibold ${iconColor} hover:underline underline-offset-2 transition-colors`}
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
