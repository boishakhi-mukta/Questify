"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: CoursesPageClient
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The coordinator for search, sort, filter, and pagination panels on the courses page.
 * 
 * WHY IT EXISTS:
 * Handles the logic required to browse, search, and manage course lists.
 * 
 * HOW IT WORKS (Technical Overview):
 * Gathers filter, sorting, and search inputs, fetches courses, and manages results.
 * ============================================================================
 */

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
import { useTranslation } from "react-i18next";

// ── Sort ───────────────────────────────────────────────────────────────────────

// Reorders a list of courses according to the chosen sort option (newest,
// most popular, alphabetical, credits, etc.).
function sortCourses(list: Course[], sort: SortKey): Course[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case "newest":       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "popular":      return (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0);
      case "az":           return a.title.localeCompare(b.title);
      case "za":           return b.title.localeCompare(a.title);
      case "credits-desc": return (b.credits ?? 0) - (a.credits ?? 0);
      case "credits-asc":  return (a.credits ?? 0) - (b.credits ?? 0);
    }
  });
}

// ── Filter logic ────────────────────────────────────────────────────────────────

// Narrows a list of courses down to just the ones matching the current
// search text, chosen departments, level, and semester.
function applyFilters(
  list: Course[],
  query: string,
  categories: string[],
  difficulty: string,
  semester: string,
): Course[] {
  return list.filter((c) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !c.title.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q)
      ) return false;
    }
    if (categories.length > 0 && !categories.includes(c.category)) return false;
    if (difficulty && c.level !== difficulty)                        return false;
    if (semester   && c.semester !== semester)                       return false;
    return true;
  });
}

// ── URL param parsing ──────────────────────────────────────────────────────────

// Reads the current filters/search/sort/page straight out of the page's URL
// (e.g. "?level=BACHELOR&page=2"), so a shared or bookmarked link shows the
// exact same view the person who copied it was looking at.
function parseInitialParams(params: URLSearchParams) {
  const sortParam     = params.get("sort") as SortKey | null;
  const pageSizeParam = Number(params.get("pageSize"));
  return {
    categories: params.get("category")?.split(",").filter(Boolean) ?? [],
    difficulty: params.get("level") ?? "",
    semester:   params.get("semester") ?? "",
    sort:       sortParam ?? undefined,
    page:       Math.max(1, Number(params.get("page") ?? 1)),
    pageSize:   (PAGE_SIZES.includes(pageSizeParam as PageSize) ? pageSizeParam : undefined) as PageSize | undefined,
  };
}

// ── Component ───────────────────────────────────────────────────────────────────

// The whole "Browse Courses" page: search box, filter sidebar, sort dropdown,
// the resulting grid of course cards, and pagination — all wired together,
// and kept in sync with the page's URL so views can be shared/bookmarked.
// `basePath` lets this same component power both the public /courses page
// and an in-dashboard catalog (e.g. /student/browse) without either one's
// URL sync or course links leaking into the other section of the site.
export default function CoursesPageClient({ basePath = "/courses" }: { basePath?: string }) {
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
    setSemester,
    clearAll: clearFilters,
    activeCount,
  } = useFilter({
    categories: initialParams.categories,
    difficulty: initialParams.difficulty,
    semester:   initialParams.semester,
  });

  const { sort, setSort } = useSort(initialParams.sort);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── Fetch all published courses (client-side filter/sort/paginate) ────────────
  const { courses, isLoading } = useCourses({ limit: 200 });

  const categories = useMemo(
    () => [...new Set(courses.map((c) => c.category))].sort(),
    [courses],
  );

  // ── Derived: filter → sort → paginate ────────────────────────────────────────
  const results = useMemo(
    () => applyFilters(courses, query, filters.categories, filters.difficulty, filters.semester),
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
    if (filters.semester)               p.set("semester", filters.semester);
    if (sort !== "newest")              p.set("sort",     sort);
    if (pagination.page > 1)            p.set("page",     String(pagination.page));
    if (pagination.pageSize !== 9)      p.set("pageSize", String(pagination.pageSize));

    const qs = p.toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters, sort, pagination.page, pagination.pageSize, basePath]);

  // ── Close mobile drawer on resize ────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setShowMobileFilters(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { t } = useTranslation();

  // Resets both the filters and the search box at once.
  const handleClearAll = () => { clearFilters(); clearSearch(); };

  // Switches to a different results page and scrolls back to the top.
  const handlePageChange = (p: number) => {
    pagination.goToPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filterSidebarProps = {
    filters,
    categories,
    onToggleCategory: toggleCategory,
    onSetDifficulty:  setDifficulty,
    onSetSemester:    setSemester,
    onClearAll:       clearFilters,
    activeCount,
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div
        className="border-b border-brand-border/50"
        style={{ background: "linear-gradient(180deg, #b7d3c5 0%, #c4dcd0 22%, #d4ede3 52%, #eef8f4 78%, #F2FAF7 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-[90px] pb-8">
          <h1 className="text-[28px] font-bold text-brand-dark mb-1">{t("coursesPage.title")}</h1>
          <p className="text-[16px] text-brand-body mb-6">
            {t("coursesPage.subtitle")}
          </p>
          <SearchBar value={input} onChange={setInput} onClear={clearSearch} />
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Mobile: filter toggle */}
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <p className="text-[15px] text-brand-body">
            {t("coursesPage.courseCount", { count: sorted.length })}
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
              {t("coursesPage.filters")}
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

            <FilterChips
              filters={filters}
              onToggleCategory={toggleCategory}
              onSetDifficulty={setDifficulty}
              onSetSemester={setSemester}
              onClearAll={handleClearAll}
              resultCount={sorted.length}
              query={query}
              rightSlot={
                <span className="hidden lg:block">
                  <SortDropdown value={sort} onChange={setSort} />
                </span>
              }
            />

            {(!hydrated || isLoading) && <CourseSkeletonGrid />}

            {hydrated && !isLoading && paged.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paged.map((course) => (
                  <CourseCard key={course._id} course={course} hrefBase={basePath} />
                ))}
              </div>
            )}

            {hydrated && !isLoading && sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-blue/8 flex items-center justify-center">
                  <HiBookOpen size={32} className="text-brand-blue/60" />
                </div>
                <div>
                  <p className="text-[19px] font-bold text-brand-dark">{t("coursesPage.noCoursesFound")}</p>
                  <p className="text-[15px] text-brand-body mt-1.5 max-w-xs">
                    {query
                      ? t("coursesPage.noResultsFor", { query })
                      : t("coursesPage.noMatchFilters")}
                  </p>
                </div>
                <Button variant="outline" onClick={handleClearAll}>
                  {t("coursesPage.clearFilters")}
                </Button>
              </div>
            )}

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
