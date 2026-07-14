"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: FAQ & Support
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Public help directory listing answers to common questions.
 * 
 * WHY IT EXISTS:
 * Simplifies user support.
 * 
 * HOW IT WORKS (Technical Overview):
 * Accordion layout mapping static FAQ strings.
 * ============================================================================
 */

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
import { useTranslation } from "react-i18next";

// ── Data ───────────────────────────────────────────────────────────────────────

interface FAQ {
  qKey: string;
  aKey: string;
}

interface Category {
  id: string;
  icon: React.ElementType;
  labelKey: string;
  faqs: FAQ[];
}

const categories: Category[] = [
  {
    id: "getting-started",
    icon: BookOpen,
    labelKey: "helpPage.catGettingStarted",
    faqs: [
      { qKey: "helpPage.gsQ1", aKey: "helpPage.gsA1" },
      { qKey: "helpPage.gsQ2", aKey: "helpPage.gsA2" },
      { qKey: "helpPage.gsQ3", aKey: "helpPage.gsA3" },
      { qKey: "helpPage.gsQ4", aKey: "helpPage.gsA4" },
      { qKey: "helpPage.gsQ5", aKey: "helpPage.gsA5" },
    ],
  },
  {
    id: "xp-gamification",
    icon: Trophy,
    labelKey: "helpPage.catXpGamification",
    faqs: [
      { qKey: "helpPage.xpQ1", aKey: "helpPage.xpA1" },
      { qKey: "helpPage.xpQ2", aKey: "helpPage.xpA2" },
      { qKey: "helpPage.xpQ3", aKey: "helpPage.xpA3" },
      { qKey: "helpPage.xpQ4", aKey: "helpPage.xpA4" },
      { qKey: "helpPage.xpQ5", aKey: "helpPage.xpA5" },
    ],
  },
  {
    id: "courses-assignments",
    icon: ClipboardList,
    labelKey: "helpPage.catCoursesAssignments",
    faqs: [
      { qKey: "helpPage.caQ1", aKey: "helpPage.caA1" },
      { qKey: "helpPage.caQ2", aKey: "helpPage.caA2" },
      { qKey: "helpPage.caQ3", aKey: "helpPage.caA3" },
      { qKey: "helpPage.caQ4", aKey: "helpPage.caA4" },
      { qKey: "helpPage.caQ5", aKey: "helpPage.caA5" },
    ],
  },
  {
    id: "attendance",
    icon: CalendarDays,
    labelKey: "helpPage.catAttendance",
    faqs: [
      { qKey: "helpPage.atQ1", aKey: "helpPage.atA1" },
      { qKey: "helpPage.atQ2", aKey: "helpPage.atA2" },
      { qKey: "helpPage.atQ3", aKey: "helpPage.atA3" },
      { qKey: "helpPage.atQ4", aKey: "helpPage.atA4" },
    ],
  },
  {
    id: "account",
    icon: Settings,
    labelKey: "helpPage.catAccount",
    faqs: [
      { qKey: "helpPage.acQ1", aKey: "helpPage.acA1" },
      { qKey: "helpPage.acQ2", aKey: "helpPage.acA2" },
      { qKey: "helpPage.acQ3", aKey: "helpPage.acA3" },
      { qKey: "helpPage.acQ4", aKey: "helpPage.acA4" },
      { qKey: "helpPage.acQ5", aKey: "helpPage.acA5" },
    ],
  },
];

// ── Accordion item ─────────────────────────────────────────────────────────────

function AccordionItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-brand-border dark:border-white/8 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="text-sm font-semibold text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-blue transition-colors leading-snug">
          {q}
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
          {a}
        </div>
      )}
    </div>
  );
}

// ── Category section ───────────────────────────────────────────────────────────

function CategorySection({ cat, filterText }: { cat: Category; filterText: string }) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const translatedFaqs = cat.faqs.map((faq) => ({ q: t(faq.qKey), a: t(faq.aKey) }));
  const filtered = translatedFaqs.filter(
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
          {t(cat.labelKey)}
        </h2>
      </div>
      <div className="bg-white dark:bg-slate-800/60 border border-brand-border dark:border-white/10 rounded-xl px-5">
        {filtered.map((faq, i) => (
          <AccordionItem
            key={faq.q}
            q={faq.q}
            a={faq.a}
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
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const filterText = search.trim().toLowerCase();

  const totalVisible = categories.reduce(
    (acc, cat) =>
      acc +
      cat.faqs.filter(
        (f) =>
          t(f.qKey).toLowerCase().includes(filterText) ||
          t(f.aKey).toLowerCase().includes(filterText),
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
              {t("helpPage.badge")}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white mb-4 leading-tight">
              {t("helpPage.title")}
            </h1>
            <p className="text-brand-body dark:text-white/60 text-lg leading-relaxed mb-8">
              {t("helpPage.subtitle")}
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-body/50 dark:text-white/30 pointer-events-none"
              />
              <input
                type="search"
                placeholder={t("helpPage.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 bg-white dark:bg-slate-800 border border-brand-border dark:border-white/10 rounded-xl pl-11 pr-4 text-sm text-brand-dark dark:text-white placeholder:text-brand-body/50 dark:placeholder:text-white/30 outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue shadow-sm transition-all"
                aria-label={t("helpPage.searchPlaceholder")}
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
                    {t(cat.labelKey)}
                  </a>
                );
              })}

              <div className="pt-4 border-t border-brand-border dark:border-white/10 mt-4">
                <p className="text-xs text-brand-body/50 dark:text-white/30 px-3 mb-2">
                  {t("helpPage.stillStuck")}
                </p>
                <Link
                  href="/contact"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-brand-blue hover:underline underline-offset-2 no-underline transition-colors"
                >
                  <Headphones size={16} />
                  {t("helpPage.contactHelpdeskLink")}
                </Link>
              </div>
            </aside>

            {/* FAQ list */}
            <div className="space-y-10">
              {filterText && (
                <p className="text-sm text-brand-body dark:text-white/50">
                  {totalVisible === 0
                    ? t("helpPage.noResultsFor", { search })
                    : t("helpPage.resultsFor", { count: totalVisible, search })}
                </p>
              )}

              {totalVisible === 0 && filterText ? (
                <div className="text-center py-16">
                  <p className="text-brand-body dark:text-white/50 mb-4">
                    {t("helpPage.noAnswerDesc")}
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue-dark transition-colors no-underline"
                  >
                    <Headphones size={15} />
                    {t("helpPage.contactHelpdeskLink")}
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
              {t("helpPage.ctaTitle")}
            </h2>
            <p className="text-white/60 text-sm mb-6">
              {t("helpPage.ctaDesc")}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-dark transition-colors no-underline"
            >
              <Headphones size={15} />
              {t("helpPage.ctaBtn")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
