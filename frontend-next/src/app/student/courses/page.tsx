"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Student Active Courses
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Displays courses the logged-in student is currently enrolled in.
 * 
 * WHY IT EXISTS:
 * Quick access dashboard for student active courses.
 * 
 * HOW IT WORKS (Technical Overview):
 * Queries current enrollments endpoints, loading layouts grids.
 * ============================================================================
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  ProgressBar,
  ProgressBarTrack,
  ProgressBarFill,
  Chip,
  Skeleton,
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopover,
  ListBox,
  ListBoxItem,
} from "@heroui/react";
import {
  HiBookOpen,
  HiChevronLeft,
  HiChevronRight,
  HiAdjustmentsHorizontal,
  HiExclamationTriangle,
  HiArrowPath,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useMyEnrollments } from "@/hooks/api/useMyEnrollments";
import { useEnrollCourse } from "@/hooks/api/useEnrollCourse";
import type { EnrollmentWithCourse } from "@/types/api-response";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 9;

type SortKey  = "progress" | "xp" | "name" | "date";
type FilterSemester = string; // "all" | specific semester string

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "progress",  label: "By Progress" },
  { id: "xp",       label: "By XP Earned" },
  { id: "name",     label: "By Name" },
  { id: "date",     label: "By Enrollment Date" },
];

// Level → gradient colour
const LEVEL_GRADIENT: Record<string, string> = {
  BACHELOR: "from-brand-blue to-blue-700",
  MASTERS:  "from-violet-500 to-purple-700",
};

const LEVEL_CHIP_COLOR: Record<string, "success" | "default" | "warning"> = {
  BACHELOR: "default",
  MASTERS:  "warning",
};

// ─── CourseCard ───────────────────────────────────────────────────────────────

