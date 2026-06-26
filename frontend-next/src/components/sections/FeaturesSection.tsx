import Link from "next/link";
import { Zap, TrendingUp, Trophy, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  cardFrom: string;
  cardTo: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    iconColor: "text-[#2563EB]",
    iconBg: "bg-[#DBEAFE]",
    cardFrom: "#EBF3FF",
    cardTo: "#DDE8FC",
    title: "Earn XP Points",
    description:
      "Every action you take earns you points. Attend classes, submit assignments on time, and read course materials to grow your XP score and unlock new milestones.",
    ctaLabel: "See how XP works",
    ctaHref: "#how-it-works",
  },
  {
    icon: TrendingUp,
    iconColor: "text-[#059669]",
    iconBg: "bg-[#D1FAE5]",
    cardFrom: "#E6F4EE",
    cardTo: "#D1EDE0",
    title: "Track Progress",
    description:
      "Real-time dashboards show your attendance rate, completed materials, and assignment scores — all in one place so you always know exactly where you stand.",
    ctaLabel: "View dashboard",
    ctaHref: "/student",
  },
  {
    icon: Trophy,
    iconColor: "text-[#7C3AED]",
    iconBg: "bg-[#EDE9FB]",
    cardFrom: "#EDE9FB",
    cardTo: "#DDD5F8",
    title: "Join Leaderboard",
    description:
      "Every course has its own competitive leaderboard. Earn more XP than your peers, rise through the ranks, and claim your place at the top of the class.",
    ctaLabel: "Explore courses",
    ctaHref: "/courses",
  },
  {
    icon: Sparkles,
    iconColor: "text-[#D97706]",
    iconBg: "bg-[#FEF3C7]",
    cardFrom: "#FEF6E4",
    cardTo: "#FDE8C4",
    title: "AI-Powered Learning",
    description:
      "Smart insights surface your strongest and weakest areas based on your activity. See where you&apos;re excelling and where to focus so you never fall behind.",
    ctaLabel: "View dashboard",
    ctaHref: "/student",
  },
];

export default function FeaturesSection() {
  return (
    <section
      className="w-full bg-white"
      aria-labelledby="features-heading"
    >
      <div className="max-w-6xl mx-auto py-16 px-6 md:px-12">

        {/* Section header */}
        <header className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-blue uppercase tracking-widest mb-3">
            Why Questify
          </p>
          <h2
            id="features-heading"
            className="text-[32px] font-bold text-brand-dark text-center leading-tight mb-3.5"
          >
            Everything you need to succeed
          </h2>
          <p className="text-[15px] text-brand-body leading-relaxed max-w-[600px] mx-auto">
            Questify brings gamification to your institution&apos;s courses —
            keeping students engaged, motivated, and accountable every step of the way.
          </p>
        </header>

        {/* Feature cards grid */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          role="list"
          aria-label="Questify platform features"
        >
          {features.map(
            ({
              icon: Icon,
              iconColor,
              iconBg,
              cardFrom,
              cardTo,
              title,
              description,
              ctaLabel,
              ctaHref,
            }) => (
              <li key={title} className="flex">
                <article
                  className="flex flex-col gap-4 rounded-[10px] p-7 w-full border border-transparent transition-all duration-250 hover:-translate-y-1 hover:shadow-lg hover:border-brand-border"
                  style={{
                    background: `linear-gradient(145deg, ${cardFrom} 0%, ${cardTo} 100%)`,
                  }}
                >
                  {/* Icon badge */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                    aria-hidden="true"
                  >
                    <Icon size={22} className={iconColor} strokeWidth={2.2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-brand-dark leading-snug">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-brand-body leading-relaxed flex-1">
                    {description}
                  </p>

                  {/* CTA */}
                  <Link
                    href={ctaHref}
                    className={`self-start text-sm font-semibold ${iconColor} hover:underline underline-offset-2 transition-colors`}
                    aria-label={`${ctaLabel} — learn more about ${title}`}
                  >
                    {ctaLabel} →
                  </Link>
                </article>
              </li>
            )
          )}
        </ul>

      </div>
    </section>
  );
}
