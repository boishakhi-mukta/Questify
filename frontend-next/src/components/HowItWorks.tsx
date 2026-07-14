"use client";

import { HiCalendar, HiDocumentCheck, HiBookOpen, HiTrophy } from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

interface CardConfig {
  icon:     IconType;
  titleKey: string;
  descKey:  string;
}

const cardConfigs: CardConfig[] = [
  { icon: HiCalendar,      titleKey: "howItWorks.attendance.title",  descKey: "howItWorks.attendance.description"  },
  { icon: HiDocumentCheck, titleKey: "howItWorks.assignment.title",   descKey: "howItWorks.assignment.description"   },
  { icon: HiBookOpen,      titleKey: "howItWorks.reading.title",      descKey: "howItWorks.reading.description"      },
  { icon: HiTrophy,        titleKey: "howItWorks.ranking.title",      descKey: "howItWorks.ranking.description"      },
];

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section
      id="how-it-works"
      className="w-full overflow-hidden"
      style={{ background: "linear-gradient(160deg, #d4ede3 0%, #e4f3ec 35%, #eef8f4 65%, #F2FAF7 100%)" }}
    >
      <div className="max-w-6xl mx-auto py-20 px-6 md:px-12">

        <ScrollReveal direction="up" className="flex flex-col items-center text-center mb-16">
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

        {/* Desktop cascade staircase */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="hidden lg:block relative" style={{ height: "555px" }}>
            {cardConfigs.map(({ icon: Icon, titleKey, descKey }, i) => (
              <div
                key={titleKey}
                className="absolute w-[275px] rounded-2xl p-6 shadow-xl transition-transform duration-300 hover:-translate-y-1.5"
                style={{
                  left:       `${i * 198}px`,
                  top:        `${i * 112}px`,
                  zIndex:     i + 1,
                  background: "linear-gradient(145deg, #1B4332 0%, #0F2A1F 100%)",
                }}
              >
                {/* Ghost step number */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 right-4 text-[84px] font-bold leading-none select-none pointer-events-none"
                  style={{ color: "rgba(255,255,255,0.055)" }}
                >
                  {i + 1}
                </span>

                {/* Icon */}
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm shrink-0">
                  <Icon size={22} className="text-brand-blue" />
                </div>

                {/* Title */}
                <h3
                  className="font-bold text-[17px] mb-2.5 leading-snug"
                  style={{ color: "#2DCE9A" }}
                >
                  {t(titleKey)}
                </h3>

                {/* Description */}
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {t(descKey)}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Mobile / tablet 2-col grid */}
        <StaggerContainer
          className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-5"
          staggerChildren={0.1}
          delayChildren={0.05}
        >
          {cardConfigs.map(({ icon: Icon, titleKey, descKey }, i) => (
            <StaggerItem key={titleKey}>
              <div
                className="relative rounded-2xl p-6 overflow-hidden shadow-md"
                style={{ background: "linear-gradient(145deg, #1e3d7b 0%, #112752 100%)" }}
              >
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 right-4 text-[64px] font-bold leading-none select-none pointer-events-none"
                  style={{ color: "rgba(255,255,255,0.055)" }}
                >
                  {i + 1}
                </span>
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Icon size={22} className="text-brand-blue" />
                </div>
                <h3
                  className="font-bold text-[17px] mb-2 leading-snug"
                  style={{ color: "#2DCE9A" }}
                >
                  {t(titleKey)}
                </h3>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {t(descKey)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
}
