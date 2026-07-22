"use client";

import { useState } from "react";
import { HiCalendar, HiDocumentCheck, HiBookOpen, HiTrophy } from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

const CARD_BG =
  "radial-gradient(120% 90% at 50% 78%, rgba(238,250,244,0.9) 0%, rgba(238,250,244,0) 60%), " +
  "linear-gradient(180deg, #b7d3c5 0%, #c4dcd0 30%, #cfe4d7 62%, #d9eee0 100%)";

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

// The "How It Works" homepage section — walks visitors through the 4 steps
// of using the platform, as a cascading stack of cards on desktop and a
// simple grid on mobile.
export default function HowItWorks() {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      id="how-it-works"
      className="w-full overflow-hidden"
      style={{ background: "linear-gradient(160deg, #d4ede3 0%, #e4f3ec 35%, #eef8f4 65%, #F2FAF7 100%)" }}
    >
      <div className="w-10/12 mx-auto py-20">

        <ScrollReveal direction="up" className="flex flex-col items-center text-center mb-16">
          <p className="text-[15px] font-semibold text-brand-blue uppercase tracking-widest mb-3">
            {t("howItWorks.eyebrow")}
          </p>
          <h2 className="text-[32px] font-bold text-brand-dark mb-3.5 leading-tight">
            {t("howItWorks.heading")}
          </h2>
          <p className="text-[16px] text-brand-body leading-relaxed max-w-[680px]">
            {t("howItWorks.body")}
          </p>
        </ScrollReveal>

        {/* Desktop cascade staircase */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="hidden lg:block relative mx-auto" style={{ height: "555px", width: "869px" }}>
            {cardConfigs.map(({ icon: Icon, titleKey, descKey }, i) => (
              <div
                key={titleKey}
                className="absolute w-[275px] rounded-2xl p-6 shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  left:       `${i * 198}px`,
                  top:        `${i * 112}px`,
                  zIndex:     hoveredIndex === i ? 20 : i + 1,
                  background: CARD_BG,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Ghost step number */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 right-4 text-[84px] font-bold leading-none select-none pointer-events-none"
                  style={{ color: "rgba(0,0,0,0.06)" }}
                >
                  {i + 1}
                </span>

                {/* Icon */}
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm shrink-0">
                  <Icon size={22} className="text-[#1B7A5A]" />
                </div>

                {/* Title */}
                <h3
                  className="font-bold text-[17px] mb-2.5 leading-snug text-brand-dark"
                >
                  {t(titleKey)}
                </h3>

                {/* Description */}
                <p
                  className="text-[14px] leading-relaxed text-brand-body"
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
                style={{ background: CARD_BG }}
              >
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 right-4 text-[64px] font-bold leading-none select-none pointer-events-none"
                  style={{ color: "rgba(0,0,0,0.06)" }}
                >
                  {i + 1}
                </span>
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Icon size={22} className="text-[#1B7A5A]" />
                </div>
                <h3 className="font-bold text-[17px] mb-2 leading-snug text-brand-dark">
                  {t(titleKey)}
                </h3>
                <p className="text-[14px] leading-relaxed text-brand-body">
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
