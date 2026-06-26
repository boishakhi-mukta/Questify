"use client";

import { useState, useCallback, useEffect } from "react";

export type SortKey = "newest" | "popular" | "az" | "za" | "credits-asc" | "credits-desc";

export interface SortOption {
  value: SortKey;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "newest",       label: "Newest"              },
  { value: "popular",      label: "Most Enrolled"       },
  { value: "az",           label: "A–Z"                 },
  { value: "za",           label: "Z–A"                 },
  { value: "credits-desc", label: "Credits: High to Low"},
  { value: "credits-asc",  label: "Credits: Low to High"},
];

const VALID_KEYS = new Set<string>(SORT_OPTIONS.map((o) => o.value));
const STORAGE_KEY = "questify:sort";

export function useSort(initialFromUrl?: SortKey) {
  const [sort, setSort] = useState<SortKey>(initialFromUrl ?? "newest");

  useEffect(() => {
    if (!initialFromUrl) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_KEYS.has(stored)) {
        setSort(stored as SortKey);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSort = useCallback((next: SortKey) => {
    setSort(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return { sort, setSort: updateSort };
}
