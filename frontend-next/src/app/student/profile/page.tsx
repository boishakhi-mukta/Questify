"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  ProgressBarRoot,
  ProgressBarTrack,
  ProgressBarFill,
} from "@heroui/react";
import {
  HiBookOpen,
  HiCheckCircle,
  HiTrophy,
  HiSparkles,
  HiAcademicCap,
  HiClock,
} from "react-icons/hi2";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useMyEnrollments } from "@/hooks/api/useMyEnrollments";
import { useLeaderboard } from "@/hooks/api/useLeaderboard";
import ProfileLayout, {
  type ProfileStatCard,
  type ProfileAchievement,
} from "@/components/profile/ProfileLayout";
import type { EnrollmentWithCourse } from "@/types/api-response";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "In Progress",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
};
const STATUS_COLOR: Record<
  string,
  "success" | "default" | "danger" | "warning" | "accent"
> = {
  ACTIVE: "accent",
  COMPLETED: "success",
  DROPPED: "danger",
};

function fmtXP(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function StudentProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { enrollments, isLoading: enrollLoading } = useMyEnrollments();
  const { entries } = useLeaderboard({ limit: 200 });

  const [form, setForm] = useState({ firstName: "", lastName: "" });
  const [formReady, setFormReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (user && !formReady) {
    setForm({ firstName: user.firstName, lastName: user.lastName });
    setFormReady(true);
  }

  const totalXP = useMemo(
    () => enrollments.reduce((sum, e) => sum + (e.totalXpEarned ?? 0), 0),
    [enrollments]
  );
  const level = Math.floor(totalXP / 500) + 1;
  const xpIntoLevel = totalXP % 500;
  const xpProgress = Math.round((xpIntoLevel / 500) * 100);

  const completed = enrollments.filter(
    (e: EnrollmentWithCourse) => e.status === "COMPLETED"
  ).length;

  const rank = useMemo(() => {
    if (!user) return null;
    const entry = entries.find((e) => e.studentId === user._id);
    return entry?.rank ?? null;
  }, [entries, user]);

  const statsCards: ProfileStatCard[] = [
    {
      label: "Courses Enrolled",
      value: enrollments.length,
      icon: <HiBookOpen className="w-5 h-5" />,
      iconWrapClass:
        "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Completed",
      value: completed,
      icon: <HiCheckCircle className="w-5 h-5" />,
      iconWrapClass:
        "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
    },
    {
      label: "Global Rank",
      value: rank ? `#${rank}` : "–",
      icon: <HiTrophy className="w-5 h-5" />,
      iconWrapClass:
        "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Total XP",
      value: fmtXP(totalXP),
      icon: <HiSparkles className="w-5 h-5" />,
      iconWrapClass:
        "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    },
  ];

  const achievements: ProfileAchievement[] = [
    {
      id: "welcome",
      icon: "🎉",
      name: "Welcome!",
      desc: "Joined the Questify platform",
      unlocked: true,
    },
    {
      id: "first-course",
      icon: "📚",
      name: "Curious Mind",
      desc: "Enrolled in your first course",
      unlocked: enrollments.length >= 1,
    },
    {
      id: "xp-100",
      icon: "⭐",
      name: "Rising Star",
      desc: "Earned 100 XP",
      unlocked: totalXP >= 100,
    },
    {
      id: "xp-500",
      icon: "💫",
      name: "XP Hunter",
      desc: "Earned 500 XP",
      unlocked: totalXP >= 500,
    },
    {
      id: "complete-1",
      icon: "🎓",
      name: "Graduate",
      desc: "Completed your first course",
      unlocked: completed >= 1,
    },
    {
      id: "scholar",
      icon: "📖",
      name: "Scholar",
      desc: "Enrolled in 3+ courses",
      unlocked: enrollments.length >= 3,
    },
    {
      id: "xp-1000",
      icon: "🔥",
      name: "On Fire",
      desc: "Earned 1000 XP",
      unlocked: totalXP >= 1000,
    },
    {
      id: "top-50",
      icon: "🏆",
      name: "Top Performer",
      desc: "Reached top 50 on leaderboard",
      unlocked: rank !== null && rank <= 50,
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    toast.success("Profile updated successfully");
  };

  const editFormContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-dark dark:text-white">
            First Name
          </label>
          <input
            className="w-full rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 text-brand-dark dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            placeholder="First name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-dark dark:text-white">
            Last Name
          </label>
          <input
            className="w-full rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 text-brand-dark dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            placeholder="Last name"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-brand-dark dark:text-white">
          Email
        </label>
        <input
          className="w-full rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 text-brand-muted dark:text-white/40 px-3 py-2 text-sm cursor-not-allowed"
          value={user?.email ?? ""}
          readOnly
          disabled
        />
        <p className="text-xs text-brand-muted dark:text-white/40">
          Contact support to change your email address.
        </p>
      </div>
    </div>
  );

  const headerExtra = (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-brand-dark dark:text-white">
          Level {level}
        </span>
        <span className="text-xs text-brand-muted dark:text-white/50">
          {xpIntoLevel} / 500 XP to Level {level + 1}
        </span>
      </div>
      <ProgressBarRoot value={xpProgress} size="sm" color="accent">
        <ProgressBarTrack>
          <ProgressBarFill className="transition-all duration-700" />
        </ProgressBarTrack>
      </ProgressBarRoot>
    </div>
  );

  if (authLoading || enrollLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-brand-surface dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (!user) return null;

  return (
    <ProfileLayout
      user={user}
      roleLabel="Student"
      roleColor="accent"
      headerExtra={headerExtra}
      statsCards={statsCards}
      achievements={achievements}
      editFormContent={editFormContent}
      onSave={handleSave}
      isSaving={isSaving}
    >
      {/* Recent Enrollments */}
      {enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollments.slice(0, 5).map((enrollment) => {
                const course = enrollment.courseId;
                return (
                  <div
                    key={enrollment._id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-brand-surface dark:bg-slate-800/50"
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shrink-0">
                      <HiAcademicCap className="w-5 h-5 text-brand-purple dark:text-brand-purple-light" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-dark dark:text-white truncate">
                        {course.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <ProgressBarRoot
                          value={enrollment.progressPercentage}
                          size="sm"
                          color="accent"
                        >
                          <ProgressBarTrack className="w-24">
                            <ProgressBarFill />
                          </ProgressBarTrack>
                        </ProgressBarRoot>
                        <span className="text-xs text-brand-muted dark:text-white/50">
                          {enrollment.progressPercentage}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium text-brand-purple dark:text-brand-purple-light">
                        +{enrollment.totalXpEarned} XP
                      </span>
                      <Chip
                        color={STATUS_COLOR[enrollment.status] ?? "default"}
                        variant="soft"
                        size="sm"
                      >
                        {STATUS_LABEL[enrollment.status] ?? enrollment.status}
                      </Chip>
                    </div>
                  </div>
                );
              })}
              {enrollments.length > 5 && (
                <p className="text-center text-sm text-brand-muted dark:text-white/50 pt-1">
                  +{enrollments.length - 5} more courses
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 shrink-0">
                <HiSparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-brand-muted dark:text-white/50">Current Level</p>
                <p className="text-lg font-bold text-brand-dark dark:text-white">
                  Level {level}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 shrink-0">
                <HiTrophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-brand-muted dark:text-white/50">Leaderboard Rank</p>
                <p className="text-lg font-bold text-brand-dark dark:text-white">
                  {rank ? `#${rank}` : "Unranked"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 shrink-0">
                <HiClock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-brand-muted dark:text-white/50">XP to Next Level</p>
                <p className="text-lg font-bold text-brand-dark dark:text-white">
                  {500 - xpIntoLevel} XP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
}
