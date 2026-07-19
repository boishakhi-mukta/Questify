"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Teacher Homepage
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Landing page dashboard for teachers.
 * 
 * WHY IT EXISTS:
 * Greets teachers, highlighting items requiring grading.
 * 
 * HOW IT WORKS (Technical Overview):
 * Binds page inputs to TeacherDashboard components.
 * ============================================================================
 */

import { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  Chip,
  Skeleton,
  ProgressBar,
  ProgressBarTrack,
  ProgressBarFill,
} from "@heroui/react";
import {
  HiBookOpen,
  HiUserGroup,
  HiStar,
  HiChatBubbleLeft,
  HiArrowTopRightOnSquare,
  HiExclamationTriangle,
  HiArrowPath,
  HiClock,
  HiAcademicCap,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/api/useCourses";
import type { Course } from "@/types/api-response";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// A thin horizontal separator line.
function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-brand-border", className)} />;
}

// Today's date, formatted for the welcome banner (e.g. "Friday, June 12, 2026").
function today(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
    year:    "numeric",
  });
}

const LEVEL_GRADIENT: Record<string, string> = {
  BACHELOR: "from-brand-blue to-blue-700",
  MASTERS:  "from-violet-500 to-purple-700",
};

const LEVEL_CHIP_COLOR: Record<string, "success" | "default" | "warning"> = {
  BACHELOR: "default",
  MASTERS:  "warning",
};

// ─── Stat card ────────────────────────────────────────────────────────────────

