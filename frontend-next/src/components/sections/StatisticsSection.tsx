"use client";

import { useRef, useState, useEffect } from "react";
import { Users, BookOpen, GraduationCap, Zap, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAdminStats } from "@/hooks/useAdminStats";
import type { AdminStats } from "@/hooks/useAdminStats";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// ── Count-up hook ──────────────────────────────────────────────────────────────
// Animates a number counting up from 0 to its final value over time, instead
// of just appearing instantly — used for the "12,450 students" style stats.
function useCountUp(target: number, duration = 1800, active = false): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || target === 0) return;
    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
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
// Shortens a big number into something more readable, e.g. 12500 → "12.5K".
function formatStat(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

// ── Blob stat card ─────────────────────────────────────────────────────────────
interface BlobStatCardProps {
  icon:       LucideIcon;
  iconColor:  string;
  blobColor:  string;
  blobRadius: string;
  label:      string;
  subtext:    string;
  value:      number;
  suffix?:    string;
  active:     boolean;
  loading:    boolean;
}

// One organic "blob"-shaped stat card (e.g. "12.5K Students") with a
// count-up animation once it scrolls into view.
function BlobStatCard({
  icon: Icon, iconColor, blobColor, blobRadius,
  label, subtext, value, suffix = "", active, loading,
}: BlobStatCardProps) {
  const count = useCountUp(value, 1800, active);

  return (
    <div className="flex items-center justify-center p-2">
      <div
        className="w-full flex flex-col items-center justify-center text-center px-5 py-9 border border-white/50 backdrop-blur-md transition-transform duration-300 hover:scale-[1.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
        style={{ background: blobColor, borderRadius: blobRadius }}
      >
        {/* Icon circle */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center mb-3 shadow-sm"
          style={{ background: "rgba(255,255,255,0.65)" }}
        >
          <Icon size={20} style={{ color: iconColor }} strokeWidth={2.2} />
        </div>

        {loading ? (
          <>
            <div className="h-8 w-16 rounded animate-pulse mb-2" style={{ background: "rgba(255,255,255,0.45)" }} />
            <div className="h-3 w-20 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.35)" }} />
          </>
        ) : (
          <>
            <p className="text-[33px] font-extrabold leading-none tracking-tight" style={{ color: "#1B4332" }}>
              {formatStat(count)}
              {suffix && <span className="text-[18px] ml-0.5" style={{ color: "#25B585" }}>{suffix}</span>}
            </p>
            <p className="text-[14px] font-bold mt-2" style={{ color: "#1B4332" }}>{label}</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#2D6A4F" }}>{subtext}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Stat configs ───────────────────────────────────────────────────────────────
interface StatConfig {
  icon:       LucideIcon;
  iconColor:  string;
  blobColor:  string;
  blobRadius: string;
  labelKey:   string;
  subtextKey: string;
  key:        keyof AdminStats;
  suffix?:    string;
}

const statConfigs: StatConfig[] = [
  {
    icon:       GraduationCap,
    iconColor:  "#1B4332",
    blobColor:  "#C8E8DC",
    blobRadius: "60% 40% 60% 40% / 40% 60% 40% 60%",
    labelKey:   "stats.totalStudents",
    subtextKey: "stats.totalStudentsSub",
    key:        "totalStudents",
  },
  {
    icon:       BookOpen,
    iconColor:  "#0F6E4A",
    blobColor:  "#B8DDD0",
    blobRadius: "40% 60% 40% 60% / 60% 40% 60% 40%",
    labelKey:   "stats.totalCourses",
    subtextKey: "stats.totalCoursesSub",
    key:        "totalCourses",
  },
  {
    icon:       Users,
    iconColor:  "#1B7A5A",
    blobColor:  "#D6EFE5",
    blobRadius: "55% 45% 35% 65% / 60% 45% 55% 40%",
    labelKey:   "stats.totalTeachers",
    subtextKey: "stats.totalTeachersSub",
    key:        "totalTeachers",
  },
  {
    icon:       Zap,
    iconColor:  "#25B585",
    blobColor:  "#A8D8C8",
    blobRadius: "45% 55% 65% 35% / 40% 60% 40% 60%",
    labelKey:   "stats.xpDistributed",
    subtextKey: "stats.xpDistributedSub",
    key:        "totalXPDistributed",
    suffix:     " XP",
  },
];

// ── Main section ───────────────────────────────────────────────────────────────
// The "By the Numbers" homepage section — a Lottie animation next to a
// 2×2 grid of live platform stats (students, courses, teachers, XP given out).
export default function StatisticsSection() {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useAdminStats();
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden"
      aria-labelledby="stats-heading"
      style={{ background: "linear-gradient(180deg, #d9eee0 0%, #eef8f4 50%, #d9eee0 100%)" }}
    >
      <div className="w-10/12 mx-auto py-20">

        {/* Error state */}
        {error && (
          <div
            className="flex items-center justify-between bg-white border border-brand-border rounded-xl px-6 py-4 mb-8 text-sm text-brand-body"
            role="alert"
          >
            <span>{t("stats.errorMsg")}</span>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 text-brand-blue font-semibold hover:underline"
              aria-label={t("stats.retryLabel")}
            >
              <RefreshCw size={14} aria-hidden="true" />
              {t("stats.retry")}
            </button>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: heading + Lottie animation */}
          <ScrollReveal direction="right">
            <div className="flex flex-col">
              <p className="text-[15px] font-semibold text-brand-blue uppercase tracking-widest mb-3">
                {t("stats.eyebrow")}
              </p>
              <h2 id="stats-heading" className="text-[32px] font-bold text-brand-dark leading-tight mb-4">
                {t("stats.heading")}
              </h2>
              <p className="text-[16px] text-brand-body leading-relaxed mb-6 max-w-md">
                {t("stats.body")}
              </p>
              <div className="w-full max-w-sm mx-auto lg:mx-0">
                <DotLottieReact src="/Online Learning Platform.lottie" loop autoplay />
              </div>
            </div>
          </ScrollReveal>

          {/* Right: 2×2 blob stat cards */}
          <ScrollReveal direction="left">
            <StaggerContainer
              className="grid grid-cols-2 gap-1"
              staggerChildren={0.12}
              delayChildren={0.1}
            >
              {statConfigs.map(({ key, suffix, labelKey, subtextKey, ...config }) => (
                <StaggerItem key={key}>
                  <BlobStatCard
                    {...config}
                    label={t(labelKey)}
                    subtext={t(subtextKey)}
                    value={data?.[key] ?? 0}
                    suffix={suffix}
                    active={inView && !loading && !error}
                    loading={loading}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
