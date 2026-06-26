"use client";

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
} from "@heroui/react";
import {
  HiBookOpen,
  HiTrophy,
  HiStar,
  HiArrowPath,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMyEnrollments } from "@/hooks/api/useMyEnrollments";
import { useLeaderboard } from "@/hooks/api/useLeaderboard";
import type { EnrollmentWithCourse, LeaderboardEntry } from "@/types/api-response";
import { cn } from "@/lib/utils";

// ─── WelcomeHeader ────────────────────────────────────────────────────────────

function WelcomeHeader({ name }: { name: string }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">
          Welcome back, {name}! 👋
        </h1>
        <p className="text-sm text-brand-body mt-1">{today}</p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href="/courses">Browse Courses</Link>
      </Button>
    </div>
  );
}

// ─── StatsCards ───────────────────────────────────────────────────────────────

interface StatItem {
  label:   string;
  value:   string | number;
  sub:     string;
  icon:    string;
  accent?: boolean;
}

function StatsCards({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map(({ label, value, sub, icon, accent }) => (
        <Card key={label} className="bg-white">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-brand-body">{label}</p>
                <p className="text-2xl font-bold text-brand-dark mt-0.5">{value}</p>
                <p className={cn("text-xs mt-1", accent ? "text-emerald-600 font-medium" : "text-brand-body")}>
                  {sub}
                </p>
              </div>
              <span className="text-3xl select-none shrink-0">{icon}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── DashboardSkeleton ────────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-60 rounded-lg" />
        <Skeleton className="h-4 w-44 rounded-lg" />
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white">
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-3 w-24 rounded-lg" />
                  <Skeleton className="h-7 w-16 rounded-lg" />
                  <Skeleton className="h-2.5 w-20 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* course cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white">
            <CardContent>
              <div className="flex flex-col gap-3">
                <Skeleton className="h-3 w-20 rounded-lg" />
                <Skeleton className="h-5 w-4/5 rounded-lg" />
                <Skeleton className="h-1.5 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16 rounded-lg" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── MyCourses ────────────────────────────────────────────────────────────────

function CourseCard({ enrollment }: { enrollment: EnrollmentWithCourse }) {
  const course = enrollment.courseId;
  const progress = enrollment.progressPercentage ?? 0;
  const xp = enrollment.totalXpEarned ?? 0;

  return (
    <Card className="bg-white transition-shadow hover:shadow-md">
      <CardHeader>
        <div>
          <p className="text-xs font-medium text-brand-body">{course.category}</p>
          <p className="text-sm font-bold text-brand-dark leading-snug mt-0.5 line-clamp-2">
            {course.title}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {/* Progress bar */}
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

        {/* XP + credits */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-body">XP Earned</p>
            <p className="text-sm font-bold text-brand-dark">{xp} XP</p>
          </div>
          <Chip size="sm" className="bg-brand-blue/10 text-brand-blue border-none text-xs font-semibold">
            {course.credits} cr
          </Chip>
        </div>

        <Button asChild size="sm" className="w-full mt-auto">
          <Link href={`/courses/${course._id}`}>View Course</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function MyCourses({ enrollments }: { enrollments: EnrollmentWithCourse[] }) {
  const active = enrollments.filter((e) => e.status === "ACTIVE");

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-brand-dark">My Courses</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/courses">Browse more →</Link>
        </Button>
      </div>

      {active.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center py-12 gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center">
              <HiBookOpen size={24} className="text-brand-blue" />
            </div>
            <div>
              <p className="font-semibold text-brand-dark">No active courses yet</p>
              <p className="text-sm text-brand-body mt-0.5">Enroll in a course to start earning XP</p>
            </div>
            <Button asChild size="sm" className="mt-1">
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {active.map((enrollment) => (
            <CourseCard key={enrollment._id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── AssignmentsList ──────────────────────────────────────────────────────────

interface AssignmentItem {
  id:       string;
  title:    string;
  course:   string;
  dueDate:  string;
  daysLeft: number;
}

function AssignmentsList({ enrollments }: { enrollments: EnrollmentWithCourse[] }) {
  // Build upcoming assignment placeholders from active courses
  // (real implementation would call useCourseAssignments per course)
  const activeCourses = enrollments.filter((e) => e.status === "ACTIVE");

  if (activeCourses.length === 0) return null;

  // Placeholder items to show until per-course assignment fetching is implemented
  const upcoming: AssignmentItem[] = activeCourses.slice(0, 4).map((enrollment, i) => ({
    id:       `${enrollment._id}-placeholder`,
    title:    `Assignment ${i + 1}`,
    course:   enrollment.courseId.title,
    dueDate:  "Due this week",
    daysLeft: 7 - i * 2,
  }));

  const urgencyColor = (days: number) => {
    if (days <= 1)  return "danger" as const;
    if (days <= 3)  return "warning" as const;
    return "default" as const;
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-brand-dark mb-4">Upcoming Assignments</h2>
      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="divide-y divide-brand-border">
            {upcoming.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-brand-bg/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <HiBookOpen size={16} className="text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-dark truncate">{item.title}</p>
                  <p className="text-xs text-brand-body truncate">{item.course}</p>
                </div>
                <Chip
                  size="sm"
                  color={urgencyColor(item.daysLeft)}
                  variant="soft"
                  className="text-xs shrink-0"
                >
                  {item.daysLeft <= 1 ? "Due today" : `${item.daysLeft}d left`}
                </Chip>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// ─── LeaderboardPreview ───────────────────────────────────────────────────────

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function LeaderboardPreview({
  entries,
  currentUserId,
}: {
  entries:       LeaderboardEntry[];
  currentUserId?: string;
}) {
  const top5 = entries.slice(0, 5);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiTrophy size={18} className="text-amber-500" />
          <h2 className="text-lg font-bold text-brand-dark">Leaderboard</h2>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/student/leaderboard">View All →</Link>
        </Button>
      </div>

      <Card className="bg-white">
        <CardContent className="p-0">
          {top5.length === 0 ? (
            <div className="text-center py-10 text-sm text-brand-body">
              No leaderboard data available yet.
            </div>
          ) : (
            <div className="divide-y divide-brand-border">
              {top5.map((entry) => {
                const isMe = entry.studentId === currentUserId;
                const initials = entry.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={entry.studentId}
                    className={cn(
                      "flex items-center gap-4 px-5 py-3.5 transition-colors",
                      isMe ? "bg-brand-blue/5" : "hover:bg-brand-bg/50"
                    )}
                  >
                    {/* Rank */}
                    <span className="w-6 text-sm font-bold text-center shrink-0 text-brand-body">
                      {RANK_MEDALS[entry.rank] ?? `#${entry.rank}`}
                    </span>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand-blue">{initials}</span>
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-semibold truncate",
                        isMe ? "text-brand-blue" : "text-brand-dark"
                      )}>
                        {isMe ? `${entry.name} (You)` : entry.name}
                      </p>
                    </div>

                    {/* XP */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-brand-dark">
                        {entry.totalXP.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-brand-body">XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

// ─── RecentActivity ───────────────────────────────────────────────────────────

function RecentActivity({ enrollments }: { enrollments: EnrollmentWithCourse[] }) {
  type ActivityItem = {
    id:      string;
    icon:    React.ReactNode;
    text:    string;
    sub:     string;
    iconBg:  string;
  };

  const items: ActivityItem[] = enrollments
    .filter((e) => e.totalXpEarned > 0)
    .slice(0, 5)
    .map((e) => ({
      id:     e._id,
      icon:   <HiStar size={14} className="text-amber-500" />,
      text:   `Earned ${e.totalXpEarned} XP in ${e.courseId.title}`,
      sub:    new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      iconBg: "bg-amber-500/10",
    }));

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-brand-dark mb-4">Recent Activity</h2>
      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="relative">
            {items.map((item, i) => (
              <div key={item.id} className="flex gap-4 px-5 py-3.5 relative">
                {/* Timeline line */}
                {i < items.length - 1 && (
                  <div className="absolute left-[34px] top-10 bottom-0 w-px bg-brand-border" />
                )}
                {/* Icon */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
                  item.iconBg
                )}>
                  {item.icon}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-brand-dark leading-snug">{item.text}</p>
                  <p className="text-xs text-brand-body mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// ─── StudentDashboard (main export) ──────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useAuthContext();
  const {
    enrollments,
    isLoading: enrollLoading,
    error:     enrollError,
    refetch:   refetchEnroll,
  } = useMyEnrollments();
  const {
    entries:   leaderboard,
    isLoading: lbLoading,
  } = useLeaderboard({ timeframe: "month", limit: 10 });

  const isLoading = enrollLoading || lbLoading;

  if (isLoading) return <DashboardSkeleton />;

  // ── Derived stats ──────────────────────────────────────────────────────────
  const active    = enrollments.filter((e) => e.status === "ACTIVE");
  const completed = enrollments.filter((e) => e.status === "COMPLETED");
  const totalXP   = enrollments.reduce((sum, e) => sum + (e.totalXpEarned ?? 0), 0);
  const avgProg   = active.length > 0
    ? Math.round(active.reduce((s, e) => s + (e.progressPercentage ?? 0), 0) / active.length)
    : 0;
  const myRank    = user?._id
    ? leaderboard.find((e) => e.studentId === user._id)?.rank
    : undefined;

  const stats: StatItem[] = [
    {
      label:  "Total XP",
      value:  totalXP.toLocaleString(),
      sub:    "Keep earning!",
      icon:   "⭐",
      accent: totalXP > 0,
    },
    {
      label: "Enrolled Courses",
      value: active.length,
      sub:   `${completed.length} completed`,
      icon:  "📚",
    },
    {
      label:  "Avg. Progress",
      value:  `${avgProg}%`,
      sub:    "Across active courses",
      icon:   "📈",
      accent: avgProg > 50,
    },
    {
      label:  "Leaderboard",
      value:  myRank ? `#${myRank}` : "—",
      sub:    "Your rank this month",
      icon:   "🏆",
      accent: !!myRank && myRank <= 10,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <WelcomeHeader name={user?.firstName ?? "Student"} />

      {/* Error banner */}
      {enrollError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex-1">Failed to load enrollments: {enrollError}</span>
          <button
            onClick={refetchEnroll}
            className="flex items-center gap-1.5 text-red-700 hover:text-red-900 font-semibold shrink-0"
          >
            <HiArrowPath size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <StatsCards items={stats} />

      {/* My Courses */}
      <MyCourses enrollments={enrollments} />

      {/* Assignments */}
      <AssignmentsList enrollments={enrollments} />

      {/* Bottom two-col: leaderboard + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaderboardPreview entries={leaderboard} currentUserId={user?._id} />
        <RecentActivity enrollments={enrollments} />
      </div>
    </div>
  );
}