// One enrolled-course card with progress, XP, instructor, and "View
// Course"/"Unenroll" action buttons.
function CourseCard({
  enrollment,
  onUnenroll,
}: {
  enrollment: EnrollmentWithCourse;
  onUnenroll: (e: EnrollmentWithCourse) => void;
}) {
  const router  = useRouter();
  const course  = enrollment.courseId;
  const progress = enrollment.progressPercentage ?? 0;
  const xp       = enrollment.totalXpEarned ?? 0;
  const gradient = LEVEL_GRADIENT[course.level] ?? "from-brand-blue to-blue-700";

  const teacherName = (() => {
    const t = course.teachers[0];
    if (!t) return "—";
    if (typeof t === "string") return t;
    return `${t.firstName} ${t.lastName}`;
  })();

  return (
    <Card className="bg-white overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
      {/* Coloured header band (course image placeholder) */}
      <div className={cn("h-28 bg-gradient-to-br flex items-end p-4", gradient)}>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-white/70">
            {course.category}
          </p>
          <p className="text-[15px] font-bold text-white leading-snug line-clamp-2 mt-0.5">
            {course.title}
          </p>
        </div>
      </div>

      <CardHeader className="pb-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Chip
            size="sm"
            color={LEVEL_CHIP_COLOR[course.level] ?? "default"}
            variant="soft"
            className="text-xs"
          >
            {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
          </Chip>
          {course.semester && (
            <Chip size="sm" className="text-xs bg-brand-bg text-brand-body border-none">
              {course.semester}
            </Chip>
          )}
          <Chip size="sm" className="text-xs bg-brand-bg text-brand-body border-none">
            {course.credits} ECTS
          </Chip>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-brand-body mb-1.5">
            <span>Progress</span>
            <span className="font-semibold text-brand-dark">{progress}%</span>
          </div>
          <ProgressBar
            value={progress}
            minValue={0}
            maxValue={100}
            aria-label={`${course.title} progress`}
          >
            <ProgressBarTrack className="h-1.5 rounded-full bg-brand-bg">
              <ProgressBarFill className="rounded-full bg-brand-blue h-full transition-[width]" />
            </ProgressBarTrack>
          </ProgressBar>
        </div>

        {/* XP */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-brand-body">XP Earned</p>
            <p className="text-[17px] font-bold text-brand-dark">{xp} XP</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-brand-body">Enrolled</p>
            <p className="text-[13px] font-semibold text-brand-dark">
              {new Date(enrollment.enrolledAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Faculty */}
        <div>
          <p className="text-[13px] text-brand-body">Instructor</p>
          <p className="text-[15px] font-semibold text-brand-dark truncate">{teacherName}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Button
            className="flex-1 text-sm"
            size="sm"
            onClick={() => router.push(`/courses/${course._id}`)}
          >
            View Course
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
            onClick={() => onUnenroll(enrollment)}
          >
            Unenroll
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton grid ────────────────────────────────────────────────────────────

// A grid of grey placeholder cards shown while the enrolled courses are still loading.
function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="bg-white overflow-hidden">
          <Skeleton className="h-28 w-full rounded-none" />
          <CardContent className="flex flex-col gap-4 pt-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-28 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 flex-1 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Filter Select ────────────────────────────────────────────────────────────

// A labeled dropdown used for the semester/sort filters on this page.
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label:    string;
  value:    string;
  onChange: (v: string) => void;
  options:  { id: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[160px]">
      <label className="text-xs font-semibold text-brand-body uppercase tracking-wide">
        {label}
      </label>
      <Select
        selectedKey={value}
        onSelectionChange={(key) => onChange(key as string)}
      >
        <SelectTrigger className="h-9 rounded-md border border-brand-border bg-white px-3 text-sm text-brand-dark flex items-center justify-between gap-2 hover:border-brand-blue transition-colors focus:outline-none">
          <SelectValue className="flex-1 text-left" />
        </SelectTrigger>
        <SelectPopover className="z-50 min-w-[160px] rounded-md border border-brand-border bg-white shadow-md p-1">
          <ListBox className="outline-none">
            {options.map((opt) => (
              <ListBoxItem
                key={opt.id}
                id={opt.id}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-sm cursor-pointer outline-none transition-colors",
                  "text-brand-dark hover:bg-brand-bg focus:bg-brand-bg",
                  "selected:font-semibold selected:text-brand-blue"
                )}
              >
                {opt.label}
              </ListBoxItem>
            ))}
          </ListBox>
        </SelectPopover>
      </Select>
    </div>
  );
}

// ─── Pagination strip ─────────────────────────────────────────────────────────

// Previous/Next + numbered page buttons for the "My Courses" grid.
function PaginationStrip({
  page,
  total,
  onPage,
}: {
  page:   number;
  total:  number;
  onPage: (p: number) => void;
}) {
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="gap-1.5"
      >
        <HiChevronLeft size={14} />
        Prev
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={cn(
              "w-8 h-8 rounded-md text-sm font-medium transition-colors",
              p === page
                ? "bg-brand-blue text-white"
                : "text-brand-dark hover:bg-brand-bg"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <Button
        variant="secondary"
        size="sm"
        disabled={page >= total}
        onClick={() => onPage(page + 1)}
        className="gap-1.5"
      >
        Next
        <HiChevronRight size={14} />
      </Button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

// Shown instead of the course grid when the student has no enrolled courses
// (or none match the current filters), with a prompt to browse the catalogue.
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
        <HiBookOpen size={32} className="text-brand-blue" />
      </div>
      <div>
        <p className="text-[21px] font-bold text-brand-dark">
          {filtered ? "No courses match your filters" : "No courses yet"}
        </p>
        <p className="text-[15px] text-brand-body mt-1.5 max-w-xs">
          {filtered
            ? "Try adjusting the semester or sort filters above."
            : "You haven't enrolled in any courses yet. Explore the catalogue to get started."}
        </p>
      </div>
      {!filtered && (
        <Button asChild size="sm">
          <Link href="/student/browse">Explore Courses</Link>
        </Button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// The "My Courses" page: a filterable, sortable, paginated grid of the
// student's enrolled courses, with an unenroll confirmation dialog.
export default function MyCoursesPage() {
  const { enrollments, isLoading, error, refetch } = useMyEnrollments();
  const { unenroll, isLoading: isUnenrolling }      = useEnrollCourse(refetch);

  // Filter / sort / page state
  const [semester, setSemester] = useState<FilterSemester>("all");
  const [sort,     setSort]     = useState<SortKey>("progress");
  const [page,     setPage]     = useState(1);

  // Unenroll confirmation
  const [unenrollTarget, setUnenrollTarget] = useState<EnrollmentWithCourse | null>(null);
  const [unenrollError,  setUnenrollError]  = useState<string | null>(null);

  // ── Derived data ──────────────────────────────────────────────────────────
  const semesters = useMemo<{ id: string; label: string }[]>(() => {
    const unique = [...new Set(
      enrollments
        .map((e) => e.courseId.semester)
        .filter((s): s is string => !!s)
    )].sort();
    return [
      { id: "all", label: "All Semesters" },
      ...unique.map((s) => ({ id: s, label: s })),
    ];
  }, [enrollments]);

  const sortOptions: { id: SortKey; label: string }[] = SORT_OPTIONS;

  const filtered = useMemo(() => {
    let list = enrollments.filter((e) => e.status === "ACTIVE" || e.status === "COMPLETED");

    if (semester !== "all") {
      list = list.filter((e) => e.courseId.semester === semester);
    }

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "progress":
          return (b.progressPercentage ?? 0) - (a.progressPercentage ?? 0);
        case "xp":
          return (b.totalXpEarned ?? 0) - (a.totalXpEarned ?? 0);
        case "name":
          return a.courseId.title.localeCompare(b.courseId.title);
        case "date":
          return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
      }
    });

    return sorted;
  }, [enrollments, semester, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  const handleSemester = (v: string) => { setSemester(v); setPage(1); };
  const handleSort     = (v: string) => { setSort(v as SortKey); setPage(1); };

  // ── Unenroll handlers ─────────────────────────────────────────────────────
  // Actually unenrolls the student from the course they confirmed leaving.
  async function confirmUnenroll() {
    if (!unenrollTarget) return;
    setUnenrollError(null);
    try {
      await unenroll(unenrollTarget._id);
      setUnenrollTarget(null);
    } catch (err) {
      setUnenrollError(err instanceof Error ? err.message : "Failed to unenroll");
    }
  }

  // ── Counts ────────────────────────────────────────────────────────────────
  const activeCount    = enrollments.filter((e) => e.status === "ACTIVE").length;
  const completedCount = enrollments.filter((e) => e.status === "COMPLETED").length;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">My Courses</h1>
          <p className="text-[15px] text-brand-body mt-1">
            {isLoading ? (
              <Skeleton className="h-4 w-40 rounded-lg inline-block" />
            ) : (
              <>
                <span className="font-semibold text-brand-dark">{activeCount}</span> active
                {completedCount > 0 && (
                  <> · <span className="font-semibold text-brand-dark">{completedCount}</span> completed</>
                )}
              </>
            )}
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/student/browse">Explore Catalogue</Link>
        </Button>
      </div>

      {/* ── API error ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <HiExclamationTriangle size={16} className="shrink-0" />
          <span className="flex-1">Failed to load courses: {error}</span>
          <button
            onClick={refetch}
            className="flex items-center gap-1 font-semibold shrink-0 hover:text-red-900 transition-colors"
          >
            <HiArrowPath size={14} />
            Retry
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      {!isLoading && enrollments.length > 0 && (
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-brand-body">
            <HiAdjustmentsHorizontal size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
          </div>
          <FilterSelect
            label="Semester"
            value={semester}
            onChange={handleSemester}
            options={semesters}
          />
          <FilterSelect
            label="Sort By"
            value={sort}
            onChange={handleSort}
            options={sortOptions}
          />
          {(semester !== "all") && (
            <button
              onClick={() => { setSemester("all"); setSort("progress"); setPage(1); }}
              className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark mt-5 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <CourseGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState filtered={semester !== "all"} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paged.map((enrollment) => (
              <CourseCard
                key={enrollment._id}
                enrollment={enrollment}
                onUnenroll={setUnenrollTarget}
              />
            ))}
          </div>

          {/* Pagination */}
          <PaginationStrip
            page={page}
            total={totalPages}
            onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />

          {/* Result count */}
          <p className="text-center text-[13px] text-brand-body">
            Showing{" "}
            <span className="font-semibold text-brand-dark">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-brand-dark">{filtered.length}</span>{" "}
            courses
          </p>
        </>
      )}

      {/* ── Unenroll confirmation dialog ── */}
      <Dialog
        open={!!unenrollTarget}
        onOpenChange={(open) => {
          if (!open) { setUnenrollTarget(null); setUnenrollError(null); }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Unenroll from Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to unenroll from{" "}
              <span className="font-semibold text-brand-dark">
                {unenrollTarget?.courseId.title}
              </span>
              ? Your progress and XP earned will be lost.
            </DialogDescription>
          </DialogHeader>

          {unenrollError && (
            <p className="text-[15px] text-red-600 -mt-2">{unenrollError}</p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={isUnenrolling}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmUnenroll}
              disabled={isUnenrolling}
            >
              {isUnenrolling ? "Unenrolling…" : "Unenroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
