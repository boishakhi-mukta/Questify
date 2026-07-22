"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: FilterChips
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Small clickable tags above search result lists showing what filters are active.
 * 
 * WHY IT EXISTS:
 * Let users visually see active filters and clear them with a single click (X).
 * 
 * HOW IT WORKS (Technical Overview):
 * Maps over active filter keys, rendering buttons that trigger clean reset actions.
 * ============================================================================
 */

import type React from "react";
import { HiXMark } from "react-icons/hi2";
import type { FilterState } from "@/hooks/useFilter";
import { useTranslation } from "react-i18next";

interface Chip {
  label: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  filters: FilterState;
  onToggleCategory: (cat: string) => void;
  onSetDifficulty: (d: string) => void;
  onSetSemester: (s: string) => void;
  onClearAll: () => void;
  resultCount: number;
  query: string;
  rightSlot?: React.ReactNode;
}

const LEVEL_LABELS: Record<string, string> = {
  BACHELOR: "Bachelor",
  MASTERS:  "Masters",
};

// Shows the "N courses found" summary line, plus a removable pill for each
// active filter (so users can see at a glance what's narrowing their results
// and remove one filter at a time without opening the full filter panel).
export function FilterChips({
  filters,
  onToggleCategory,
  onSetDifficulty,
  onSetSemester,
  onClearAll,
  resultCount,
  query,
  rightSlot,
}: FilterChipsProps) {
  const { t } = useTranslation();
  const chips: Chip[] = [
    ...filters.categories.map((cat) => ({
      label: cat,
      onRemove: () => onToggleCategory(cat),
    })),
    ...(filters.difficulty
      ? [{ label: LEVEL_LABELS[filters.difficulty] ?? filters.difficulty, onRemove: () => onSetDifficulty(filters.difficulty) }]
      : []),
    ...(filters.semester
      ? [{ label: filters.semester, onRemove: () => onSetSemester(filters.semester) }]
      : []),
  ];

  const hasFiltersOrSearch = chips.length > 0 || query;

  return (
    <div className="flex flex-col gap-3 mb-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[15px] text-brand-body">
          {hasFiltersOrSearch ? (
            query ? (
              <>{t("filterChips.resultsFor", { count: resultCount })} &ldquo;<span className="font-semibold text-brand-dark">{query}</span>&rdquo;</>
            ) : (
              t("filterChips.coursesFound", { count: resultCount })
            )
          ) : (
            t("filterChips.coursesAvailable", { count: resultCount })
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
              {t("filterChips.clearAllFilters")}
            </button>
          )}
        </div>
      </div>

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
