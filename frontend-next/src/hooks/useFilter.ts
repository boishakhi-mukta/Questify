"use client";

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

export function useFilter(initial: Partial<FilterState> = {}) {
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, ...initial });

  const toggleCategory = useCallback((cat: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }, []);

  const setDifficulty = useCallback((diff: string) => {
    setFilters((prev) => ({ ...prev, difficulty: prev.difficulty === diff ? "" : diff }));
  }, []);

  const setSemester = useCallback((s: string) => {
    setFilters((prev) => ({ ...prev, semester: prev.semester === s ? "" : s }));
  }, []);

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
