"use client";

import { HiCalendar, HiDocumentCheck, HiBookOpen, HiTrophy } from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

interface CardConfig {
  icon:           IconType;
  iconColorClass: string;
  bgClass:        string;
  titleKey:       string;
  descKey:        string;
}

const cardConfigs: CardConfig[] = [
  {
    icon:           HiCalendar,
    iconColorClass: "text-[#3B62D9]",
    bgClass:        "bg-[#EBF1FB]",
    titleKey:       "howItWorks.attendance.title",
    descKey:        "howItWorks.attendance.description",
  },
  {
    icon:           HiDocumentCheck,
    iconColorClass: "text-[#2A9D6E]",
    bgClass:        "bg-[#E6F4EE]",
    titleKey:       "howItWorks.assignment.title",
    descKey:        "howItWorks.assignment.description",
  },
  {
    icon:           HiBookOpen,
    iconColorClass: "text-[#D97706]",
    bgClass:        "bg-[#FEF6E4]",
    titleKey:       "howItWorks.reading.title",
    descKey:        "howItWorks.reading.description",
  },
  {
    icon:           HiTrophy,
    iconColorClass: "text-[#7C3AED]",
    bgClass:        "bg-[#EDE9FB]",
    titleKey:       "howItWorks.ranking.title",
    descKey:        "howItWorks.ranking.description",
  },
];

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="w-full bg-white">
      <div className="max-w-6xl mx-auto py-16 px-6 md:px-12">

        {/* Section header */}
        <ScrollReveal direction="up" className="flex flex-col items-center text-center mb-12">
          <p className="text-sm font-semibold text-brand-blue uppercase tracking-widest mb-3">
            {t("howItWorks.eyebrow")}
          </p>
          <h2 className="text-[32px] font-bold text-brand-dark mb-3.5 leading-tight">
            {t("howItWorks.heading")}
          </h2>
          <p className="text-[15px] text-brand-body leading-relaxed max-w-[680px]">
            {t("howItWorks.body")}
          </p>
        </ScrollReveal>

        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          staggerChildren={0.1}
          delayChildren={0.05}
        >
          {cardConfigs.map(({ icon: Icon, iconColorClass, bgClass, titleKey, descKey }) => (
            <StaggerItem key={titleKey}>
              <div className={`${bgClass} rounded-[10px] p-7 flex flex-col gap-3.5 h-full`}>
                <Icon size={44} className={iconColorClass} />
                <p className="text-base font-bold text-brand-dark">{t(titleKey)}</p>
                <p className="text-sm text-brand-body leading-relaxed">{t(descKey)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
}
