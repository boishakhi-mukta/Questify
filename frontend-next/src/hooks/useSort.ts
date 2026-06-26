"use client";

import { useState, useCallback, useEffect } from "react";

export type SortKey =
  | "newest"
  | "popular"
  | "rating"
  | "az"
  | "za"
  | "price-asc"
  | "price-desc";

export interface SortOption {
  value: SortKey;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "newest",     label: "Newest" },
  { value: "popular",    label: "Most Popular" },
  { value: "rating",     label: "Highest Rated" },
  { value: "az",         label: "A–Z" },
  { value: "za",         label: "Z–A" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const VALID_KEYS = new Set<string>(SORT_OPTIONS.map((o) => o.value));
const STORAGE_KEY = "questify:sort";

export function useSort(initialFromUrl?: SortKey) {
  const [sort, setSort] = useState<SortKey>(initialFromUrl ?? "newest");

  // After mount: read from localStorage if no URL param was provided
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
