"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: AdminDashboard
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The admin control panel displaying platform-wide usage metrics and management tabs.
 * 
 * WHY IT EXISTS:
 * Allows administrators to monitor system health, active users, and global courses.
 * 
 * HOW IT WORKS (Technical Overview):
 * Integrates overall analytics APIs and routes to user and course administration lists.
 * ============================================================================
 */

import Link from "next/link";
import { HiUsers, HiAcademicCap, HiBookOpen, HiUserCircle, HiArrowPath } from "react-icons/hi2";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useTranslation } from "react-i18next";

// The admin's landing dashboard: platform-wide stat cards (students,
// teachers, courses, XP given out) plus quick-action shortcuts to the user
// and course management pages.
export default function AdminDashboard() {
  const { data, loading, error, refetch } = useAdminStats();
  const { t } = useTranslation();

  const STAT_CONFIG = [
    { key: "totalStudents" as const, labelKey: "adminDashboard.students", icon: HiAcademicCap, color: "text-brand-blue",  bg: "bg-brand-blue/10" },
    { key: "totalTeachers" as const, labelKey: "adminDashboard.teachers", icon: HiUserCircle,  color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { key: "totalCourses"  as const, labelKey: "adminDashboard.courses",  icon: HiBookOpen,    color: "text-amber-500",   bg: "bg-amber-500/10" },
    { key: "totalXPDistributed" as const, labelKey: "adminDashboard.xpDistributed", icon: HiUsers, color: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{t("adminDashboard.title")}</h1>
          <p className="text-[15px] text-brand-body mt-1">
            {t("adminDashboard.subtitle")}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={refetch} aria-label={t("adminDashboard.refreshStats")}>
          <HiArrowPath size={18} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t("adminDashboard.failedToLoadStats")} {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STAT_CONFIG.map(({ key, labelKey, icon: Icon, color, bg }) => (
          <Card key={key} className="p-5">
            <CardContent className="p-0 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={24} className={color} />
              </div>
              <div>
                {loading ? (
                  <div className="h-7 w-16 bg-brand-bg rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-[25px] font-bold text-brand-dark leading-none">
                    {(data?.[key] ?? 0).toLocaleString()}
                  </p>
                )}
                <p className="text-[15px] text-brand-body mt-1">{t(labelKey)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-brand-dark">{t("adminDashboard.usersTitle")}</h2>
              <p className="text-[15px] text-brand-body mt-0.5">
                {t("adminDashboard.usersDesc")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              <HiUsers size={20} className="text-violet-500" />
            </div>
          </div>
          <Button asChild size="sm">
            <Link href="/admin/users">{t("adminDashboard.manageUsers")}</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-brand-dark">{t("adminDashboard.coursesTitle")}</h2>
              <p className="text-[15px] text-brand-body mt-0.5">
                {t("adminDashboard.coursesDesc")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <HiBookOpen size={20} className="text-amber-500" />
            </div>
          </div>
          <Button asChild size="sm">
            <Link href="/admin/courses">{t("adminDashboard.manageCourses")}</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
