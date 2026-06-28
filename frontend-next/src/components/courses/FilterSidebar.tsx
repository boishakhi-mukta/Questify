"use client";

import { HiXMark } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import type { FilterState } from "@/hooks/useFilter";
import { useTranslation } from "react-i18next";

export const LEVEL_OPTIONS = [
  { value: "BACHELOR", label: "Bachelor" },
  { value: "MASTERS",  label: "Masters"  },
] as const;

export const SEMESTER_OPTIONS = [
  "Spring 2025",
  "Fall 2025",
  "Spring 2026",
  "Fall 2026",
];

interface FilterSidebarProps {
  filters: FilterState;
  categories: string[];
  onToggleCategory: (cat: string) => void;
  onSetDifficulty: (d: string) => void;
  onSetSemester: (s: string) => void;
  onClearAll: () => void;
  activeCount: number;
  open?: boolean;
  onClose?: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-body/60 mb-3">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-brand-border my-5" />;
}

export function FilterSidebar({
  filters,
  categories,
  onToggleCategory,
  onSetDifficulty,
  onSetSemester,
  onClearAll,
  activeCount,
  open,
  onClose,
}: FilterSidebarProps) {
  const { t } = useTranslation();
  const isDrawer = onClose !== undefined;

  const content = (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-brand-dark">{t("filterSidebar.filters")}</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-[11px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-brand-blue hover:text-brand-dark transition-colors"
            >
              {t("filterSidebar.clearAll")}
            </button>
          )}
          {isDrawer && (
            <button
              onClick={onClose}
              aria-label="Close filters"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-body hover:bg-brand-bg transition-colors"
            >
              <HiXMark size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable filter body */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Department ──────────────────────────────────────── */}
        {categories.length > 0 && (
          <section>
            <SectionLabel>{t("filterSidebar.department")}</SectionLabel>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat)}
                    onChange={() => onToggleCategory(cat)}
                    className="w-4 h-4 rounded accent-brand-blue cursor-pointer"
                  />
                  <span className="text-[14px] text-brand-body group-hover:text-brand-dark transition-colors">
                    {cat}
                  </span>
                </label>
              ))}
            </div>
            <Divider />
          </section>
        )}

        {/* ── Level ───────────────────────────────────────────── */}
        <section>
          <SectionLabel>{t("filterSidebar.level")}</SectionLabel>
          <div className="flex flex-col gap-2">
            {LEVEL_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="difficulty"
                  checked={filters.difficulty === value}
                  onChange={() => onSetDifficulty(value)}
                  className="w-4 h-4 accent-brand-blue cursor-pointer"
                />
                <span className="text-[14px] text-brand-body group-hover:text-brand-dark transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Semester ────────────────────────────────────────── */}
        <section>
          <SectionLabel>{t("filterSidebar.semester")}</SectionLabel>
          <div className="flex flex-col gap-2">
            {SEMESTER_OPTIONS.map((s) => (
              <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="semester"
                  checked={filters.semester === s}
                  onChange={() => onSetSemester(s)}
                  className="w-4 h-4 accent-brand-blue cursor-pointer"
                />
                <span className="text-[14px] text-brand-body group-hover:text-brand-dark transition-colors">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </section>

      </div>
    </div>
  );

  if (!isDrawer) {
    return (
      <div className="w-[240px] shrink-0 bg-white rounded-xl border border-brand-border p-5 sticky top-[80px] max-h-[calc(100vh-100px)] overflow-hidden flex flex-col">
        {content}
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[300px] bg-white shadow-2xl p-5 flex flex-col transition-transform duration-250 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {content}
      </div>
    </>
  );
}
