"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiAdjustmentsHorizontal, HiBookOpen } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./SearchBar";
import { FilterSidebar } from "./FilterSidebar";
import { FilterChips } from "./FilterChips";
import { CourseCard } from "./CourseCard";
import { CourseSkeletonGrid } from "./CourseSkeleton";
import { SortDropdown } from "./SortDropdown";
import { Pagination } from "./Pagination";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { useSort, type SortKey } from "@/hooks/useSort";
import { usePagination, PAGE_SIZES, type PageSize } from "@/hooks/usePagination";
import { useCourses } from "@/hooks/api/useCourses";
import type { Course } from "@/types/api-response";

// ── Sort ───────────────────────────────────────────────────────────────────────

function sortCourses(list: Course[], sort: SortKey): Course[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case "newest":     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "popular":    return (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0);
      case "rating":     return (b.averageRating ?? 0) - (a.averageRating ?? 0);
      case "az":         return a.title.localeCompare(b.title);
      case "za":         return b.title.localeCompare(a.title);
      case "price-asc":  return a.title.localeCompare(b.title); // no price — fall back to az
      case "price-desc": return b.title.localeCompare(a.title);
    }
  });
}

// ── Filter logic ────────────────────────────────────────────────────────────────

function matchesDateFilter(createdAt: string, dateFilter: string): boolean {
  if (dateFilter === "all") return true;
  const date = new Date(createdAt);
  const now  = new Date();
  if (dateFilter === "year")  return date.getFullYear() === now.getFullYear();
  if (dateFilter === "month") {
    return date.getFullYear() === now.getFullYear() &&
           date.getMonth()    === now.getMonth();
  }
  if (dateFilter === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    return date >= weekAgo;
  }
  return true;
}

function applyFilters(
  list: Course[],
  query: string,
  categories: string[],
  difficulty: string,
  minRating: number,
  dateFilter: "all" | "week" | "month" | "year",
): Course[] {
  return list.filter((c) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !c.title.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q)
      ) return false;
    }
    if (categories.length > 0 && !categories.includes(c.category))  return false;
    if (difficulty && c.level !== difficulty)                        return false;
    if (minRating > 0 && (c.averageRating ?? 0) < minRating)        return false;
    if (!matchesDateFilter(c.createdAt, dateFilter))                 return false;
    return true;
  });
}

// ── URL param parsing ──────────────────────────────────────────────────────────

function parseInitialParams(params: URLSearchParams) {
  const sortParam     = params.get("sort") as SortKey | null;
  const pageSizeParam = Number(params.get("pageSize"));
  return {
    categories: params.get("category")?.split(",").filter(Boolean) ?? [],
    difficulty: params.get("level") ?? "",
    minRating:  Number(params.get("minRating") ?? 0),
    priceType:  (params.get("price") as "all" | "free" | "paid") ?? "all",
    dateFilter: (params.get("date") as "all" | "week" | "month" | "year") ?? "all",
    sort:       sortParam ?? undefined,
    page:       Math.max(1, Number(params.get("page") ?? 1)),
    pageSize:   (PAGE_SIZES.includes(pageSizeParam as PageSize) ? pageSizeParam : undefined) as PageSize | undefined,
  };
}

// ── Component ───────────────────────────────────────────────────────────────────

