"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@heroui/react";
import {
  HiUsers,
  HiBookOpen,
  HiSparkles,
  HiAcademicCap,
  HiShieldCheck,
  HiChartBar,
  HiCog6Tooth,
  HiServerStack,
} from "react-icons/hi2";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStats } from "@/hooks/useAdminStats";
import ProfileLayout, {
  type ProfileStatCard,
  type ProfileAchievement,
} from "@/components/profile/ProfileLayout";

function fmtXP(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const RECENT_ACTIONS = [
  { icon: HiUsers, label: "Enrolled 3 new students", time: "2 hours ago", color: "text-blue-500 dark:text-blue-400" },
  { icon: HiBookOpen, label: "Published new course: Advanced ML", time: "5 hours ago", color: "text-green-500 dark:text-green-400" },
  { icon: HiAcademicCap, label: "Assigned teacher to Web Dev course", time: "Yesterday", color: "text-purple-500 dark:text-purple-400" },
  { icon: HiChartBar, label: "Generated monthly analytics report", time: "2 days ago", color: "text-yellow-500 dark:text-yellow-400" },
  { icon: HiCog6Tooth, label: "Updated platform settings", time: "3 days ago", color: "text-slate-500 dark:text-slate-400" },
];

export default function AdminProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: stats, loading: statsLoading } = useAdminStats();

  const [form, setForm] = useState({ firstName: "", lastName: "" });
  const [formReady, setFormReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (user && !formReady) {
    setForm({ firstName: user.firstName, lastName: user.lastName });
    setFormReady(true);
  }

  const totalUsers = (stats?.totalStudents ?? 0) + (stats?.totalTeachers ?? 0);

  const statsCards: ProfileStatCard[] = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: <HiUsers className="w-5 h-5" />,
      iconWrapClass:
        "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Courses",
      value: stats?.totalCourses ?? 0,
      icon: <HiBookOpen className="w-5 h-5" />,
      iconWrapClass:
        "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
    },
    {
      label: "XP Distributed",
      value: fmtXP(stats?.totalXPDistributed ?? 0),
      icon: <HiSparkles className="w-5 h-5" />,
      iconWrapClass:
        "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Teachers",
      value: stats?.totalTeachers ?? 0,
      icon: <HiAcademicCap className="w-5 h-5" />,
      iconWrapClass:
        "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
    },
  ];

  const achievements: ProfileAchievement[] = [
    {
      id: "guardian",
      icon: "🏛️",
      name: "Guardian",
      desc: "Managing the Questify platform",
      unlocked: true,
    },
    {
      id: "people",
      icon: "👥",
      name: "People Manager",
      desc: "Overseeing all platform users",
      unlocked: true,
    },
    {
      id: "data-driven",
      icon: "📊",
      name: "Data Driven",
      desc: "Platform analytics reviewed",
      unlocked: true,
    },
    {
      id: "report-master",
      icon: "📋",
      name: "Report Master",
      desc: "Generated platform reports",
      unlocked: true,
    },
    {
      id: "100-users",
      icon: "🎯",
      name: "Century Club",
      desc: "100+ users on the platform",
      unlocked: totalUsers >= 100,
    },
    {
      id: "500-users",
      icon: "🚀",
      name: "Scale Builder",
      desc: "500+ users on the platform",
      unlocked: totalUsers >= 500,
    },
    {
      id: "secure",
      icon: "🔒",
      name: "Security First",
      desc: "Platform security maintained",
      unlocked: true,
    },
    {
      id: "reliable",
      icon: "⚡",
      name: "Always On",
      desc: "Platform running reliably",
      unlocked: true,
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

  if (authLoading || statsLoading) {
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
      roleLabel="Administrator"
      roleColor="danger"
      subtitle="Platform management & oversight"
      statsCards={statsCards}
      achievements={achievements}
      editFormContent={editFormContent}
      onSave={handleSave}
      isSaving={isSaving}
    >
      {/* Platform Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
                <HiAcademicCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-brand-muted dark:text-white/50">Students</p>
                <p className="text-lg font-bold text-brand-dark dark:text-white">
                  {stats?.totalStudents ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 shrink-0">
                <HiShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-brand-muted dark:text-white/50">System Status</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  Operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 shrink-0">
                <HiServerStack className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-brand-muted dark:text-white/50">Role</p>
                <p className="text-lg font-bold text-brand-dark dark:text-white">
                  Super Admin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECENT_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-brand-surface dark:bg-slate-800/50"
                >
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shrink-0">
                    <Icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-dark dark:text-white truncate">
                      {action.label}
                    </p>
                  </div>
                  <span className="text-xs text-brand-muted dark:text-white/40 shrink-0">
                    {action.time}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </ProfileLayout>
  );
}
