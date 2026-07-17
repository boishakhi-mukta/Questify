"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "react-i18next";
import { useAdminStats } from "@/hooks/useAdminStats";
import type { AdminStats } from "@/hooks/useAdminStats";
import type { LucideIcon } from "lucide-react";
import {
  Target,
  Users,
  Zap,
  Shield,
  BookMarked,
  GraduationCap,
  ClipboardList,
  UserCog,
} from "lucide-react";

// ── Count-up hook ──────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600, active = false): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    let startTime: number | null = null;
    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, duration, active]);
  return value;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function AnimatedStat({ value, suffix, active }: { value: number; suffix: string; active: boolean }) {
  const count = useCountUp(value, 1600, active);
  return <>{formatCount(count)}{suffix}</>;
}

// ── Decorative helpers ─────────────────────────────────────────────────────────
function DotGrid({ cols = 6, rows = 4 }: { cols?: number; rows?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#1B4332", opacity: 0.22 }} />
      ))}
    </div>
  );
}

function Sparkle({ size = 20, color = "#25B585" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" />
    </svg>
  );
}

// ── Section heading ────────────────────────────────────────────────────────────
function SectionHeading({ tag, title, subtitle, center = true }: {
  tag: string; title: string; subtitle?: string; center?: boolean;
}) {
  return (
    <div className={center ? "text-center max-w-2xl mx-auto mb-12" : "mb-8"}>
      <span className="inline-block mb-3 px-3.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
        {tag}
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white mb-3 leading-tight">
        {title}
      </h2>
      {subtitle && <p className="text-brand-body dark:text-white/60 text-base leading-relaxed">{subtitle}</p>}
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
interface StatDef {
  dbKey:     keyof AdminStats | null;
  staticVal: number | null;
  suffix:    string;
  labelKey:  string;
  icon:      LucideIcon;
  iconColor: string;
  iconBg:    string;
}

const STAT_DEFS: StatDef[] = [
  { dbKey: "totalStudents", staticVal: null, suffix: "+", labelKey: "about.statsStudents",    icon: GraduationCap, iconColor: "#1B4332", iconBg: "#E0F5ED" },
  { dbKey: "totalCourses",  staticVal: null, suffix: "+", labelKey: "about.statsCourses",     icon: BookMarked,    iconColor: "#0F6E4A", iconBg: "#D6EFE5" },
  { dbKey: "totalTeachers", staticVal: null, suffix: "+", labelKey: "about.statsFaculty",     icon: Users,         iconColor: "#1B7A5A", iconBg: "#C8E8DC" },
  { dbKey: null,            staticVal: 6,    suffix: "",  labelKey: "about.statsDepartments", icon: Target,        iconColor: "#25B585", iconBg: "#B8DDD0" },
];


const roles = [
  {
    icon: GraduationCap, color: "bg-brand-blue/10 text-brand-blue", border: "border-brand-blue/20",
    titleKey: "about.studentRole", descKey: "about.studentRoleDesc",
    featureKeys: ["about.studentFeature1", "about.studentFeature2", "about.studentFeature3", "about.studentFeature4"],
  },
  {
    icon: ClipboardList, color: "bg-emerald-500/15 text-emerald-500", border: "border-emerald-500/20",
    titleKey: "about.facultyRole", descKey: "about.facultyRoleDesc",
    featureKeys: ["about.facultyFeature1", "about.facultyFeature2", "about.facultyFeature3", "about.facultyFeature4"],
  },
  {
    icon: UserCog, color: "bg-violet-500/15 text-violet-500", border: "border-violet-500/20",
    titleKey: "about.adminRole", descKey: "about.adminRoleDesc",
    featureKeys: ["about.adminFeature1", "about.adminFeature2", "about.adminFeature3", "about.adminFeature4"],
  },
];


// ── Page ───────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const { t } = useTranslation();
  const { data: statsData, loading: statsLoading } = useAdminStats();
  const statsRef = useRef<HTMLElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsInView(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      {/* ── Hero — gradient applied directly so it sits behind the navbar ── */}
      <section
        className="relative overflow-hidden px-6"
        style={{
          background: "linear-gradient(180deg, #c4dcd0 0%, #d4ede3 28%, #eef8f4 65%, #F2FAF7 100%)",
          marginTop: "-60px",
          paddingTop: "60px",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-10 left-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,181,133,0.22), transparent)", filter: "blur(28px)" }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(27,67,50,0.1), transparent)", filter: "blur(40px)" }} />

        <div className="relative max-w-6xl mx-auto py-16 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — text */}
          <div>
            <span className="inline-flex items-center gap-2 mb-5 px-3.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
              <Zap size={12} />
              {t("about.badge")}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-dark mb-5 leading-tight">
              {t("about.heroTitle")}
            </h1>
            <p className="text-brand-body text-lg leading-relaxed mb-8 max-w-lg">
              {t("about.heroBody")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition-colors no-underline">
                {t("about.logIn")}
              </Link>
              <Link href="/contact" className="inline-flex items-center px-6 py-3 rounded-xl border border-brand-border text-brand-dark text-sm font-bold hover:border-brand-blue hover:text-brand-blue transition-colors no-underline">
                {t("about.contactSupport")}
              </Link>
            </div>
          </div>

          {/* Right — campus photo with decorative frame */}
          <div className="relative flex items-center justify-center">
            {/* Green corner backing */}
            <div className="absolute -bottom-4 -left-4 w-3/4 h-4/5 rounded-2xl z-0" style={{ background: "#1B4332" }} />
            {/* Sparkle stars */}
            <div className="absolute -top-4 right-4 z-20"><Sparkle size={28} color="#25B585" /></div>
            <div className="absolute top-6 -right-2 z-20"><Sparkle size={16} color="#D97706" /></div>
            <div className="absolute bottom-2 right-8 z-20"><Sparkle size={20} color="#1B4332" /></div>
            {/* Dashed ring accent */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full z-0" style={{ border: "2px dashed rgba(37,181,133,0.5)" }} />
            {/* Photo */}
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl w-full">
              <Image
                src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80"
                alt="University campus"
                width={900}
                height={600}
                className="w-full h-72 sm:h-80 lg:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" tabIndex={-1} className="outline-none">

        {/* ── Stats (real-time from DB) ─────────────────────────────────────── */}
        <section
          ref={statsRef}
          className="py-14 px-6 border-y border-brand-border/60"
          style={{ background: "linear-gradient(180deg, #eef8f4 0%, #ffffff 55%, #eef8f4 100%)" }}
        >
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STAT_DEFS.map(({ dbKey, staticVal, suffix, labelKey, icon: Icon, iconColor, iconBg }) => {
              const rawValue = dbKey !== null ? (statsData?.[dbKey] ?? 0) : (staticVal ?? 0);
              const isLoading = statsLoading && dbKey !== null;
              return (
                <div key={labelKey} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1" style={{ background: iconBg }}>
                    <Icon size={22} style={{ color: iconColor }} strokeWidth={1.8} />
                  </div>
                  {isLoading ? (
                    <div className="h-10 w-20 bg-brand-border/40 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl sm:text-4xl font-extrabold text-brand-blue leading-none">
                      <AnimatedStat value={rawValue} suffix={suffix} active={statsInView && !statsLoading} />
                    </p>
                  )}
                  <p className="text-sm font-semibold text-brand-body">{t(labelKey)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── What Will You Experience ──────────────────────────────────────── */}
        <section className="relative py-16 px-4 md:px-6 bg-white overflow-hidden">
          {/* Wavy amber line — left edge */}
          <svg className="absolute left-6 top-1/3 pointer-events-none" width="48" height="220" viewBox="0 0 48 220" fill="none" aria-hidden="true" style={{ opacity: 0.22 }}>
            <path d="M24 0 Q0 55 24 110 Q48 165 24 220" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          {/* Sparkles — upper right */}
          <div className="absolute top-10 right-14 pointer-events-none z-0"><Sparkle size={40} color="rgba(37,181,133,0.25)" /></div>
          <div className="absolute top-20 right-24 pointer-events-none z-0"><Sparkle size={22} color="rgba(217,119,6,0.3)" /></div>
          {/* Dot grid — bottom right */}
          <div className="absolute bottom-8 right-8 pointer-events-none" style={{ opacity: 0.06 }}>
            <DotGrid cols={5} rows={4} />
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Heading */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-block mb-3 px-3.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
                {t("about.missionTag")}
              </span>
              <h2 className="text-3xl sm:text-[36px] font-extrabold text-brand-dark mb-4 leading-tight">
                {t("about.missionCenteredPre")}{" "}
                <span style={{ color: "#D97706" }}>{t("about.missionCenteredHighlight")}</span>
              </h2>
              <p className="text-brand-body text-base leading-relaxed">{t("about.missionSubtitle")}</p>
            </div>

            {/* Two-column: animated card left, feature list right */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-10">

              {/* Left — animated course dashboard card */}
              <div className="relative flex items-center justify-center min-h-75">
                <style>{`
                  @keyframes qf-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                  @keyframes qf-ping  { 0%,80%,100%{transform:scale(1)} 40%{transform:scale(1.12)} }
                  @keyframes qf-dot   { 0%,100%{opacity:1} 50%{opacity:0.35} }
                `}</style>
                <div className="absolute w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,181,133,0.13), transparent)", filter: "blur(30px)" }} />
                <div className="relative z-10 w-full max-w-sm" style={{ animation: "qf-float 4s ease-in-out infinite" }}>
                  {/* Main card */}
                  <div className="bg-white rounded-2xl shadow-xl border border-brand-border/60 overflow-hidden">
                    <div className="px-5 py-4 border-b border-brand-border/40" style={{ background: "#f0faf5" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-blue" style={{ animation: "qf-dot 2s ease-in-out infinite" }} />
                          <span className="text-[13px] font-bold text-brand-dark">My Enrolled Courses</span>
                        </div>
                        <span className="text-[11px] font-bold text-white bg-brand-blue rounded-full w-5 h-5 flex items-center justify-center">3</span>
                      </div>
                    </div>
                    <div className="px-5 py-3 space-y-3">
                      {([
                        { name: "Data Structures", dept: "Computer Science", pct: 78, color: "#25B585" },
                        { name: "Linear Algebra",  dept: "Mathematics",      pct: 54, color: "#3B82F6" },
                        { name: "Web Engineering", dept: "Software Eng.",    pct: 91, color: "#D97706" },
                      ] as { name: string; dept: string; pct: number; color: string }[]).map(({ name, dept, pct, color }) => (
                        <div key={name} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white text-[10px] font-extrabold" style={{ background: color }}>{name[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-brand-dark leading-none mb-0.5 truncate">{name}</p>
                            <p className="text-[10px] text-brand-body truncate">{dept}</p>
                          </div>
                          <span className="text-[11px] font-extrabold shrink-0" style={{ color }}>{pct}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 border-t border-brand-border/40" style={{ background: "#f8fcfa" }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-brand-body">Semester 4 · 3 active</span>
                        <span className="text-[11px] font-bold text-brand-blue">View all →</span>
                      </div>
                    </div>
                  </div>
                  {/* Floating notification: assignment due */}
                  <div className="absolute -top-3 -right-3 bg-white border border-brand-border/60 rounded-xl shadow-lg px-3 py-2" style={{ animation: "qf-ping 4s ease-in-out infinite" }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-[11px] font-bold text-brand-dark">Assignment due</span>
                    </div>
                    <p className="text-[10px] text-brand-body mt-0.5">Web Engineering · 2h</p>
                  </div>
                  {/* Floating notification: grade posted */}
                  <div className="absolute -bottom-3 -left-3 bg-white border border-brand-border/60 rounded-xl shadow-lg px-3 py-2" style={{ animation: "qf-ping 4s ease-in-out infinite", animationDelay: "2s" }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-bold text-brand-dark">Grade posted</span>
                    </div>
                    <p className="text-[10px] text-brand-body mt-0.5">Linear Algebra · A−</p>
                  </div>
                </div>
                <div className="absolute top-6 right-14 z-0"><Sparkle size={16} color="#D97706" /></div>
                <div className="absolute bottom-10 left-10 z-0"><Sparkle size={12} color="#25B585" /></div>
              </div>

              {/* Right — 3 academic feature items */}
              <div className="space-y-4">
                <div className="flex gap-4 items-start p-5 rounded-2xl border border-brand-border/50 bg-brand-bg hover:shadow-md transition-shadow duration-200">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                    <BookMarked size={22} className="text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-brand-dark mb-1.5">{t("about.experienceFeature1Title")}</h3>
                    <p className="text-[13px] text-brand-body leading-relaxed">{t("about.experienceFeature1Body")}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start p-5 rounded-2xl border border-brand-border/50 bg-brand-bg hover:shadow-md transition-shadow duration-200">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <ClipboardList size={22} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-brand-dark mb-1.5">{t("about.experienceFeature2Title")}</h3>
                    <p className="text-[13px] text-brand-body leading-relaxed">{t("about.experienceFeature2Body")}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start p-5 rounded-2xl border border-brand-border/50 bg-brand-bg hover:shadow-md transition-shadow duration-200">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                    <Users size={22} className="text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-brand-dark mb-1.5">{t("about.experienceFeature3Title")}</h3>
                    <p className="text-[13px] text-brand-body leading-relaxed">{t("about.experienceFeature3Body")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 academic preview cards */}
            <div className="grid sm:grid-cols-3 gap-4">

              {/* Assignments card */}
              <div className="bg-brand-bg rounded-2xl border border-brand-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                    <ClipboardList size={14} className="text-brand-blue" />
                  </div>
                  <span className="text-[13px] font-bold text-brand-dark">My Assignments</span>
                </div>
                <div className="space-y-3">
                  {([
                    { name: "Lab Report #3",    course: "Data Structures", status: "Submitted", sc: "#25B585", sb: "#E0F5ED" },
                    { name: "Problem Set 5",    course: "Linear Algebra",  status: "Pending",   sc: "#D97706", sb: "#FEF3C7" },
                    { name: "UI/UX Case Study", course: "Web Engineering", status: "Graded",    sc: "#3B82F6", sb: "#DBEAFE" },
                  ] as { name: string; course: string; status: string; sc: string; sb: string }[]).map(({ name, course, status, sc, sb }) => (
                    <div key={name} className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-brand-dark truncate">{name}</p>
                        <p className="text-[10px] text-brand-body truncate">{course}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ color: sc, background: sb }}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials card */}
              <div className="bg-brand-bg rounded-2xl border border-brand-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/15 flex items-center justify-center">
                    <BookMarked size={14} className="text-amber-500" />
                  </div>
                  <span className="text-[13px] font-bold text-brand-dark">Course Materials</span>
                </div>
                <div className="space-y-2.5">
                  {([
                    { file: "Week 7 Lecture Notes.pdf", course: "Data Structures", size: "2.4 MB" },
                    { file: "Midterm Formula Sheet.pdf", course: "Linear Algebra",  size: "0.8 MB" },
                    { file: "Project Brief v2.pdf",      course: "Web Engineering", size: "1.1 MB" },
                  ] as { file: string; course: string; size: string }[]).map(({ file, course, size }) => (
                    <div key={file} className="flex items-center gap-2.5">
                      <div className="w-7 h-8 rounded-md bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-extrabold text-red-400 leading-none">PDF</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-brand-dark leading-tight truncate">{file}</p>
                        <p className="text-[10px] text-brand-body">{course} · {size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance card */}
              <div className="bg-brand-bg rounded-2xl border border-brand-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <GraduationCap size={14} className="text-emerald-500" />
                  </div>
                  <span className="text-[13px] font-bold text-brand-dark">Attendance</span>
                </div>
                <div className="mb-3">
                  <span className="text-3xl font-extrabold text-brand-blue leading-none">92</span>
                  <span className="text-[13px] font-bold text-brand-body ml-0.5">%</span>
                  <p className="text-[11px] text-brand-body mt-0.5">Overall attendance rate</p>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[1,1,1,1,1,0,1, 1,1,1,0,1,1,1, 1,1,1,1,1,1,1, 1,1,1,1,1,2,2].map((s, i) => (
                    <div key={i} className="aspect-square rounded-sm" style={{ background: s === 1 ? "#25B585" : s === 0 ? "#FCA5A5" : "#E2E8F0" }} />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#25B585" }} /><span className="text-[10px] text-brand-body">Present</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#FCA5A5" }} /><span className="text-[10px] text-brand-body">Absent</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who Uses Questify ─────────────────────────────────────────────── */}
        <section className="relative bg-brand-bg py-16 px-4 md:px-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,181,133,0.07), transparent)", filter: "blur(44px)" }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(27,67,50,0.07), transparent)", filter: "blur(50px)" }} />
          <div className="absolute top-6 right-6 pointer-events-none"><DotGrid cols={5} rows={4} /></div>

          <div className="relative max-w-6xl mx-auto">
            <SectionHeading tag={t("about.rolesTag")} title={t("about.rolesTitle")} subtitle={t("about.rolesSubtitle")} />

            {/* Connected-roles strip */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-10">
              {([
                { icon: GraduationCap, label: "Student",       bg: "#E0F5ED", color: "#1B4332" },
                { icon: ClipboardList, label: "Faculty",        bg: "#D1FAE5", color: "#059669" },
                { icon: UserCog,       label: "Administration", bg: "#EDE9FE", color: "#7C3AED" },
              ] as { icon: LucideIcon; label: string; bg: string; color: string }[]).map(({ icon: Icon, label, bg, color }, i) => (
                <div key={label} className="flex items-center gap-3 sm:gap-6">
                  {i > 0 && <div className="hidden sm:block h-px w-10" style={{ background: "linear-gradient(90deg, #C8E8DC, #1B4332, #C8E8DC)" }} />}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm" style={{ background: bg }}>
                      <Icon size={24} style={{ color }} strokeWidth={1.8} />
                    </div>
                    <span className="text-xs font-semibold text-brand-body">{label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {roles.map(({ icon: Icon, color, border, titleKey, descKey, featureKeys }) => (
                <div key={titleKey} className={`bg-white border ${border} rounded-2xl p-6`}>
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-[16px] font-bold text-brand-dark mb-2">{t(titleKey)}</h3>
                  <p className="text-sm text-brand-body leading-relaxed mb-4">{t(descKey)}</p>
                  <ul className="space-y-1.5">
                    {featureKeys.map((fk) => (
                      <li key={fk} className="flex items-center gap-2 text-[13px] text-brand-body">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
                        {t(fk)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Our Mission Behind Questify ───────────────────────────────────── */}
        <section className="relative py-16 px-4 md:px-6 bg-white overflow-hidden">
          {/* Wavy line — left edge */}
          <svg className="absolute left-6 top-1/4 pointer-events-none" width="50" height="200" viewBox="0 0 50 200" fill="none" aria-hidden="true" style={{ opacity: 0.28 }}>
            <path d="M25 0 Q0 50 25 100 Q50 150 25 200" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          {/* Sparkle stars — right */}
          <div className="absolute top-10 right-16 pointer-events-none z-0"><Sparkle size={40} color="#25B585" /></div>
          <div className="absolute top-20 right-24 pointer-events-none z-0"><Sparkle size={22} color="#D97706" /></div>

          <div className="relative max-w-6xl mx-auto">
            {/* Heading with highlighted word */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-block mb-3 px-3.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
                {t("about.valuesTag")}
              </span>
              <h2 className="text-3xl sm:text-[36px] font-extrabold text-brand-dark mb-4 leading-tight">
                {t("about.valuesTitlePre")}{" "}
                <span style={{ color: "#D97706" }}>{t("about.valuesTitleHighlight")}</span>{" "}
                {t("about.valuesTitlePost")}
              </h2>
              <p className="text-brand-body text-base leading-relaxed">{t("about.valuesSubtitle")}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left — photo with decorative overlays */}
              <div className="relative flex items-center justify-center">
                {/* Green backing rectangle */}
                <div className="absolute -bottom-6 -left-6 w-4/5 h-4/5 rounded-2xl z-0" style={{ background: "#1B4332" }} />
                {/* Blue organic blob — upper left */}
                <div className="absolute -top-5 -left-4 w-16 h-16 z-20" style={{ background: "#3B82F6", borderRadius: "50% 30% 60% 40% / 40% 60% 30% 70%", opacity: 0.9 }} />
                {/* Photo */}
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl w-full" style={{ height: "300px" }}>
                  <Image
                    src="/about-students.jpg"
                    alt="Students on campus"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Right — heading, body, CTA */}
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl sm:text-[28px] font-extrabold text-brand-dark mb-5 leading-tight">
                  {t("about.valuesPanelHeading")}
                </h3>
                <p className="text-brand-body text-[15px] leading-relaxed mb-8">
                  {t("about.valuesParagraph")}
                </p>
                <Link
                  href="/courses"
                  className="self-start inline-flex items-center px-8 py-3 rounded-full border-2 border-brand-dark text-brand-dark text-sm font-bold hover:bg-brand-dark hover:text-white transition-all duration-200 no-underline"
                >
                  {t("about.viewAllCourses")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Access Notice ─────────────────────────────────────────────────── */}
        <section className="relative bg-brand-dark py-16 px-6 text-center overflow-hidden">
          <div className="absolute top-5 left-6 w-24 h-24 rounded-full pointer-events-none" style={{ border: "1.5px dashed rgba(37,181,133,0.3)" }} />
          <div className="absolute bottom-5 right-6 w-16 h-16 rounded-full pointer-events-none" style={{ border: "1.5px dashed rgba(37,181,133,0.2)" }} />
          <div className="absolute top-4 right-16 w-3 h-3 rounded-full pointer-events-none" style={{ background: "#25B585", opacity: 0.35 }} />
          <div className="absolute bottom-4 left-16 w-2 h-2 rounded-full pointer-events-none" style={{ background: "#25B585", opacity: 0.25 }} />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.08 }}>
            <DotGrid cols={3} rows={6} />
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.08 }}>
            <DotGrid cols={3} rows={6} />
          </div>

          <div className="relative max-w-xl mx-auto">
            <Shield size={32} className="text-brand-blue mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-3">{t("about.accessTitle")}</h2>
            <p className="text-white/60 text-sm mb-7 leading-relaxed">{t("about.accessBody")}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition-colors no-underline">
                {t("about.logInBtn")}
              </Link>
              <Link href="/contact" className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-bold hover:border-white/50 transition-colors no-underline">
                {t("about.contactHelpdesk")}
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
