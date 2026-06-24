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
import { useSearch } from "@/hooks/useSearch";
import { useFilter, DEFAULT_FILTERS } from "@/hooks/useFilter";
import { courses, type Course } from "@/lib/data";

// ── Filter logic ────────────────────────────────────────────────────────────────

function matchesDateFilter(createdAt: string, dateFilter: string): boolean {
  if (dateFilter === "all") return true;
  const date  = new Date(createdAt);
  const now   = new Date();
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
  priceType: "all" | "free" | "paid",
  dateFilter: "all" | "week" | "month" | "year"
): Course[] {
  return list.filter((c) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !c.name.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q) &&
        !c.instructor.toLowerCase().includes(q)
      ) return false;
    }
    if (categories.length > 0 && !categories.includes(c.category))  return false;
    if (difficulty && c.difficulty !== difficulty)                    return false;
    if (minRating > 0 && c.rating < minRating)                       return false;
    if (priceType === "free" && c.price !== 0)                       return false;
    if (priceType === "paid" && c.price === 0)                       return false;
    if (!matchesDateFilter(c.createdAt, dateFilter))                 return false;
    return true;
  });
}

// ── URL ↔ state helpers ─────────────────────────────────────────────────────────

function parseInitialFilters(params: URLSearchParams) {
  return {
    categories:  params.get("category")?.split(",").filter(Boolean) ?? [],
    difficulty:  params.get("level") ?? "",
    minRating:   Number(params.get("minRating") ?? 0),
    priceType:   (params.get("price") as "all" | "free" | "paid") ?? "all",
    dateFilter:  (params.get("date") as "all" | "week" | "month" | "year") ?? "all",
  };
}

// ── Component ───────────────────────────────────────────────────────────────────

export default function CoursesPageClient() {
  const params   = useSearchParams();
  const router   = useRouter();
  const isFirstRender = useRef(true);
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
  } = useFilter(parseInitialFilters(params));

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Hydration guard — show skeletons on first render
  useEffect(() => { setHydrated(true); }, []);

  // ── URL sync ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip on first render to avoid clobbering SSR URL
    if (isFirstRender.current) { isFirstRender.current = false; return; }

    const p = new URLSearchParams();
    if (query)                         p.set("q",         query);
    if (filters.categories.length > 0) p.set("category",  filters.categories.join(","));
    if (filters.difficulty)            p.set("level",      filters.difficulty);
    if (filters.minRating > 0)         p.set("minRating",  String(filters.minRating));
    if (filters.priceType !== "all")   p.set("price",      filters.priceType);
    if (filters.dateFilter !== "all")  p.set("date",       filters.dateFilter);

    const qs = p.toString();
    router.replace(qs ? `/courses?${qs}` : "/courses", { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters]);

  // ── Close mobile drawer on resize ────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setShowMobileFilters(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Filtered results ─────────────────────────────────────────────────────────
  const results = useMemo(
    () => applyFilters(
      courses,
      query,
      filters.categories,
      filters.difficulty,
      filters.minRating,
      filters.priceType,
      filters.dateFilter,
    ),
    [query, filters]
  );

  const handleClearAll = () => {
    clearFilters();
    clearSearch();
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
        {/* Mobile: filter toggle button */}
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <p className="text-[14px] text-brand-body">
            <span className="font-bold text-brand-dark">{results.length}</span> course{results.length !== 1 ? "s" : ""}
          </p>
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

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">

          {/* ── Desktop sidebar ────────────────────────────────────────────── */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onToggleCategory={toggleCategory}
              onSetDifficulty={setDifficulty}
              onSetMinRating={setMinRating}
              onSetPriceType={setPriceType}
              onSetDateFilter={setDateFilter}
              onClearAll={clearFilters}
              activeCount={activeCount}
            />
          </div>

          {/* ── Mobile drawer ──────────────────────────────────────────────── */}
          <div className="lg:hidden">
            <FilterSidebar
              filters={filters}
              onToggleCategory={toggleCategory}
              onSetDifficulty={setDifficulty}
              onSetMinRating={setMinRating}
              onSetPriceType={setPriceType}
              onSetDateFilter={setDateFilter}
              onClearAll={clearFilters}
              activeCount={activeCount}
              open={showMobileFilters}
              onClose={() => setShowMobileFilters(false)}
            />
          </div>

          {/* ── Course results ────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Filter chips + result summary */}
            <FilterChips
              filters={filters}
              onToggleCategory={toggleCategory}
              onSetDifficulty={setDifficulty}
              onSetMinRating={setMinRating}
              onSetPriceType={setPriceType}
              onSetDateFilter={setDateFilter}
              onClearAll={handleClearAll}
              resultCount={results.length}
              query={query}
            />

            {/* Loading skeletons (before hydration) */}
            {!hydrated && <CourseSkeletonGrid />}

            {/* Results grid */}
            {hydrated && results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {results.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {hydrated && results.length === 0 && (
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
          </div>
        </div>
      </div>
    </div>
  );
}
