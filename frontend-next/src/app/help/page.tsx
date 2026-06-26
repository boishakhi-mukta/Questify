"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ChevronDown,
  Search,
  BookOpen,
  Trophy,
  ClipboardList,
  CalendarDays,
  Settings,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Data ───────────────────────────────────────────────────────────────────────

interface FAQ {
  q: string;
  a: string;
}

interface Category {
  id: string;
  icon: React.ElementType;
  label: string;
  faqs: FAQ[];
}

const categories: Category[] = [
  {
    id: "getting-started",
    icon: BookOpen,
    label: "Getting Started",
    faqs: [
      {
        q: "How do I get a Questify account?",
        a: "All Questify accounts are created by university administration. Enrolled students and faculty members receive login credentials (email + temporary password) from the admin team. There is no self-registration — if you have not received your credentials, contact your department office or the IT helpdesk.",
      },
      {
        q: "Can I sign up on my own?",
        a: "No. Questify is a closed, university-internal system. Only administrators can create accounts. This ensures that access is restricted to currently enrolled students and active faculty members.",
      },
      {
        q: "I haven't received my login details. What should I do?",
        a: "Contact your department office or the IT helpdesk directly. Provide your student or employee ID so the admin team can locate or create your account. You can also use the Contact page to submit a support request.",
      },
      {
        q: "What devices and browsers are supported?",
        a: "Questify works on any modern browser — Chrome, Firefox, Safari, and Edge. The platform is fully responsive and works on desktop, tablet, and mobile without installing an app.",
      },
      {
        q: "How do I log in for the first time?",
        a: "Use the email address and temporary password provided by administration at questify.edu/login. You will be prompted to set a new password on your first successful login. If you do not change it immediately, you can do so later from Settings → Account & Security.",
      },
    ],
  },
  {
    id: "xp-gamification",
    icon: Trophy,
    label: "XP & Gamification",
    faqs: [
      {
        q: "How does the XP system work?",
        a: "You earn XP (experience points) through three main activities: attending classes (attendance XP awarded by faculty after each session), submitting assignments (XP reflects completion and timeliness), and completing course progress milestones. XP accumulates across all enrolled courses and determines your rank on the university leaderboard.",
      },
      {
        q: "What is the leaderboard and who can see it?",
        a: "The leaderboard ranks all enrolled students by their total XP across all courses. It is visible to all logged-in users — students, faculty, and administrators. It updates in real time as XP is awarded.",
      },
      {
        q: "Do I lose XP if I miss a class?",
        a: "Missing a class means you do not earn attendance XP for that session, but your previously earned XP is never removed. XP can only increase over time.",
      },
      {
        q: "Are badges and achievements permanent?",
        a: "Yes. Badges you earn — for completing courses, reaching XP milestones, or achieving a top leaderboard rank — are permanently displayed on your profile and cannot be removed.",
      },
      {
        q: "I think my XP is incorrect. What should I do?",
        a: "First, check the XP breakdown in your individual course pages. If the XP shown does not match your attendance or assignment records, contact the relevant faculty member. If the issue persists across multiple courses or appears system-wide, submit a request to the IT helpdesk.",
      },
    ],
  },
  {
    id: "courses-assignments",
    icon: ClipboardList,
    label: "Courses & Assignments",
    faqs: [
      {
        q: "How do I get enrolled in a course?",
        a: "Course enrollment is managed by university administration. Students are enrolled in their registered courses by admin as part of the semester setup process. You cannot self-enrol. If a course is missing from your dashboard, contact the admin team.",
      },
      {
        q: "How long do I have access to a course?",
        a: "Access is active while you are enrolled and the course is running. Once a semester ends and the course is closed by administration, your access depends on institutional policy. If you need to revisit past course materials, contact the IT helpdesk.",
      },
      {
        q: "Can I download course materials?",
        a: "Yes. Any files uploaded by faculty — PDFs, slides, reading materials — can be downloaded directly from the course materials section. There is no restriction on downloading content from your enrolled courses.",
      },
      {
        q: "How do assignments work?",
        a: "Faculty post assignments with descriptions and deadlines. You submit your work directly through the Questify platform from the assignment detail page. Once submitted, faculty review and grade the work. Grades and XP are reflected in your course progress dashboard.",
      },
      {
        q: "Can I resubmit an assignment?",
        a: "Resubmission depends on whether the faculty member has closed the assignment. If the deadline has not passed and the assignment is still open, you can submit again from the same assignment page. Contact your faculty member if you need special consideration.",
      },
    ],
  },
  {
    id: "attendance",
    icon: CalendarDays,
    label: "Attendance",
    faqs: [
      {
        q: "How is attendance recorded?",
        a: "Attendance is marked by faculty members for each class session. After a session, the teacher records which students were present. Students do not self-report attendance — this ensures accurate records.",
      },
      {
        q: "Where can I see my attendance record?",
        a: "Your attendance history is visible inside each enrolled course. Navigate to the course page and look for the Attendance section. You will see a list of sessions with present/absent status for each.",
      },
      {
        q: "My attendance record seems wrong. What should I do?",
        a: "If you believe a session was incorrectly marked as absent, contact the faculty member who teaches that course. They can update the attendance record on their end. For unresolved disputes, escalate to the department administration.",
      },
      {
        q: "Does attendance affect my XP?",
        a: "Yes. Each attended session earns attendance XP as set by the faculty member for that course. Absent sessions earn no XP for that session, but past earned XP is never deducted.",
      },
    ],
  },
  {
    id: "account",
    icon: Settings,
    label: "Account & Settings",
    faqs: [
      {
        q: "How do I change my password?",
        a: "Go to Settings → Account & Security and use the 'Change Password' section. You will need to enter your current password to confirm the change. Choose a strong password and keep it private.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "Questify does not support self-service password resets. On the login page, the 'Forgot password?' link will prompt you to contact the administration team. Reach out to the IT helpdesk or your department office with your student/employee ID and they will reset your password.",
      },
      {
        q: "How do I update my profile information?",
        a: "Navigate to your Profile page from the sidebar. You can update your display name and other personal details there. Your email address is tied to your university account and can only be changed by administration.",
      },
      {
        q: "How do I switch between dark mode and light mode?",
        a: "Use the theme toggle in the top navigation bar, or go to Settings → Display and select your preferred theme. Your choice is saved and applies across all sessions.",
      },
      {
        q: "Can I change my language to Norwegian?",
        a: "Yes. Go to Settings → Display and select your preferred language. Questify supports English and Norwegian (Bokmål). The interface updates immediately after you change the language setting.",
      },
    ],
  },
];

