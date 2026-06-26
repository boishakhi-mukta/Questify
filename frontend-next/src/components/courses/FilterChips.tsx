"use client";

import type React from "react";
import { HiXMark } from "react-icons/hi2";
import type { FilterState } from "@/hooks/useFilter";

interface Chip {
  label: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  filters: FilterState;
  onToggleCategory: (cat: string) => void;
  onSetDifficulty: (d: string) => void;
  onSetMinRating: (r: number) => void;
  onSetPriceType: (t: FilterState["priceType"]) => void;
  onSetDateFilter: (d: FilterState["dateFilter"]) => void;
  onClearAll: () => void;
  resultCount: number;
  query: string;
  rightSlot?: React.ReactNode;
}

const DATE_LABELS: Record<string, string> = {
  week: "This week",
  month: "This month",
  year: "This year",
};

export function FilterChips({
  filters,
  onToggleCategory,
  onSetDifficulty,
  onSetMinRating,
  onSetPriceType,
  onSetDateFilter,
  onClearAll,
  resultCount,
  query,
  rightSlot,
}: FilterChipsProps) {
  const chips: Chip[] = [
    ...filters.categories.map((cat) => ({
      label: cat,
      onRemove: () => onToggleCategory(cat),
    })),
    ...(filters.difficulty
      ? [{ label: filters.difficulty, onRemove: () => onSetDifficulty(filters.difficulty) }]
      : []),
    ...(filters.minRating > 0
      ? [{ label: `${filters.minRating}★+`, onRemove: () => onSetMinRating(filters.minRating) }]
      : []),
    ...(filters.priceType !== "all"
      ? [
          {
            label: filters.priceType === "free" ? "Free" : "Paid",
            onRemove: () => onSetPriceType("all"),
          },
        ]
      : []),
    ...(filters.dateFilter !== "all"
      ? [
          {
            label: DATE_LABELS[filters.dateFilter] ?? filters.dateFilter,
            onRemove: () => onSetDateFilter("all"),
          },
        ]
      : []),
  ];

  const hasFiltersOrSearch = chips.length > 0 || query;

  return (
    <div className="flex flex-col gap-3 mb-5">
      {/* Result count + clear all */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[14px] text-brand-body">
          {hasFiltersOrSearch ? (
            <>
              <span className="font-bold text-brand-dark">{resultCount}</span>
              {query ? (
                <> result{resultCount !== 1 ? "s" : ""} for &ldquo;<span className="font-semibold text-brand-dark">{query}</span>&rdquo;</>
              ) : (
                <> course{resultCount !== 1 ? "s" : ""} found</>
              )}
            </>
          ) : (
            <>
              <span className="font-bold text-brand-dark">{resultCount}</span> course{resultCount !== 1 ? "s" : ""} available
            </>
          )}
        </p>

        <div className="flex items-center gap-3">
          {rightSlot}
          {chips.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[13px] font-semibold text-brand-blue hover:text-brand-dark transition-colors shrink-0"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Active chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map(({ label, onRemove }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 bg-brand-blue-light text-brand-blue text-[13px] font-semibold px-3 py-1.5 rounded-full border border-brand-blue/20"
            >
              {label}
              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${label} filter`}
                className="text-brand-blue/70 hover:text-brand-dark transition-colors"
              >
                <HiXMark size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
