"use client";

import { useRef, useState, useEffect } from "react";
import { Users, BookOpen, GraduationCap, Zap, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";
import type { AdminStats } from "@/hooks/useAdminStats";

// ── Count-up hook ──────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, active = false): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || target === 0) return;
    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, duration, active]);

  return value;
}

// ── Number formatter ───────────────────────────────────────────────────────────
function formatStat(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

// ── Stat card ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  subtext: string;
  value: number;
  suffix?: string;
  active: boolean;
  delay: number;
  loading: boolean;
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  subtext,
  value,
  suffix = "",
  active,
  delay,
  loading,
}: StatCardProps) {
  const count = useCountUp(value, 1800, active);

  return (
    <div
      className="bg-white rounded-[10px] border border-brand-border p-6 flex items-center gap-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
        aria-hidden="true"
      >
        <Icon size={26} className={iconColor} strokeWidth={2} />
      </div>

      {/* Text */}
      <div className="min-w-0">
        {loading ? (
          <>
            <div className="h-8 w-24 bg-brand-border/60 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-brand-border/40 rounded animate-pulse" />
            <div className="h-3 w-24 bg-brand-border/30 rounded animate-pulse mt-1" />
          </>
        ) : (
          <>
            <p className="text-[36px] font-bold text-brand-dark leading-none tracking-tight">
              {formatStat(count)}
              {suffix && (
                <span className="text-[22px] text-brand-body ml-0.5">{suffix}</span>
              )}
            </p>
            <p className="text-sm font-semibold text-brand-dark mt-1">{label}</p>
            <p className="text-xs text-brand-body/70 mt-0.5">{subtext}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Statistics section config ──────────────────────────────────────────────────
interface StatConfig {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  subtext: string;
  key: keyof AdminStats;
  suffix?: string;
}

const statConfigs: StatConfig[] = [
  {
    icon: GraduationCap,
    iconColor: "text-[#2563EB]",
    iconBg: "bg-[#DBEAFE]",
    label: "Total Students",
    subtext: "Enrolled students at our institution",
    key: "totalStudents",
  },
  {
    icon: BookOpen,
    iconColor: "text-[#7C3AED]",
    iconBg: "bg-[#EDE9FB]",
    label: "Total Courses",
    subtext: "Institutional courses offered this term",
    key: "totalCourses",
  },
  {
    icon: Users,
    iconColor: "text-[#059669]",
    iconBg: "bg-[#D1FAE5]",
    label: "Total Teachers",
    subtext: "Faculty members at our institution",
    key: "totalTeachers",
  },
  {
    icon: Zap,
    iconColor: "text-[#D97706]",
    iconBg: "bg-[#FEF3C7]",
    label: "XP Distributed",
    subtext: "Points earned across all courses",
    key: "totalXPDistributed",
    suffix: " XP",
  },
];

// ── Main section ───────────────────────────────────────────────────────────────
export default function StatisticsSection() {
  const { data, loading, error, refetch } = useAdminStats();
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  // Trigger count-up when section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-brand-bg"
      aria-labelledby="stats-heading"
    >
      <div className="max-w-6xl mx-auto py-16 px-6 md:px-12">

        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-blue uppercase tracking-widest mb-3">
            By the Numbers
          </p>
          <h2
            id="stats-heading"
            className="text-[32px] font-bold text-brand-dark text-center leading-tight mb-3.5"
          >
            Powering our campus community
          </h2>
          <p className="text-[15px] text-brand-body text-center leading-relaxed max-w-[540px] mx-auto">
            Students and faculty across our institution use Questify to make
            academic progress measurable, rewarding, and transparent.
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div
            className="flex items-center justify-between bg-white border border-brand-border rounded-[10px] px-6 py-4 mb-8 text-sm text-brand-body"
            role="alert"
          >
            <span>Could not load live statistics — showing cached data.</span>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 text-brand-blue font-semibold hover:underline"
              aria-label="Retry loading statistics"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {/* Stat cards grid */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          role="list"
          aria-label="Platform statistics"
        >
          {statConfigs.map(({ key, suffix, ...config }, i) => (
            <li key={key}>
              <StatCard
                {...config}
                value={data?.[key] ?? 0}
                suffix={suffix}
                active={inView && !loading && !error}
                delay={i * 80}
                loading={loading}
              />
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
