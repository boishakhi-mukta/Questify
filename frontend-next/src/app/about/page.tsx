"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: About Page
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Informational page detailing company credentials and goals.
 * 
 * WHY IT EXISTS:
 * Promotes public interest.
 * 
 * HOW IT WORKS (Technical Overview):
 * Static layout styled with Tailwind.
 * ============================================================================
 */

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "react-i18next";
import {
  Target,
  Lightbulb,
  Users,
  TrendingUp,
  Trophy,
  Zap,
  Shield,
  BookMarked,
  GraduationCap,
  BarChart3,
  ClipboardList,
  UserCog,
} from "lucide-react";

// ── Section heading ────────────────────────────────────────────────────────────

function SectionHeading({
  tag,
  title,
  subtitle,
  center = true,
}: {
  tag: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center max-w-2xl mx-auto mb-12" : "mb-10"}>
      <span className="inline-block mb-3 px-3.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
        {tag}
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white mb-3 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-brand-body dark:text-white/60 text-base leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const { t } = useTranslation();

  const stats = [
    { value: "2,400+", labelKey: "about.statsStudents" },
    { value: "120+",   labelKey: "about.statsCourses" },
    { value: "85+",    labelKey: "about.statsFaculty" },
    { value: "12",     labelKey: "about.statsDepartments" },
  ];

  const values = [
    { icon: GraduationCap, color: "bg-brand-blue/10 text-brand-blue",   titleKey: "about.value1Title", bodyKey: "about.value1Body" },
    { icon: Trophy,        color: "bg-amber-400/15 text-amber-500",      titleKey: "about.value2Title", bodyKey: "about.value2Body" },
    { icon: Shield,        color: "bg-emerald-500/15 text-emerald-500",  titleKey: "about.value3Title", bodyKey: "about.value3Body" },
    { icon: Users,         color: "bg-violet-500/15 text-violet-500",    titleKey: "about.value4Title", bodyKey: "about.value4Body" },
    { icon: TrendingUp,    color: "bg-rose-500/15 text-rose-500",        titleKey: "about.value5Title", bodyKey: "about.value5Body" },
    { icon: Lightbulb,     color: "bg-sky-500/15 text-sky-500",          titleKey: "about.value6Title", bodyKey: "about.value6Body" },
  ];

  const roles = [
    {
      icon: GraduationCap,
      color: "bg-brand-blue/10 text-brand-blue",
      border: "border-brand-blue/20",
      titleKey: "about.studentRole",
      descKey: "about.studentRoleDesc",
      featureKeys: ["about.studentFeature1", "about.studentFeature2", "about.studentFeature3", "about.studentFeature4"],
    },
    {
      icon: ClipboardList,
      color: "bg-emerald-500/15 text-emerald-500",
      border: "border-emerald-500/20",
      titleKey: "about.facultyRole",
      descKey: "about.facultyRoleDesc",
      featureKeys: ["about.facultyFeature1", "about.facultyFeature2", "about.facultyFeature3", "about.facultyFeature4"],
    },
    {
      icon: UserCog,
      color: "bg-violet-500/15 text-violet-500",
      border: "border-violet-500/20",
      titleKey: "about.adminRole",
      descKey: "about.adminRoleDesc",
      featureKeys: ["about.adminFeature1", "about.adminFeature2", "about.adminFeature3", "about.adminFeature4"],
    },
  ];

  const missionCards = [
    { icon: Target,     bg: "bg-brand-blue/10",  color: "text-brand-blue",  labelKey: "about.missionCard1" },
    { icon: Zap,        bg: "bg-amber-400/15",   color: "text-amber-500",   labelKey: "about.missionCard2" },
    { icon: BarChart3,  bg: "bg-emerald-500/15", color: "text-emerald-500", labelKey: "about.missionCard3" },
    { icon: BookMarked, bg: "bg-violet-500/15",  color: "text-violet-500",  labelKey: "about.missionCard4" },
  ];

  return (
    <>
      <Navbar />

      <main id="main-content" tabIndex={-1} className="outline-none">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-brand-bg to-white dark:from-slate-950 dark:to-slate-900 pt-20 pb-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 mb-5 px-3.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
              <Zap size={12} />
              {t("about.badge")}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-dark dark:text-white mb-5 leading-tight">
              {t("about.heroTitle")}
            </h1>
            <p className="text-brand-body dark:text-white/60 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              {t("about.heroBody")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition-colors no-underline"
              >
                {t("about.logIn")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-brand-border dark:border-white/15 text-brand-dark dark:text-white text-sm font-bold hover:border-brand-blue hover:text-brand-blue dark:hover:text-brand-blue transition-colors no-underline"
              >
                {t("about.contactSupport")}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <section className="py-12 px-6 border-y border-brand-border dark:border-white/8 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, labelKey }) => (
              <div key={labelKey}>
                <p className="text-3xl sm:text-4xl font-extrabold text-brand-blue mb-1">{value}</p>
                <p className="text-sm font-semibold text-brand-body dark:text-white/50">{t(labelKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mission ──────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionHeading
                tag={t("about.missionTag")}
                title={t("about.missionTitle")}
                center={false}
              />
              <div className="space-y-4 text-brand-body dark:text-white/60 text-[15px] leading-relaxed">
                <p>{t("about.missionP1")}</p>
                <p>{t("about.missionP2")}</p>
                <p>{t("about.missionP3")}</p>
              </div>
            </div>

            {/* Visual accent */}
            <div className="grid grid-cols-2 gap-4">
              {missionCards.map(({ icon: Icon, bg, color, labelKey }) => (
                <div
                  key={labelKey}
                  className="rounded-2xl border border-brand-border dark:border-white/10 p-6 bg-white dark:bg-slate-800/50 flex flex-col gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className="text-[13px] font-semibold text-brand-dark dark:text-white leading-snug">{t(labelKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who Uses Questify ─────────────────────────────────────────────── */}
        <section className="bg-brand-bg dark:bg-slate-950 py-20 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              tag={t("about.rolesTag")}
              title={t("about.rolesTitle")}
              subtitle={t("about.rolesSubtitle")}
            />
            <div className="grid sm:grid-cols-3 gap-6">
              {roles.map(({ icon: Icon, color, border, titleKey, descKey, featureKeys }) => (
                <div
                  key={titleKey}
                  className={`bg-white dark:bg-slate-800/60 border ${border} dark:border-white/10 rounded-2xl p-6`}
                >
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-[16px] font-bold text-brand-dark dark:text-white mb-2">{t(titleKey)}</h3>
                  <p className="text-sm text-brand-body dark:text-white/55 leading-relaxed mb-4">{t(descKey)}</p>
                  <ul className="space-y-1.5">
                    {featureKeys.map((fk) => (
                      <li key={fk} className="flex items-center gap-2 text-[13px] text-brand-body dark:text-white/60">
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

        {/* ── Values ───────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 py-20">
          <SectionHeading
            tag={t("about.valuesTag")}
            title={t("about.valuesTitle")}
            subtitle={t("about.valuesSubtitle")}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, color, titleKey, bodyKey }) => (
              <div
                key={titleKey}
                className="bg-white dark:bg-slate-800/60 border border-brand-border dark:border-white/10 rounded-2xl p-6"
              >
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-[15px] font-bold text-brand-dark dark:text-white mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-brand-body dark:text-white/55 leading-relaxed">{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Access Notice ─────────────────────────────────────────────────── */}
        <section className="bg-brand-dark py-16 px-6 text-center">
          <div className="max-w-xl mx-auto">
            <Shield size={32} className="text-brand-blue mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-3">
              {t("about.accessTitle")}
            </h2>
            <p className="text-white/60 text-sm mb-7 leading-relaxed">
              {t("about.accessBody")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition-colors no-underline"
              >
                {t("about.logInBtn")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-bold hover:border-white/50 transition-colors no-underline"
              >
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
