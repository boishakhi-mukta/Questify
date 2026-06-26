"use client";

import { HiXMark, HiStar } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import type { FilterState } from "@/hooks/useFilter";

export const LEVEL_OPTIONS = [
  { value: "BEGINNER",     label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED",     label: "Advanced" },
] as const;

interface FilterSidebarProps {
  filters: FilterState;
  categories: string[];
  onToggleCategory: (cat: string) => void;
  onSetDifficulty: (d: string) => void;
  onSetMinRating: (r: number) => void;
  onSetDateFilter: (d: FilterState["dateFilter"]) => void;
  onClearAll: () => void;
  activeCount: number;
  // Mobile drawer props
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
  onSetMinRating,
  onSetDateFilter,
  onClearAll,
  activeCount,
  open,
  onClose,
}: FilterSidebarProps) {
  const isDrawer = onClose !== undefined;

  const content = (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-brand-dark">Filters</span>
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
              Clear all
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

        {/* ── Category ──────────────────────────────────────── */}
        {categories.length > 0 && (
          <section>
            <SectionLabel>Category</SectionLabel>
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

        {/* ── Level / Difficulty ────────────────────────────── */}
        <section>
          <SectionLabel>Level</SectionLabel>
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

        {/* ── Minimum Rating ────────────────────────────────── */}
        <section>
          <SectionLabel>Minimum Rating</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {([4, 3, 2] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onSetMinRating(r)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] font-medium transition-colors text-left",
                  filters.minRating === r
                    ? "border-brand-blue bg-brand-blue-light text-brand-blue"
                    : "border-brand-border text-brand-body hover:border-brand-blue/40 hover:bg-brand-blue-light/40"
                )}
              >
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <HiStar
                      key={i}
                      size={13}
                      className={i < r ? "text-amber-400" : "text-brand-border"}
                    />
                  ))}
                </span>
                <span>{r}★ & up</span>
              </button>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Date Added ────────────────────────────────────── */}
        <section>
          <SectionLabel>Date Added</SectionLabel>
          <select
            value={filters.dateFilter}
            onChange={(e) => onSetDateFilter(e.target.value as FilterState["dateFilter"])}
            className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-[14px] text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-colors cursor-pointer"
          >
            <option value="all">All time</option>
            <option value="year">This year</option>
            <option value="month">This month</option>
            <option value="week">This week</option>
          </select>
        </section>

      </div>
    </div>
  );

  // ── Desktop sidebar (always visible, inline) ────────────────────────
  if (!isDrawer) {
    return (
      <div className="w-[240px] shrink-0 bg-white rounded-xl border border-brand-border p-5 sticky top-[80px] max-h-[calc(100vh-100px)] overflow-hidden flex flex-col">
        {content}
      </div>
    );
  }

  // ── Mobile drawer (conditional overlay) ────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
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