// ── Accordion item ─────────────────────────────────────────────────────────────

function AccordionItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-brand-border dark:border-white/8 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="text-sm font-semibold text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-blue transition-colors leading-snug">
          {faq.q}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-brand-body/50 dark:text-white/40 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-brand-body dark:text-white/60 leading-relaxed">
          {faq.a}
        </div>
      )}
    </div>
  );
}

// ── Category section ───────────────────────────────────────────────────────────

function CategorySection({ cat, filterText }: { cat: Category; filterText: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = cat.faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(filterText) ||
      faq.a.toLowerCase().includes(filterText),
  );

  if (filtered.length === 0) return null;
  const Icon = cat.icon;

  return (
    <section id={cat.id} aria-labelledby={`heading-${cat.id}`} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
          <Icon size={17} className="text-brand-blue" />
        </div>
        <h2 id={`heading-${cat.id}`} className="text-lg font-bold text-brand-dark dark:text-white">
          {cat.label}
        </h2>
      </div>
      <div className="bg-white dark:bg-slate-800/60 border border-brand-border dark:border-white/10 rounded-xl px-5">
        {filtered.map((faq, i) => (
          <AccordionItem
            key={faq.q}
            faq={faq}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const filterText = search.trim().toLowerCase();

  const totalVisible = categories.reduce(
    (acc, cat) =>
      acc +
      cat.faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(filterText) ||
          f.a.toLowerCase().includes(filterText),
      ).length,
    0,
  );

  return (
    <>
      <Navbar />

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="bg-gradient-to-b from-brand-bg to-white dark:from-slate-950 dark:to-slate-900 pt-16 pb-14 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <span className="inline-block mb-4 px-3.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
              Help Center
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white mb-4 leading-tight">
              How Can We Help?
            </h1>
            <p className="text-brand-body dark:text-white/60 text-lg leading-relaxed mb-8">
              Find answers about accounts, courses, attendance, XP, and settings —
              or submit a request to the IT helpdesk.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-body/50 dark:text-white/30 pointer-events-none"
              />
              <input
                type="search"
                placeholder="Search questions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 bg-white dark:bg-slate-800 border border-brand-border dark:border-white/10 rounded-xl pl-11 pr-4 text-sm text-brand-dark dark:text-white placeholder:text-brand-body/50 dark:placeholder:text-white/30 outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue shadow-sm transition-all"
                aria-label="Search FAQs"
              />
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 py-16">
          <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-14 items-start">

            {/* Sidebar — category nav (desktop) */}
            <aside className="hidden lg:block sticky top-24 space-y-1" aria-label="FAQ categories">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-brand-body dark:text-white/55 hover:text-brand-blue dark:hover:text-white hover:bg-brand-bg dark:hover:bg-white/8 transition-colors no-underline"
                  >
                    <Icon size={16} />
                    {cat.label}
                  </a>
                );
              })}

              <div className="pt-4 border-t border-brand-border dark:border-white/10 mt-4">
                <p className="text-xs text-brand-body/50 dark:text-white/30 px-3 mb-2">
                  Still stuck?
                </p>
                <Link
                  href="/contact"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-brand-blue hover:underline underline-offset-2 no-underline transition-colors"
                >
                  <Headphones size={16} />
                  Contact Helpdesk
                </Link>
              </div>
            </aside>

            {/* FAQ list */}
            <div className="space-y-10">
              {filterText && (
                <p className="text-sm text-brand-body dark:text-white/50">
                  {totalVisible === 0
                    ? `No results for "${search}"`
                    : `${totalVisible} result${totalVisible !== 1 ? "s" : ""} for "${search}"`}
                </p>
              )}

              {totalVisible === 0 && filterText ? (
                <div className="text-center py-16">
                  <p className="text-brand-body dark:text-white/50 mb-4">
                    We couldn&apos;t find an answer for that. Try a different keyword, or contact the helpdesk directly.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-[#004182] transition-colors no-underline"
                  >
                    <Headphones size={15} />
                    Contact Helpdesk
                  </Link>
                </div>
              ) : (
                categories.map((cat) => (
                  <CategorySection key={cat.id} cat={cat} filterText={filterText} />
                ))
              )}
            </div>

          </div>
        </section>

        {/* CTA band */}
        <section className="bg-brand-dark py-14 px-6 text-center">
          <div className="max-w-xl mx-auto">
            <Headphones size={32} className="text-brand-blue mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Couldn&apos;t find what you need?
            </h2>
            <p className="text-white/60 text-sm mb-6">
              The IT helpdesk is available Monday–Friday, 08:00–16:00 CET.
              Include your student or employee ID for faster resolution.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-[#004182] transition-colors no-underline"
            >
              <Headphones size={15} />
              Contact the Helpdesk
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