// One top-row summary tile (e.g. "Total Students: 214").
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  loading,
}: {
  label:   string;
  value:   string | number;
  sub:     string;
  icon:    React.ElementType;
  accent:  string;
  loading: boolean;
}) {
  return (
    <Card className="bg-white overflow-hidden">
      <div className={cn("h-1.5", accent)} />
      <CardContent className="pt-4 pb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-brand-body uppercase tracking-wide">
            {label}
          </p>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-opacity-10", accent.replace("bg-gradient-to-r", "bg").split(" ")[0] + "/10")}>
            <Icon size={16} className="text-brand-blue" />
          </div>
        </div>
        {loading ? (
          <>
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-3 w-28 rounded-lg" />
          </>
        ) : (
          <>
            <p className="text-3xl font-black text-brand-dark leading-none">{value}</p>
            <p className="text-xs text-brand-body">{sub}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Course card ──────────────────────────────────────────────────────────────

// One "course I teach" card with a capacity bar, rating, and Manage/Preview buttons.
function CourseCard({ course }: { course: Course }) {
  const gradient = LEVEL_GRADIENT[course.level] ?? LEVEL_GRADIENT.INTERMEDIATE;
  const chipColor = LEVEL_CHIP_COLOR[course.level] ?? "default";

  const fillPercent = course.maxCapacity > 0
    ? Math.round((course.enrollmentCount / course.maxCapacity) * 100)
    : 0;

  return (
    <Card className="bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Banner */}
      <div className={cn("h-20 bg-gradient-to-br flex items-end px-4 pb-3", gradient)}>
        <div className="flex items-center gap-2 flex-wrap">
          <Chip
            size="sm"
            color={chipColor}
            variant="soft"
            className="text-[10px] bg-white/20 text-white border-white/30"
          >
            {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
          </Chip>
          {course.semester && (
            <Chip
              size="sm"
              className="text-[10px] bg-white/20 text-white border-white/30"
            >
              {course.semester}
            </Chip>
          )}
        </div>
      </div>

      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-body">{course.category}</p>
            <p className="text-base font-bold text-brand-dark leading-snug mt-0.5 line-clamp-2">
              {course.title}
            </p>
          </div>
          <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
            <HiStar size={13} />
            <span className="text-xs font-semibold text-brand-dark">
              {course.averageRating.toFixed(1)}
            </span>
          </div>
        </div>
      </CardHeader>

      <Divider className="mx-4" />

      <CardContent className="flex flex-col gap-4 pt-3 flex-1">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-brand-body">Students</p>
            <p className="font-bold text-brand-dark mt-0.5">
              {course.enrollmentCount}
              <span className="font-normal text-brand-body">
                /{course.maxCapacity}
              </span>
            </p>
          </div>
          <div>
            <p className="text-brand-body">Credits</p>
            <p className="font-bold text-brand-dark mt-0.5">{course.credits} ECTS</p>
          </div>
          <div>
            <p className="text-brand-body">Hours</p>
            <p className="font-bold text-brand-dark mt-0.5">{course.estimatedHours}h</p>
          </div>
        </div>

        {/* Capacity bar */}
        <div>
          <div className="flex justify-between text-[10px] text-brand-body mb-1.5">
            <span>Capacity</span>
            <span className="font-semibold text-brand-dark">{fillPercent}% full</span>
          </div>
          <ProgressBar
            value={fillPercent}
            minValue={0}
            maxValue={100}
            aria-label={`${course.title} capacity`}
          >
            <ProgressBarTrack className="h-1.5 rounded-full bg-brand-bg">
              <ProgressBarFill
                className={cn(
                  "h-full rounded-full transition-[width]",
                  fillPercent >= 90
                    ? "bg-red-400"
                    : fillPercent >= 70
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                )}
              />
            </ProgressBarTrack>
          </ProgressBar>
        </div>

        {/* Timestamps */}
        <div className="flex items-center gap-1 text-[10px] text-brand-body">
          <HiClock size={11} />
          <span>
            Created {new Date(course.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day:   "numeric",
              year:  "numeric",
            })}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <Button asChild size="sm" className="flex-1 text-xs">
            <Link href={`/courses/${course._id}`}>
              Manage
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="flex-1 text-xs gap-1"
          >
            <Link href={`/courses/${course._id}`} target="_blank">
              <HiArrowTopRightOnSquare size={12} />
              Preview
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton grid ────────────────────────────────────────────────────────────

// A grid of grey placeholder cards shown while the teacher's courses are still loading.
function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="bg-white overflow-hidden">
          <Skeleton className="h-20 w-full rounded-none" />
          <CardContent className="flex flex-col gap-3 pt-4">
            <Skeleton className="h-4 w-16 rounded-lg" />
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-8 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
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

// ─── Main page ────────────────────────────────────────────────────────────────

// The teacher's landing dashboard: welcome banner, stat tiles, a grid of the
// courses they teach, and quick-action shortcut links.
export default function TeacherDashboardPage() {
  const { user } = useAuthContext();

  // Fetch all published courses — filter client-side by teacher ID
  const { courses, isLoading, error, refetch } = useCourses({ limit: 200 });

  // Filter to only this teacher's courses
  const myCourses = useMemo<Course[]>(() => {
    if (!user) return [];
    return courses.filter((c) =>
      c.teachers.some((t) =>
        typeof t === "string" ? t === user._id : t._id === user._id
      )
    );
  }, [courses, user]);

  // Derived stats
  const totalStudents  = myCourses.reduce((s, c) => s + c.enrollmentCount, 0);
  const avgRating      = myCourses.length
    ? myCourses.reduce((s, c) => s + c.averageRating, 0) / myCourses.length
    : 0;
  const totalReviews   = myCourses.reduce((s, c) => s + c.totalReviews, 0);

  const stats = [
    {
      label:  "Total Students",
      value:  totalStudents,
      sub:    "Across all my courses",
      icon:   HiUserGroup,
      accent: "bg-gradient-to-r from-brand-blue to-blue-400",
    },
    {
      label:  "Courses Teaching",
      value:  myCourses.length,
      sub:    "Active & published",
      icon:   HiBookOpen,
      accent: "bg-gradient-to-r from-emerald-500 to-teal-500",
    },
    {
      label:  "Avg Rating",
      value:  myCourses.length ? `${avgRating.toFixed(1)} ★` : "—",
      sub:    `From ${totalReviews} student reviews`,
      icon:   HiStar,
      accent: "bg-gradient-to-r from-amber-400 to-orange-400",
    },
    {
      label:  "Total Reviews",
      value:  totalReviews,
      sub:    "Student feedback received",
      icon:   HiChatBubbleLeft,
      accent: "bg-gradient-to-r from-violet-500 to-purple-500",
    },
  ];

  return (
    <div className="flex flex-col gap-8">

      {/* ── Welcome header ── */}
      <Card className="bg-white overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-brand-blue via-violet-500 to-emerald-500" />
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center shrink-0">
              <HiAcademicCap size={28} className="text-brand-blue" />
            </div>
            <div>
              <p className="text-xl font-bold text-brand-dark">
                Welcome back,{" "}
                {user
                  ? `Prof. ${user.firstName} ${user.lastName}`
                  : "Professor"}
                ! 👋
              </p>
              <p className="text-sm text-brand-body mt-0.5">{today()}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild variant="secondary" size="sm">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Error banner ── */}
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

      {/* ── Stats grid ── */}
      <section>
        <h2 className="text-sm font-bold text-brand-body uppercase tracking-wide mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} loading={isLoading} />
          ))}
        </div>
      </section>

      {/* ── My Courses ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-brand-dark">My Courses</h2>
          {!isLoading && (
            <span className="text-sm text-brand-body">
              <span className="font-semibold text-brand-dark">{myCourses.length}</span>{" "}
              {myCourses.length === 1 ? "course" : "courses"}
            </span>
          )}
        </div>

        {isLoading ? (
          <CourseGridSkeleton />
        ) : myCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center rounded-xl border border-dashed border-brand-border">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
              <HiBookOpen size={28} className="text-brand-blue" />
            </div>
            <div>
              <p className="text-base font-bold text-brand-dark">No courses assigned yet</p>
              <p className="text-sm text-brand-body mt-1 max-w-xs">
                You haven&apos;t been assigned to any courses. Contact your administrator.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* ── Quick links footer ── */}
      {!isLoading && myCourses.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-brand-body uppercase tracking-wide mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Browse All Courses",
                sub:   "Explore the full course catalogue",
                href:  "/courses",
                icon:  HiBookOpen,
              },
              {
                label: "View Leaderboard",
                sub:   "See top-performing students",
                href:  "/student/leaderboard",
                icon:  HiStar,
              },
              {
                label: "Student Directory",
                sub:   "Find and contact students",
                href:  "/admin/users",
                icon:  HiUserGroup,
              },
            ].map(({ label, sub, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-brand-border bg-white px-4 py-3.5 hover:border-brand-blue hover:bg-brand-blue-light transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center shrink-0 group-hover:bg-brand-blue/10 transition-colors">
                  <Icon size={18} className="text-brand-body group-hover:text-brand-blue transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-dark">{label}</p>
                  <p className="text-xs text-brand-body truncate">{sub}</p>
                </div>
                <HiArrowTopRightOnSquare
                  size={14}
                  className="text-brand-body/40 group-hover:text-brand-blue ml-auto shrink-0 transition-colors"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
