"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useFilter
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Manages checkbox filter settings (category, level).
 * 
 * WHY IT EXISTS:
 * Powers the course filter sidebar.
 * 
 * HOW IT WORKS (Technical Overview):
 * Handles array operations toggling active filter lists.
 * ============================================================================
 */

import { useState, useCallback, useMemo } from "react";

export interface FilterState {
  categories: string[];
  difficulty: string;
  semester:   string;
}

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  difficulty: "",
  semester:   "",
};

// Keeps track of which course filters (category, difficulty, semester) the
// user has picked, and provides simple functions to turn each one on/off.
export function useFilter(initial: Partial<FilterState> = {}) {
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, ...initial });

  // Adds a category to the filter if it isn't selected yet, or removes it if it is.
  const toggleCategory = useCallback((cat: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }, []);

  // Picks a difficulty filter, or clears it if the same one is clicked again.
  const setDifficulty = useCallback((diff: string) => {
    setFilters((prev) => ({ ...prev, difficulty: prev.difficulty === diff ? "" : diff }));
  }, []);

  // Picks a semester filter, or clears it if the same one is clicked again.
  const setSemester = useCallback((s: string) => {
    setFilters((prev) => ({ ...prev, semester: prev.semester === s ? "" : s }));
  }, []);

  // Resets every filter back to "nothing selected".
  const clearAll = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const activeCount = useMemo(() => {
    let n = filters.categories.length;
    if (filters.difficulty) n++;
    if (filters.semester)   n++;
    return n;
  }, [filters]);

  return {
    filters,
    setFilters,
    toggleCategory,
    setDifficulty,
    setSemester,
    clearAll,
    activeCount,
    hasActiveFilters: activeCount > 0,
  };
}
