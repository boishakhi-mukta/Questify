import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
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

// ── Data ───────────────────────────────────────────────────────────────────────

const stats = [
  { value: "2,400+", label: "Enrolled Students" },
  { value: "120+",   label: "Active Courses" },
  { value: "85+",    label: "Faculty Members" },
  { value: "12",     label: "Departments" },
];

const values = [
  {
    icon: GraduationCap,
    color: "bg-brand-blue/10 text-brand-blue",
    title: "Academic Excellence First",
    body:
      "Every feature exists to support academic goals. Gamification is a tool, not the goal — the goal is stronger student outcomes and a more engaged campus.",
  },
  {
    icon: Trophy,
    color: "bg-amber-400/15 text-amber-500",
    title: "Progress Should Be Visible",
    body:
      "When effort feels invisible, motivation drops. XP, levels, and leaderboards make academic progress concrete — turning daily study into a rewarding, trackable journey.",
  },
  {
    icon: Shield,
    color: "bg-emerald-500/15 text-emerald-500",
    title: "Institutional Trust & Privacy",
    body:
      "All accounts are managed by university administration. Student data stays within the institution — no third-party marketing, no external data sharing, ever.",
  },
  {
    icon: Users,
    color: "bg-violet-500/15 text-violet-500",
    title: "Faculty Empowerment",
    body:
      "Teachers get real tools: attendance tracking, material uploads, assignment management, and per-student analytics — all in one place, no spreadsheets needed.",
  },
  {
    icon: TrendingUp,
    color: "bg-rose-500/15 text-rose-500",
    title: "Data-Driven Decisions",
    body:
      "Admins and faculty get honest, real-time data. Enrollment trends, attendance patterns, XP distribution — the insights needed to act early and act well.",
  },
  {
    icon: Lightbulb,
    color: "bg-sky-500/15 text-sky-500",
    title: "Continuous Improvement",
    body:
      "The platform evolves with the university. Feedback from students, faculty, and admin shapes every update. No feature is fixed — everything can get better.",
  },
];

