"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useSort
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Hook managing sort parameters (A-Z, date).
 * 
 * WHY IT EXISTS:
 * Powers catalog sorting.
 * 
 * HOW IT WORKS (Technical Overview):
 * Manages search parameters updating sort configurations.
 * ============================================================================
 */

import { useState, useCallback, useEffect } from "react";

export type SortKey = "newest" | "popular" | "az" | "za" | "credits-asc" | "credits-desc";

export interface SortOption {
  value: SortKey;
  label: string;
  labelKey: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "newest",       label: "Newest",               labelKey: "sortDropdown.newest"          },
  { value: "popular",      label: "Most Enrolled",        labelKey: "sortDropdown.mostEnrolled"    },
  { value: "az",           label: "A–Z",                  labelKey: "sortDropdown.az"              },
  { value: "za",           label: "Z–A",                  labelKey: "sortDropdown.za"              },
  { value: "credits-desc", label: "Credits: High to Low", labelKey: "sortDropdown.creditsHighToLow"},
  { value: "credits-asc",  label: "Credits: Low to High", labelKey: "sortDropdown.creditsLowToHigh"},
];

const VALID_KEYS = new Set<string>(SORT_OPTIONS.map((o) => o.value));
const STORAGE_KEY = "questify:sort";

// Keeps track of which sort order (newest, A-Z, etc.) the course catalogue
// is using, remembering the user's last choice for next time they visit.
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

  // Changes the sort order and saves the choice so it's remembered next visit.
  const updateSort = useCallback((next: SortKey) => {
    setSort(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return { sort, setSort: updateSort };
}