export default function CoursesPageClient() {
  const params = useSearchParams();
  const router = useRouter();

  const initialParams = useRef(parseInitialParams(params)).current;

  const isFirstRender = useRef(true);
  const didResetRef   = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  // ── State ────────────────────────────────────────────────────────────────────
  const { input, setInput, query, clear: clearSearch } = useSearch(params.get("q") ?? "");

  const {
    filters,
    toggleCategory,
    setDifficulty,
    setMinRating,
    setPriceType,
    setDateFilter,
    clearAll: clearFilters,
    activeCount,
  } = useFilter({
    categories: initialParams.categories,
    difficulty: initialParams.difficulty,
    minRating:  initialParams.minRating,
    priceType:  initialParams.priceType,
    dateFilter: initialParams.dateFilter,
  });

  const { sort, setSort } = useSort(initialParams.sort);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── Fetch all published courses (client-side filter/sort/paginate) ────────────
  const { courses, isLoading } = useCourses({ limit: 200 });

  // Derive the category list from the actual data
  const categories = useMemo(
    () => [...new Set(courses.map((c) => c.category))].sort(),
    [courses],
  );

  // ── Derived: filter → sort → paginate ────────────────────────────────────────
  const results = useMemo(
    () => applyFilters(courses, query, filters.categories, filters.difficulty, filters.minRating, filters.dateFilter),
    [courses, query, filters],
  );

  const sorted = useMemo(() => sortCourses(results, sort), [results, sort]);

  const pagination = usePagination(sorted.length, initialParams.page, initialParams.pageSize);

  const paged = useMemo(
    () => sorted.slice(pagination.startIndex, pagination.endIndex),
    [sorted, pagination.startIndex, pagination.endIndex],
  );

  // ── Reset page to 1 when search / filters / sort change ──────────────────────
  useEffect(() => {
    if (!didResetRef.current) { didResetRef.current = true; return; }
    pagination.goToPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters, sort]);

  // ── Hydration guard ──────────────────────────────────────────────────────────
  useEffect(() => { setHydrated(true); }, []);

  // ── URL sync ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }

    const p = new URLSearchParams();
    if (query)                          p.set("q",        query);
    if (filters.categories.length > 0) p.set("category", filters.categories.join(","));
    if (filters.difficulty)             p.set("level",    filters.difficulty);
    if (filters.minRating > 0)          p.set("minRating",String(filters.minRating));
    if (filters.dateFilter !== "all")   p.set("date",     filters.dateFilter);
    if (sort !== "newest")              p.set("sort",     sort);
    if (pagination.page > 1)            p.set("page",     String(pagination.page));
    if (pagination.pageSize !== 12)     p.set("pageSize", String(pagination.pageSize));

    const qs = p.toString();
    router.replace(qs ? `/courses?${qs}` : "/courses", { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters, sort, pagination.page, pagination.pageSize]);

  // ── Close mobile drawer on resize ────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setShowMobileFilters(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleClearAll = () => { clearFilters(); clearSearch(); };

  const handlePageChange = (p: number) => {
    pagination.goToPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filterSidebarProps = {
    filters,
    categories,
    onToggleCategory: toggleCategory,
    onSetDifficulty:  setDifficulty,
    onSetMinRating:   setMinRating,
    onSetDateFilter:  setDateFilter,
    onClearAll:       clearFilters,
    activeCount,
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-[28px] font-bold text-brand-dark mb-1">Browse Courses</h1>
          <p className="text-[15px] text-brand-body mb-6">
            Discover courses across technology, design, business, and more.
          </p>
          <SearchBar value={input} onChange={setInput} onClear={clearSearch} />
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Mobile: filter toggle */}
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <p className="text-[14px] text-brand-body">
            <span className="font-bold text-brand-dark">{sorted.length}</span>{" "}
            course{sorted.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <SortDropdown value={sort} onChange={setSort} />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2"
            >
              <HiAdjustmentsHorizontal size={16} />
              Filters
              {activeCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-brand-blue text-white text-[11px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">

          {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
          <div className="hidden lg:block">
            <FilterSidebar {...filterSidebarProps} />
          </div>

          {/* ── Mobile drawer ────────────────────────────────────────────────── */}
          <div className="lg:hidden">
            <FilterSidebar
              {...filterSidebarProps}
              open={showMobileFilters}
              onClose={() => setShowMobileFilters(false)}
            />
          </div>

          {/* ── Course results ────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Filter chips + sort dropdown (desktop) */}
            <FilterChips
              filters={filters}
              onToggleCategory={toggleCategory}
              onSetDifficulty={setDifficulty}
              onSetMinRating={setMinRating}
              onSetPriceType={setPriceType}
              onSetDateFilter={setDateFilter}
              onClearAll={handleClearAll}
              resultCount={sorted.length}
              query={query}
              rightSlot={
                <span className="hidden lg:block">
                  <SortDropdown value={sort} onChange={setSort} />
                </span>
              }
            />

            {/* Loading skeletons */}
            {(!hydrated || isLoading) && <CourseSkeletonGrid />}

            {/* Results grid */}
            {hydrated && !isLoading && paged.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paged.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {hydrated && !isLoading && sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-blue/8 flex items-center justify-center">
                  <HiBookOpen size={32} className="text-brand-blue/60" />
                </div>
                <div>
                  <p className="text-[18px] font-bold text-brand-dark">No courses found</p>
                  <p className="text-[14px] text-brand-body mt-1.5 max-w-xs">
                    {query
                      ? `No results for "${query}". Try different keywords or clear your filters.`
                      : "No courses match the selected filters. Try adjusting or clearing them."}
                  </p>
                </div>
                <Button variant="outline" onClick={handleClearAll}>
                  Clear search &amp; filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {hydrated && !isLoading && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                rangeStart={pagination.rangeStart}
                rangeEnd={pagination.rangeEnd}
                totalItems={pagination.totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={pagination.setPageSize}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
