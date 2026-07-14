"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: StudentDashboard
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The student dashboard displaying their current courses, progress, grades, and XP.
 * 
 * WHY IT EXISTS:
 * Gives students a motivational view of their studies, assignments, and badges.
 * 
 * HOW IT WORKS (Technical Overview):
 * Calls student APIs, renders courses grids, badge collections, and XP progress bars.
 * ============================================================================
 */

import Link from "next/link";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const today = new Date().toLocaleDateString(i18n.language === "no" ? "nb-NO" : "en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">
          {t("studentDashboard.welcomeBack", { name })}
        </h1>
        <p className="text-sm text-brand-body mt-1">{today}</p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href="/courses">{t("studentDashboard.browseCourses")}</Link>
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
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-60 rounded-lg" />
        <Skeleton className="h-4 w-44 rounded-lg" />
      </div>
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
  const { t }    = useTranslation();
  const course   = enrollment.courseId;
  const progress = enrollment.progressPercentage ?? 0;
  const xp       = enrollment.totalXpEarned ?? 0;

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
        <div>
          <div className="flex justify-between text-xs text-brand-body mb-1.5">
            <span>{t("studentDashboard.progress")}</span>
            <span className="font-semibold text-brand-dark">{progress}%</span>
          </div>
          <ProgressBar value={progress} minValue={0} maxValue={100} aria-label={`${course.title} progress`}>
            <ProgressBarTrack className="h-1.5 rounded-full bg-brand-bg">
              <ProgressBarFill className="rounded-full bg-brand-blue h-full transition-[width]" />
            </ProgressBarTrack>
          </ProgressBar>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-body">{t("studentDashboard.xpEarned")}</p>
            <p className="text-sm font-bold text-brand-dark">{xp} XP</p>
          </div>
          <Chip size="sm" className="bg-brand-blue/10 text-brand-blue border-none text-xs font-semibold">
            {course.credits} cr
          </Chip>
        </div>
        <Button asChild size="sm" className="w-full mt-auto">
          <Link href={`/courses/${course._id}`}>{t("studentDashboard.viewCourse")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function MyCourses({ enrollments }: { enrollments: EnrollmentWithCourse[] }) {
  const { t }  = useTranslation();
  const active = enrollments.filter((e) => e.status === "ACTIVE");

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-brand-dark">{t("studentDashboard.myCourses")}</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/courses">{t("studentDashboard.browseMore")}</Link>
        </Button>
      </div>

      {active.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center py-12 gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center">
              <HiBookOpen size={24} className="text-brand-blue" />
            </div>
            <div>
              <p className="font-semibold text-brand-dark">{t("studentDashboard.noActiveCourses")}</p>
              <p className="text-sm text-brand-body mt-0.5">{t("studentDashboard.enrollCta")}</p>
            </div>
            <Button asChild size="sm" className="mt-1">
              <Link href="/courses">{t("studentDashboard.exploreCourses")}</Link>
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
  daysLeft: number;
}

function AssignmentsList({ enrollments }: { enrollments: EnrollmentWithCourse[] }) {
  const { t }          = useTranslation();
  const activeCourses  = enrollments.filter((e) => e.status === "ACTIVE");
  if (activeCourses.length === 0) return null;

  const upcoming: AssignmentItem[] = activeCourses.slice(0, 4).map((enrollment, i) => ({
    id:       `${enrollment._id}-placeholder`,
    title:    `Assignment ${i + 1}`,
    course:   enrollment.courseId.title,
    daysLeft: 7 - i * 2,
  }));

  const urgencyColor = (days: number) => {
    if (days <= 1) return "danger" as const;
    if (days <= 3) return "warning" as const;
    return "default" as const;
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-brand-dark mb-4">{t("studentDashboard.upcomingAssignments")}</h2>
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
                <Chip size="sm" color={urgencyColor(item.daysLeft)} variant="soft" className="text-xs shrink-0">
                  {item.daysLeft <= 1
                    ? t("studentDashboard.dueToday")
                    : t("studentDashboard.daysLeft", { count: item.daysLeft })}
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

function LeaderboardPreview({ entries, currentUserId, isLoading }: { entries: LeaderboardEntry[]; currentUserId?: string; isLoading?: boolean }) {
  const { t } = useTranslation();
  const top5  = entries.slice(0, 5);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiTrophy size={18} className="text-amber-500" />
          <h2 className="text-lg font-bold text-brand-dark">{t("studentDashboard.leaderboardLabel")}</h2>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/student/leaderboard">{t("studentDashboard.viewAll")}</Link>
        </Button>
      </div>
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className="w-6 h-4 rounded bg-brand-bg animate-pulse" />
                  <div className="w-8 h-8 rounded-full bg-brand-bg animate-pulse" />
                  <div className="flex-1 h-4 rounded bg-brand-bg animate-pulse" />
                  <div className="w-12 h-4 rounded bg-brand-bg animate-pulse" />
                </div>
              ))}
            </div>
          ) : top5.length === 0 ? (
            <div className="text-center py-10 text-sm text-brand-body">
              {t("studentDashboard.noLeaderboard")}
            </div>
          ) : (
            <div className="divide-y divide-brand-border">
              {top5.map((entry) => {
                const isMe    = entry.studentId === currentUserId;
                const initials = entry.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

                return (
                  <div
                    key={entry.studentId}
                    className={cn("flex items-center gap-4 px-5 py-3.5 transition-colors", isMe ? "bg-brand-blue/5" : "hover:bg-brand-bg/50")}
                  >
                    <span className="w-6 text-sm font-bold text-center shrink-0 text-brand-body">
                      {RANK_MEDALS[entry.rank] ?? `#${entry.rank}`}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand-blue">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-semibold truncate", isMe ? "text-brand-blue" : "text-brand-dark")}>
                        {isMe ? `${entry.name} ${t("studentDashboard.you")}` : entry.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-brand-dark">{entry.totalXP.toLocaleString()}</p>
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
  const { t, i18n } = useTranslation();

  type ActivityItem = { id: string; icon: React.ReactNode; text: string; sub: string; iconBg: string };

  const items: ActivityItem[] = enrollments
    .filter((e) => e.totalXpEarned > 0)
    .slice(0, 5)
    .map((e) => ({
      id:     e._id,
      icon:   <HiStar size={14} className="text-amber-500" />,
      text:   t("studentDashboard.earnedXp", { xp: e.totalXpEarned, course: e.courseId.title }),
      sub:    new Date(e.enrolledAt).toLocaleDateString(i18n.language === "no" ? "nb-NO" : "en-US", { month: "short", day: "numeric" }),
      iconBg: "bg-amber-500/10",
    }));

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-brand-dark mb-4">{t("studentDashboard.recentActivity")}</h2>
      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="relative">
            {items.map((item, i) => (
              <div key={item.id} className="flex gap-4 px-5 py-3.5 relative">
                {i < items.length - 1 && (
                  <div className="absolute left-[34px] top-10 bottom-0 w-px bg-brand-border" />
                )}
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10", item.iconBg)}>
                  {item.icon}
                </div>
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
  const { t }    = useTranslation();
  const { user } = useAuthContext();
  const { enrollments, isLoading: enrollLoading, error: enrollError, refetch: refetchEnroll } = useMyEnrollments();
  const { entries: leaderboard, isLoading: lbLoading } = useLeaderboard({ timeframe: "month", limit: 10 });

  if (enrollLoading) return <DashboardSkeleton />;

  const active    = enrollments.filter((e) => e.status === "ACTIVE");
  const completed = enrollments.filter((e) => e.status === "COMPLETED");
  const totalXP   = enrollments.reduce((sum, e) => sum + (e.totalXpEarned ?? 0), 0);
  const avgProg   = active.length > 0
    ? Math.round(active.reduce((s, e) => s + (e.progressPercentage ?? 0), 0) / active.length)
    : 0;
  const myRank = user?._id ? leaderboard.find((e) => e.studentId === user._id)?.rank : undefined;

  const stats: StatItem[] = [
    { label: t("studentDashboard.totalXp"),         value: totalXP.toLocaleString(), sub: t("studentDashboard.keepEarning"),         icon: "⭐", accent: totalXP > 0 },
    { label: t("studentDashboard.enrolledCourses"),  value: active.length,            sub: t("studentDashboard.completed", { count: completed.length }), icon: "📚" },
    { label: t("studentDashboard.avgProgress"),      value: `${avgProg}%`,            sub: t("studentDashboard.acrossActiveCourses"), icon: "📈", accent: avgProg > 50 },
    { label: t("studentDashboard.leaderboardLabel"), value: lbLoading ? "…" : myRank ? `#${myRank}` : "—", sub: t("studentDashboard.yourRank"), icon: "🏆", accent: !!myRank && myRank <= 10 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <WelcomeHeader name={user?.firstName ?? t("sidebar.student")} />

      {enrollError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex-1">{t("studentDashboard.failedEnrollments", { error: enrollError })}</span>
          <button onClick={refetchEnroll} className="flex items-center gap-1.5 text-red-700 hover:text-red-900 font-semibold shrink-0">
            <HiArrowPath size={14} />
            {t("studentDashboard.retry")}
          </button>
        </div>
      )}

      <StatsCards items={stats} />
      <MyCourses enrollments={enrollments} />
      <AssignmentsList enrollments={enrollments} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaderboardPreview entries={leaderboard} currentUserId={user?._id} isLoading={lbLoading} />
        <RecentActivity enrollments={enrollments} />
      </div>
    </div>
  );
}
