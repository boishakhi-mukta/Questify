"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: Pagination
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Interactive page switching buttons at the bottom of long lists (like course directories).
 * 
 * WHY IT EXISTS:
 * Avoids long pages and slow loading speeds by displaying results in chunks.
 * 
 * HOW IT WORKS (Technical Overview):
 * Calculates total page counts, page sizes, and handles clicks to request next chunks.
 * ============================================================================
 */

import { useState, useCallback, type KeyboardEvent } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZES, type PageSize } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page:              number;
  totalPages:        number;
  pageSize:          PageSize;
  rangeStart:        number;
  rangeEnd:          number;
  totalItems:        number;
  onPageChange:      (p: number) => void;
  onPageSizeChange:  (size: PageSize) => void;
}

// Build the page-number list, inserting "..." where gaps occur.
function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  const left  = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2)        pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

function PageBtn({
  page,
  current,
  onClick,
}: {
  page: number;
  current: number;
  onClick: (p: number) => void;
}) {
  const isActive = page === current;
  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      aria-label={`Page ${page}`}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "w-8 h-8 rounded-md text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
        isActive
          ? "bg-brand-blue text-white"
          : "text-brand-dark hover:bg-brand-bg",
      )}
    >
      {page}
    </button>
  );
}

export function Pagination({
  page,
  totalPages,
  pageSize,
  rangeStart,
  rangeEnd,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { t } = useTranslation();
  const [jumpValue, setJumpValue] = useState("");

  const handleJump = useCallback(() => {
    const n = parseInt(jumpValue, 10);
    if (!isNaN(n) && n >= 1 && n <= totalPages) onPageChange(n);
    setJumpValue("");
  }, [jumpValue, totalPages, onPageChange]);

  const handleJumpKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleJump();
  };

  if (totalItems === 0) return null;

  const pageRange = buildPageRange(page, totalPages);

  return (
    <div className="mt-8 space-y-4" aria-label="Pagination controls">

      {/* ── "Showing X–Y of N" ── */}
      <p className="text-[13px] text-brand-body text-center">
        {t("pagination.showing")}{" "}
        <span className="font-bold text-brand-dark">{rangeStart}–{rangeEnd}</span>{" "}
        {t("pagination.of")}{" "}
        <span className="font-bold text-brand-dark">{totalItems}</span>{" "}
        {t("pagination.courses")}
      </p>

      {/* ── Controls row ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Page size selector — left */}
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <span className="text-[13px] text-brand-body whitespace-nowrap">{t("pagination.show")}</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v) as PageSize)}
          >
            <SelectTrigger
              className="h-8 w-[68px] text-[13px]"
              aria-label="Courses per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[13px] text-brand-body">{t("pagination.perPage")}</span>
        </div>

        {/* ── Navigation — centre ── */}
        {totalPages > 1 && (
          <nav
            role="navigation"
            aria-label="Page navigation"
            className="flex items-center gap-1 order-1 sm:order-2"
          >
            {/* Previous */}
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className="w-8 h-8 flex items-center justify-center rounded-md border border-brand-border text-brand-body transition-colors hover:border-brand-blue hover:text-brand-blue disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <HiChevronLeft size={14} />
            </button>

            {/* Mobile: current / total */}
            <span className="sm:hidden text-[13px] font-semibold text-brand-dark px-3">
              {page} / {totalPages}
            </span>

            {/* Desktop: page number pills */}
            <div className="hidden sm:flex items-center gap-1">
              {pageRange.map((item, idx) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-[13px] text-brand-body select-none"
                    aria-hidden
                  >
                    &hellip;
                  </span>
                ) : (
                  <PageBtn
                    key={item}
                    page={item as number}
                    current={page}
                    onClick={onPageChange}
                  />
                )
              )}
            </div>

            {/* Next */}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="w-8 h-8 flex items-center justify-center rounded-md border border-brand-border text-brand-body transition-colors hover:border-brand-blue hover:text-brand-blue disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <HiChevronRight size={14} />
            </button>
          </nav>
        )}

        {/* Jump to page — right (desktop only) */}
        {totalPages > 1 && (
          <div className="hidden sm:flex items-center gap-2 order-3">
            <span className="text-[13px] text-brand-body whitespace-nowrap">{t("pagination.goTo")}</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={handleJumpKey}
              onBlur={handleJump}
              placeholder={String(page)}
              aria-label="Jump to page"
              className="w-14 h-8 rounded-md border border-brand-border px-2 text-[13px] text-brand-dark text-center focus:outline-none focus:border-brand-blue"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/*
 * ──────────────────────────────────────────────────────────────────────────────
 * INFINITE SCROLL — drop-in replacement for <Pagination />
 * Usage:
 *   1. Replace <Pagination /> with <InfiniteScrollTrigger />
 *   2. Replace `paged` with all `sorted` items (no slice)
 *   3. Expose a `loadMore` function from usePagination or manage separately
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * import { useEffect, useRef } from "react";
 *
 * interface InfiniteScrollProps {
 *   hasMore: boolean;
 *   loading: boolean;
 *   onLoadMore: () => void;
 * }
 *
 * export function InfiniteScrollTrigger({ hasMore, loading, onLoadMore }: InfiniteScrollProps) {
 *   const ref = useRef<HTMLDivElement>(null);
 *
 *   useEffect(() => {
 *     const el = ref.current;
 *     if (!el) return;
 *     const observer = new IntersectionObserver(
 *       ([entry]) => { if (entry.isIntersecting && hasMore && !loading) onLoadMore(); },
 *       { rootMargin: "200px" }
 *     );
 *     observer.observe(el);
 *     return () => observer.disconnect();
 *   }, [hasMore, loading, onLoadMore]);
 *
 *   return (
 *     <div ref={ref} className="py-8 text-center">
 *       {loading && <span className="text-[13px] text-brand-body">Loading more courses…</span>}
 *       {!hasMore && <span className="text-[13px] text-brand-body">You've seen all courses</span>}
 *     </div>
 *   );
 * }
 */
