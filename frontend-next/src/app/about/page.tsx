import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { Target, Lightbulb, Users, TrendingUp, Trophy, Zap, Heart, Globe } from "lucide-react";

// ── Data ───────────────────────────────────────────────────────────────────────

const stats = [
  { value: "10,000+", label: "Active Learners" },
  { value: "500+",    label: "Courses Available" },
  { value: "98%",     label: "Satisfaction Rate" },
  { value: "40+",     label: "Expert Instructors" },
];

const values = [
  {
    icon: Lightbulb,
    color: "bg-amber-400/15 text-amber-500",
    title: "Learning First",
    body:
      "Every feature we build starts with a single question: does this help someone learn better? We believe education is the highest-leverage investment a person can make.",
  },
  {
    icon: Trophy,
    color: "bg-brand-blue/10 text-brand-blue",
    title: "Progress Should Be Visible",
    body:
      "Motivation fades when effort feels invisible. XP, streaks, and leaderboards make progress concrete — turning abstract studying into a rewarding, trackable journey.",
  },
  {
    icon: Users,
    color: "bg-emerald-500/15 text-emerald-500",
    title: "Community Over Competition",
    body:
      "Leaderboards spark ambition, but community sustains it. We design for learners who lift each other up, not just those racing to the top.",
  },
  {
    icon: Heart,
    color: "bg-rose-500/15 text-rose-500",
    title: "Learner Autonomy",
    body:
      "People learn differently. We give students the tools, then get out of the way — flexible pacing, diverse formats, and no single right path to mastery.",
  },
  {
    icon: TrendingUp,
    color: "bg-violet-500/15 text-violet-500",
    title: "Data-Driven Growth",
    body:
      "Instructors get real-time analytics. Students see exactly where they stand. Decisions backed by data lead to faster improvement for everyone.",
  },
  {
    icon: Globe,
    color: "bg-sky-500/15 text-sky-500",
    title: "Access for All",
    body:
      "Quality education shouldn't depend on where you live or how much you earn. We keep our free tier generous and our pricing transparent.",
  },
];

const team = [
  {
    name: "Aria Chen",
    role: "Co-founder & CEO",
    bio: "Former Stanford CS lecturer. Built two edtech startups before Questify. Believes every learner deserves a coach.",
    initials: "AC",
    color: "bg-brand-blue",
  },
  {
    name: "Marcus Webb",
    role: "Co-founder & CTO",
    bio: "Ex-Google engineer. Obsessed with systems that scale. Designed the XP engine and real-time analytics pipeline.",
    initials: "MW",
    color: "bg-violet-500",
  },
  {
    name: "Priya Nair",
    role: "Head of Product",
    bio: "Product leader from Duolingo and Coursera. Champions the learner's perspective in every feature decision.",
    initials: "PN",
    color: "bg-emerald-500",
  },
  {
    name: "Jordan Blake",
    role: "Head of Curriculum",
    bio: "Former high-school teacher and instructional designer. Makes sure every course on Questify actually teaches.",
    initials: "JB",
    color: "bg-amber-500",
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
              Learning That Feels Like{" "}
              <span className="text-brand-blue">Playing</span>
            </h1>
            <p className="text-brand-body dark:text-white/60 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Questify is a gamified learning management system built for the
              next generation of students. We combine rigorous course content
              with XP, streaks, and leaderboards to make studying something
              people actually want to do.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-[#004182] transition-colors no-underline"
              >
                Browse Courses
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-brand-border dark:border-white/15 text-brand-dark dark:text-white text-sm font-bold hover:border-brand-blue hover:text-brand-blue dark:hover:text-brand-blue transition-colors no-underline"
              >
                Get in Touch
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
                title="Make Progress Impossible to Ignore"
                center={false}
              />
              <div className="space-y-4 text-brand-body dark:text-white/60 text-[15px] leading-relaxed">
                <p>
                  We started Questify because we noticed a gap: digital learning
                  platforms were either too rigid for students or too shallow for
                  serious educators. The result was courses that no one finished
                  and dashboards that told you nothing useful.
                </p>
                <p>
                  Our answer was to borrow the best ideas from games — XP bars,
                  leaderboards, daily streaks — and pair them with genuinely
                  powerful tools for teachers: assignment management, attendance
                  tracking, and real-time analytics at the class and individual
                  level.
                </p>
                <p>
                  The result is a platform where students stay engaged because
                  progress feels real, and instructors stay informed because the
                  data is always one click away.
                </p>
              </div>
            </div>

            {/* Visual accent */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target,    bg: "bg-brand-blue/10",    color: "text-brand-blue",  label: "Goal-focused design"     },
                { icon: Zap,       bg: "bg-amber-400/15",     color: "text-amber-500",   label: "Instant XP feedback"     },
                { icon: TrendingUp,bg: "bg-emerald-500/15",   color: "text-emerald-500", label: "Real-time analytics"     },
                { icon: Trophy,    bg: "bg-violet-500/15",    color: "text-violet-500",  label: "Competitive leaderboards"},
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

        {/* ── Values ───────────────────────────────────────────────────────── */}
        <section className="bg-brand-bg dark:bg-slate-950 py-20 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              tag="What We Believe"
              title="Our Core Values"
              subtitle="Six principles that guide every product decision we make."
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
          </div>
        </section>

        {/* ── Team ─────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 py-20">
          <SectionHeading
            tag="The Team"
            title="Built by People Who Love Learning"
            subtitle="A small team of educators, engineers, and product thinkers on a mission to fix how online education works."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(({ name, role, bio, initials, color }) => (
              <div
                key={name}
                className="bg-white dark:bg-slate-800/60 border border-brand-border dark:border-white/10 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div
                  className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white text-lg font-extrabold shrink-0`}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-brand-dark dark:text-white leading-tight">{name}</p>
                  <p className="text-xs font-semibold text-brand-blue mt-0.5">{role}</p>
                </div>
                <p className="text-[13px] text-brand-body dark:text-white/55 leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="bg-brand-dark py-16 px-6 text-center">
          <div className="max-w-xl mx-auto">
            <Zap size={32} className="text-brand-blue mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-white mb-3">
              Ready to Start Your Quest?
            </h2>
            <p className="text-white/60 text-sm mb-7 leading-relaxed">
              Join thousands of learners already earning XP, climbing leaderboards,
              and building real skills on Questify.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-[#004182] transition-colors no-underline"
              >
                Get Started Free
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-bold hover:border-white/50 transition-colors no-underline"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
