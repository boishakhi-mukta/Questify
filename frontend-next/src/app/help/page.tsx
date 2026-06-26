"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { ChevronDown, Search, BookOpen, Trophy, Users, CreditCard, Settings, Headphones } from "lucide-react";
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
        q: "How do I create a Questify account?",
        a: "Click 'Get Started' at the top of the page and follow the sign-up flow. You can sign up with your email address or use a social login. Once registered, your account is immediately active and you can start browsing courses.",
      },
      {
        q: "Can I use Questify for free?",
        a: "Yes! Questify offers a free tier that gives you access to a selection of courses and core features like XP tracking and the leaderboard. Premium courses and advanced analytics are available on paid plans.",
      },
      {
        q: "What devices and browsers are supported?",
        a: "Questify works on any modern browser — Chrome, Firefox, Safari, and Edge. The platform is fully responsive, so you can learn on desktop, tablet, or mobile without installing an app.",
      },
      {
        q: "How do I enroll in a course?",
        a: "Visit the Courses page, find a course you like, and click 'Enroll'. Free courses are available immediately. For paid courses you'll be prompted to complete a payment before gaining access.",
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
        a: "You earn XP (experience points) by completing lessons, submitting assignments, passing quizzes, and maintaining learning streaks. XP accumulates across all your courses and determines your rank on the leaderboard.",
      },
      {
        q: "What is the leaderboard and how is it ranked?",
        a: "The leaderboard ranks learners by total XP earned. It resets monthly so everyone has a fresh chance to compete. Your all-time XP is also tracked separately on your profile.",
      },
      {
        q: "Do I lose XP if I miss a day?",
        a: "Missing a day breaks your streak but does not remove previously earned XP. Streaks provide bonus XP multipliers, so keeping them alive is beneficial, but your core XP is always safe.",
      },
      {
        q: "Are badges and achievements permanent?",
        a: "Yes. Badges you earn — for completing courses, achieving streaks, or reaching XP milestones — are permanently displayed on your profile and cannot be removed.",
      },
    ],
  },
  {
    id: "courses",
    icon: Users,
    label: "Courses & Content",
    faqs: [
      {
        q: "How long do I have access to a course after enrolling?",
        a: "Access is lifetime for courses you enroll in. Once you have access, you can revisit materials, re-watch videos, and retake quizzes as many times as you like.",
      },
      {
        q: "Can I download course materials for offline use?",
        a: "Downloadable resources (PDFs, slides, worksheets) attached by the instructor can be downloaded. Video lessons currently require an internet connection to stream.",
      },
      {
        q: "How do assignments and submissions work?",
        a: "Instructors post assignment prompts with deadlines. You submit your work directly through the platform. The instructor reviews and grades your submission, and the grade is reflected in your progress dashboard.",
      },
      {
        q: "What happens if a course is removed or updated?",
        a: "You will always retain access to the version you enrolled in. If an instructor significantly updates course content, enrolled students are notified and can choose to switch to the updated version.",
      },
    ],
  },
  {
    id: "billing",
    icon: CreditCard,
    label: "Billing & Payments",
    faqs: [
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover) as well as PayPal. All transactions are processed securely through Stripe.",
      },
      {
        q: "Can I get a refund?",
        a: "We offer a 7-day money-back guarantee on individual course purchases. If you are not satisfied within 7 days of purchasing, contact support and we will process a full refund — no questions asked.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Settings → Billing → Manage Subscription and click 'Cancel Plan'. Your access continues until the end of the current billing period. You won't be charged again after cancellation.",
      },
      {
        q: "Are there discounts for students or institutions?",
        a: "Yes! We offer discounted pricing for verified students and volume discounts for institutions. Contact us at support@questify.app with your school or organization email for details.",
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
        a: "Go to Settings → Security and use the 'Change Password' option. If you signed up via social login, you may need to set a password first before you can change it.",
      },
      {
        q: "How do I update my profile information?",
        a: "Navigate to your Profile page from the sidebar or user menu. You can update your display name, bio, avatar, and other details there. Changes save instantly.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Go to Settings → Account → Danger Zone and follow the steps to delete your account. This action is permanent and will remove all your data, including XP history and course progress.",
      },
      {
        q: "How do I switch between dark mode and light mode?",
        a: "Use the theme toggle icon in the top navigation bar or sidebar. Your preference is saved locally and persists across sessions.",
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
              Browse frequently asked questions or search for a specific topic.
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
                  Contact Support
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
                    We couldn&apos;t find an answer for that. Try a different keyword, or reach out directly.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-[#004182] transition-colors no-underline"
                  >
                    <Headphones size={15} />
                    Contact Support
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
              Still have questions?
            </h2>
            <p className="text-white/60 text-sm mb-6">
              Our support team is happy to help. Reach out and we&apos;ll get back to you within 24 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-[#004182] transition-colors no-underline"
            >
              <Headphones size={15} />
              Contact Support
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
