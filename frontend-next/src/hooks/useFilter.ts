"use client";

import { useState, useCallback, useMemo } from "react";

export interface FilterState {
  categories: string[];
  difficulty: string;
  minRating: number;
  priceType: "all" | "free" | "paid";
  dateFilter: "all" | "week" | "month" | "year";
}

export const DEFAULT_FILTERS: FilterState = {
  categories: [],
  difficulty: "",
  minRating: 0,
  priceType: "all",
  dateFilter: "all",
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

  const setMinRating = useCallback((r: number) => {
    setFilters((prev) => ({ ...prev, minRating: prev.minRating === r ? 0 : r }));
  }, []);

  const setPriceType = useCallback((t: FilterState["priceType"]) => {
    setFilters((prev) => ({ ...prev, priceType: t }));
  }, []);

  const setDateFilter = useCallback((d: FilterState["dateFilter"]) => {
    setFilters((prev) => ({ ...prev, dateFilter: d }));
  }, []);

  const clearAll = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const activeCount = useMemo(() => {
    let n = filters.categories.length;
    if (filters.difficulty) n++;
    if (filters.minRating > 0) n++;
    if (filters.priceType !== "all") n++;
    if (filters.dateFilter !== "all") n++;
    return n;
  }, [filters]);

  return {
    filters,
    setFilters,
    toggleCategory,
    setDifficulty,
    setMinRating,
    setPriceType,
    setDateFilter,
    clearAll,
    activeCount,
    hasActiveFilters: activeCount > 0,
  };
}
