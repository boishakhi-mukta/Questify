"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: usePagination
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom hook managing pagination offsets.
 *
 * WHY IT EXISTS:
 * Powers page navigation arrays.
 *
 * HOW IT WORKS (Technical Overview):
 * Calculates offsets for paginated queries.
 * ============================================================================
 */

import { useState, useCallback, useEffect } from "react";

export const PAGE_SIZES = [9, 18, 36] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

const PAGE_SIZE_KEY = "questify:pageSize";

// Handles splitting a long list of items into pages: works out how many
// pages there are, which page you're on, and lets you jump between pages
// or change how many items are shown per page (remembering that choice).
export function usePagination(
  totalItems: number,
  initialPage = 1,
  initialPageSize?: PageSize,
) {
  const [page, setPage]              = useState(Math.max(1, initialPage));
  const [pageSize, setPageSizeState] = useState<PageSize>(initialPageSize ?? 9);

  // After mount: read page size from localStorage if no URL param provided
  useEffect(() => {
    if (!initialPageSize) {
      const stored = Number(localStorage.getItem(PAGE_SIZE_KEY));
      if (PAGE_SIZES.includes(stored as PageSize)) {
        setPageSizeState(stored as PageSize);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages  = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex   = Math.min(startIndex + pageSize, totalItems);

  // Jumps to a specific page (never lower than page 1).
  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, p));
  }, []);

  // Changes how many items are shown per page, jumps back to page 1 (so the
  // view doesn't land somewhere confusing), and remembers the choice for next time.
  const setPageSize = useCallback((size: PageSize) => {
    setPageSizeState(size);
    setPage(1);
    localStorage.setItem(PAGE_SIZE_KEY, String(size));
  }, []);

  return {
    page:       currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    setPageSize,
    hasPrev:    currentPage > 1,
    hasNext:    currentPage < totalPages,
    rangeStart: totalItems > 0 ? startIndex + 1 : 0,
    rangeEnd:   endIndex,
    totalItems,
  };
}