const roles = [
  {
    icon: GraduationCap,
    color: "bg-brand-blue/10 text-brand-blue",
    border: "border-brand-blue/20",
    title: "Students",
    desc: "Access enrolled courses, download materials, submit assignments, track XP progress, climb the leaderboard, and earn badges for academic achievements.",
    features: ["Course materials & assignments", "XP tracking & leaderboard", "Attendance records", "Achievement badges"],
  },
  {
    icon: ClipboardList,
    color: "bg-emerald-500/15 text-emerald-500",
    border: "border-emerald-500/20",
    title: "Faculty",
    desc: "Manage course materials, create and review assignments, record daily attendance, and monitor per-student performance with built-in analytics.",
    features: ["Attendance recording", "Material & assignment management", "Student performance analytics", "XP award automation"],
  },
  {
    icon: UserCog,
    color: "bg-violet-500/15 text-violet-500",
    border: "border-violet-500/20",
    title: "Administration",
    desc: "Provision all user accounts, manage courses and enrollments, generate institutional reports, and oversee the health of the entire platform.",
    features: ["User & course management", "Enrollment oversight", "Platform-wide analytics", "Report generation"],
  },
];

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
  return (
    <>
      <Navbar />

      <main id="main-content" tabIndex={-1} className="outline-none">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-brand-bg to-white dark:from-slate-950 dark:to-slate-900 pt-20 pb-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 mb-5 px-3.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
              <Zap size={12} />
              About Questify
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-dark dark:text-white mb-5 leading-tight">
              Your University&apos;s{" "}
              <span className="text-brand-blue">Gamified</span>{" "}
              Learning Platform
            </h1>
            <p className="text-brand-body dark:text-white/60 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Questify is the university&apos;s internal learning management system — purpose-built
              for students, faculty, and administration. It brings XP, badges, and leaderboards into
              academic life to make coursework more engaging without sacrificing rigour.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-[#004182] transition-colors no-underline"
              >
                Log In to Your Account
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-brand-border dark:border-white/15 text-brand-dark dark:text-white text-sm font-bold hover:border-brand-blue hover:text-brand-blue dark:hover:text-brand-blue transition-colors no-underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <section className="py-12 px-6 border-y border-brand-border dark:border-white/8 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl sm:text-4xl font-extrabold text-brand-blue mb-1">{value}</p>
                <p className="text-sm font-semibold text-brand-body dark:text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mission ──────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionHeading
                tag="Our Mission"
                title="Make Academic Progress Impossible to Ignore"
                center={false}
              />
              <div className="space-y-4 text-brand-body dark:text-white/60 text-[15px] leading-relaxed">
                <p>
                  Questify was built because traditional LMS platforms put administration
                  first. Students stared at static course pages with no sense of progress,
                  and faculty spent hours juggling attendance sheets, email threads, and
                  separate grade trackers.
                </p>
                <p>
                  We took a different approach: combine everything a university needs —
                  course management, materials, assignments, attendance — with the
                  engagement mechanics that actually work. XP for attendance, badges for
                  milestones, a live leaderboard that turns studying into a shared experience.
                </p>
                <p>
                  The result is a platform where students know exactly where they stand,
                  faculty have real data at a glance, and administration can manage the
                  entire institution from one dashboard.
                </p>
              </div>
            </div>

            {/* Visual accent */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target,      bg: "bg-brand-blue/10",  color: "text-brand-blue",  label: "Structured academic paths"  },
                { icon: Zap,         bg: "bg-amber-400/15",   color: "text-amber-500",   label: "XP for every achievement"   },
                { icon: BarChart3,   bg: "bg-emerald-500/15", color: "text-emerald-500", label: "Real-time faculty analytics" },
                { icon: BookMarked,  bg: "bg-violet-500/15",  color: "text-violet-500",  label: "Centralised course content"  },
              ].map(({ icon: Icon, bg, color, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-brand-border dark:border-white/10 p-6 bg-white dark:bg-slate-800/50 flex flex-col gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className="text-[13px] font-semibold text-brand-dark dark:text-white leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who Uses Questify ─────────────────────────────────────────────── */}
        <section className="bg-brand-bg dark:bg-slate-950 py-20 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              tag="Three Roles, One Platform"
              title="Built for Everyone on Campus"
              subtitle="Questify is designed around the real workflows of students, faculty, and university administration."
            />
            <div className="grid sm:grid-cols-3 gap-6">
              {roles.map(({ icon: Icon, color, border, title, desc, features }) => (
                <div
                  key={title}
                  className={`bg-white dark:bg-slate-800/60 border ${border} dark:border-white/10 rounded-2xl p-6`}
                >
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-[16px] font-bold text-brand-dark dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-brand-body dark:text-white/55 leading-relaxed mb-4">{desc}</p>
                  <ul className="space-y-1.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[13px] text-brand-body dark:text-white/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
                        {f}
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
            tag="What We Believe"
            title="The Principles Behind Questify"
            subtitle="Six ideas that guide every decision made in the design and operation of this platform."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, color, title, body }) => (
              <div
                key={title}
                className="bg-white dark:bg-slate-800/60 border border-brand-border dark:border-white/10 rounded-2xl p-6"
              >
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-[15px] font-bold text-brand-dark dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-brand-body dark:text-white/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Access Notice ─────────────────────────────────────────────────── */}
        <section className="bg-brand-dark py-16 px-6 text-center">
          <div className="max-w-xl mx-auto">
            <Shield size={32} className="text-brand-blue mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-3">
              University Access Only
            </h2>
            <p className="text-white/60 text-sm mb-7 leading-relaxed">
              Questify accounts are created exclusively by university administration.
              If you are an enrolled student or faculty member and do not yet have
              access, contact your department office or the IT helpdesk.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-[#004182] transition-colors no-underline"
              >
                Log In
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-bold hover:border-white/50 transition-colors no-underline"
              >
                Contact the Helpdesk
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
