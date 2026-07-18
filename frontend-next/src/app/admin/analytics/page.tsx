"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Platform Statistics
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Visual charts demonstrating platform metrics (grades, attendance).
 * 
 * WHY IT EXISTS:
 * Helps managers track engagement trends.
 * 
 * HOW IT WORKS (Technical Overview):
 * Connects analytics hooks to chart rendering grids.
 * ============================================================================
 */

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ProgressBarRoot,
  ProgressBarTrack,
  ProgressBarFill,
} from "@heroui/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  HiUsers,
  HiBookOpen,
  HiAcademicCap,
  HiSparkles,
  HiTrophy,
  HiChartBar,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiMinus,
} from "react-icons/hi2";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminCourses } from "@/hooks/api/useAdminCourses";
import { useLeaderboard } from "@/hooks/api/useLeaderboard";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry, Course } from "@/types/api-response";

// ── Static chart data (no server endpoint for monthly trends) ─────────────────

const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const STUDENT_GROWTH = [
  { month: "Aug", students: 318, enrollments: 890 },
  { month: "Sep", students: 342, enrollments: 960 },
  { month: "Oct", students: 358, enrollments: 1010 },
  { month: "Nov", students: 371, enrollments: 1055 },
  { month: "Dec", students: 383, enrollments: 1090 },
  { month: "Jan", students: 401, enrollments: 1120 },
  { month: "Feb", students: 416, enrollments: 1155 },
  { month: "Mar", students: 429, enrollments: 1185 },
  { month: "Apr", students: 444, enrollments: 1215 },
  { month: "May", students: 457, enrollments: 1235 },
  { month: "Jun", students: 470, enrollments: 1248 },
  { month: "Jul", students: 485, enrollments: 1267 },
];

const XP_BY_ACTIVITY = [
  { name: "Assignments",  value: 8750, color: "#3b82f6" },
  { name: "Attendance",   value: 4200, color: "#10b981" },
  { name: "Materials",    value: 3100, color: "#8b5cf6" },
  { name: "Participation",value: 2800, color: "#f59e0b" },
  { name: "Quizzes",      value: 1950, color: "#ef4444" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

// Converts a raw XP total into a level number (every 500 XP = 1 level).
function xpToLevel(xp: number) {
  return Math.floor(xp / 500) + 1;
}

// Adds thousands separators to a number for readability (e.g. 12345 → "12,345").
function fmt(n: number) {
  return n.toLocaleString();
}

// recharts custom tooltip — dark-mode-aware
// The hover popup shown over a point on any of the charts on this page.
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 shadow-lg text-[13px]">
      {label && (
        <p className="font-semibold text-brand-dark dark:text-white mb-1">{label}</p>
      )}
      {payload.map((p) => (
        <p key={p.name} className="text-brand-body dark:text-white/70">
          <span style={{ color: p.color }} className="mr-1.5">●</span>
          {p.name}: <span className="font-semibold text-brand-dark dark:text-white">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:    string;
  value:    string | number;
  sub?:     string;
  trend?:   "up" | "down" | "neutral";
  icon:     React.ElementType;
  accent:   string;
  loading?: boolean;
}

// One top-row summary tile (e.g. "Total Users: 823, +12 this month ↑").
function StatCard({ label, value, sub, trend = "neutral", icon: Icon, accent, loading }: StatCardProps) {
  const TrendIcon =
    trend === "up"      ? HiArrowTrendingUp   :
    trend === "down"    ? HiArrowTrendingDown  :
    HiMinus;

  const trendColor =
    trend === "up"      ? "text-emerald-600 dark:text-emerald-400" :
    trend === "down"    ? "text-red-500 dark:text-red-400" :
    "text-brand-body/60 dark:text-white/40";

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        {loading ? (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-3 w-24 rounded bg-brand-border dark:bg-white/10" />
            <div className="h-8 w-20 rounded bg-brand-border dark:bg-white/10" />
            <div className="h-3 w-32 rounded bg-brand-border dark:bg-white/10" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <p className="text-[12px] font-medium text-brand-body dark:text-white/55 uppercase tracking-wide">
                {label}
              </p>
              <p className="text-[28px] font-black text-brand-dark dark:text-white leading-none">
                {typeof value === "number" ? fmt(value) : value}
              </p>
              {sub && (
                <div className={cn("flex items-center gap-1 text-[12px] font-medium", trendColor)}>
                  <TrendIcon size={12} />
                  <span>{sub}</span>
                </div>
              )}
            </div>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", accent)}>
              <Icon size={20} className="text-white" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

// A grey placeholder block shown while a chart's data is still loading.
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-lg bg-brand-bg dark:bg-white/5 animate-pulse"
      style={{ height }}
    />
  );
}

// Grey placeholder rows shown while a table's data is still loading.
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded bg-brand-border/40 dark:bg-white/5" />
      ))}
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

interface Filters {
  timeRange:  string;
  department: string;
}

// The "Time Range" and "Department" dropdown filters at the top of the page.
function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-44">
        <label className="block text-[11px] font-semibold text-brand-body/60 dark:text-white/40 uppercase tracking-wide mb-1.5">
          Time Range
        </label>
        <Select
          value={filters.timeRange}
          onValueChange={(v) => onChange({ ...filters, timeRange: v })}
        >
          <SelectTrigger className="h-9 text-[13px] dark:bg-slate-800 dark:border-white/10 dark:text-white">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="semester">This Semester</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-52">
        <label className="block text-[11px] font-semibold text-brand-body/60 dark:text-white/40 uppercase tracking-wide mb-1.5">
          Department
        </label>
        <Select
          value={filters.department}
          onValueChange={(v) => onChange({ ...filters, department: v })}
        >
          <SelectTrigger className="h-9 text-[13px] dark:bg-slate-800 dark:border-white/10 dark:text-white">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="cs">Computer Science</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="science">Natural Sciences</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ── Top students table ────────────────────────────────────────────────────────

// The "Top 10 Students by XP" leaderboard table.
function TopStudentsTable({ entries, loading }: { entries: LeaderboardEntry[]; loading: boolean }) {
  const ROW_STYLE = "px-4 py-3 text-[13px]";
  const TH_STYLE  = "px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-brand-body/60 dark:text-white/40 text-left";

  const rankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HiTrophy className="text-amber-500" size={18} />
          Top 10 Students by XP
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-4">
        {loading ? (
          <div className="px-4"><TableSkeleton rows={6} /></div>
        ) : entries.length === 0 ? (
          <p className="px-6 py-6 text-[13px] text-brand-body/60 dark:text-white/40 text-center">
            No data available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border dark:border-white/8">
                  <th className={TH_STYLE}>Rank</th>
                  <th className={TH_STYLE}>Student</th>
                  <th className={TH_STYLE}>XP</th>
                  <th className={TH_STYLE}>Level</th>
                  <th className={TH_STYLE}>Courses</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => (
                  <tr
                    key={e.studentId}
                    className={cn(
                      "border-b border-brand-border/40 dark:border-white/5 transition-colors",
                      "hover:bg-brand-bg dark:hover:bg-white/4",
                      idx < 3 && "bg-amber-50/40 dark:bg-amber-500/5",
                    )}
                  >
                    <td className={cn(ROW_STYLE, "font-bold text-brand-dark dark:text-white w-14")}>
                      {rankBadge(e.rank)}
                    </td>
                    <td className={cn(ROW_STYLE)}>
                      <div className="flex items-center gap-2.5">
                        {e.avatar ? (
                          <img src={e.avatar} alt={e.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-white">
                              {e.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-brand-dark dark:text-white truncate">{e.name}</p>
                          {e.email && (
                            <p className="text-[11px] text-brand-body/55 dark:text-white/35 truncate">{e.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={cn(ROW_STYLE, "font-bold text-emerald-600 dark:text-emerald-400 tabular-nums")}>
                      {fmt(e.totalXP)}
                    </td>
                    <td className={cn(ROW_STYLE)}>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20">
                        Lv {xpToLevel(e.totalXP)}
                      </span>
                    </td>
                    <td className={cn(ROW_STYLE, "text-brand-body dark:text-white/60 tabular-nums")}>
                      {e.courseCount ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Top courses table ─────────────────────────────────────────────────────────

// The "Top Courses by Enrollment" table, with a capacity progress bar per row.
function TopCoursesTable({ courses, loading }: { courses: Course[]; loading: boolean }) {
  const ROW_STYLE = "px-4 py-3 text-[13px]";
  const TH_STYLE  = "px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-brand-body/60 dark:text-white/40 text-left";

  const levelColor: Record<string, string> = {
    BEGINNER:     "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
    INTERMEDIATE: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
    ADVANCED:     "bg-red-500/12 text-red-700 dark:text-red-400",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HiBookOpen className="text-brand-blue" size={18} />
          Top Courses by Enrollment
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-4">
        {loading ? (
          <div className="px-4"><TableSkeleton rows={6} /></div>
        ) : courses.length === 0 ? (
          <p className="px-6 py-6 text-[13px] text-brand-body/60 dark:text-white/40 text-center">
            No data available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border dark:border-white/8">
                  <th className={TH_STYLE}>#</th>
                  <th className={TH_STYLE}>Course</th>
                  <th className={TH_STYLE}>Level</th>
                  <th className={TH_STYLE}>Enrolled</th>
                  <th className={TH_STYLE}>Capacity</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, idx) => {
                  const pct = c.maxCapacity > 0 ? (c.enrollmentCount / c.maxCapacity) * 100 : 0;
                  return (
                    <tr
                      key={c._id}
                      className="border-b border-brand-border/40 dark:border-white/5 hover:bg-brand-bg dark:hover:bg-white/4 transition-colors"
                    >
                      <td className={cn(ROW_STYLE, "text-brand-body/60 dark:text-white/40 w-10 font-bold")}>
                        {idx + 1}
                      </td>
                      <td className={cn(ROW_STYLE)}>
                        <p className="font-semibold text-brand-dark dark:text-white truncate max-w-[220px]">{c.title}</p>
                        <p className="text-[11px] text-brand-body/55 dark:text-white/35">{c.category}</p>
                      </td>
                      <td className={cn(ROW_STYLE)}>
                        <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold", levelColor[c.level])}>
                          {c.level.charAt(0) + c.level.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className={cn(ROW_STYLE, "font-bold text-brand-dark dark:text-white tabular-nums")}>
                        {fmt(c.enrollmentCount)}
                      </td>
                      <td className={cn(ROW_STYLE, "w-36")}>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-brand-body/55 dark:text-white/35">
                            <span>{Math.round(pct)}%</span>
                            <span>{fmt(c.maxCapacity)}</span>
                          </div>
                          <ProgressBarRoot
                            value={pct}
                            minValue={0}
                            maxValue={100}
                            aria-label={`${c.title} capacity`}
                            color={pct > 85 ? "danger" : pct > 60 ? "warning" : "success"}
                            size="sm"
                          >
                            <ProgressBarTrack>
                              <ProgressBarFill />
                            </ProgressBarTrack>
                          </ProgressBarRoot>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const GRID_STROKE = "var(--color-brand-border, #e5e7eb)";
const AXIS_TICK   = { fontSize: 11, fill: "currentColor", className: "text-brand-body/60 dark:text-white/40" };

// The full "Platform Analytics" page: overview stat tiles, growth/XP/course
// charts, and top-students/top-courses tables.
export default function AdminAnalyticsPage() {
  const [filters, setFilters] = useState<Filters>({ timeRange: "month", department: "all" });

  const { data: stats, loading: statsLoading }  = useAdminStats();
  const { entries: topStudents, isLoading: studentsLoading } = useLeaderboard({ limit: 10 });
  const { courses, isLoading: coursesLoading }  = useAdminCourses({ limit: 10, sort: "enrollmentCount" });

  const totalUsers     = (stats?.totalStudents ?? 0) + (stats?.totalTeachers ?? 0);
  const studentPct     = totalUsers > 0 ? Math.round(((stats?.totalStudents ?? 0) / totalUsers) * 100) : 0;
  const teacherPct     = totalUsers > 0 ? Math.round(((stats?.totalTeachers ?? 0) / totalUsers) * 100) : 0;
  const totalEnrollments = useMemo(
    () => courses.reduce((s, c) => s + c.enrollmentCount, 0),
    [courses],
  );

  // Bar chart data from live courses, sorted descending
  const courseChartData = useMemo(
    () =>
      [...courses]
        .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        .slice(0, 10)
        .map((c) => ({
          course:     c.title.length > 22 ? `${c.title.slice(0, 22)}…` : c.title,
          enrollment: c.enrollmentCount,
        })),
    [courses],
  );

  const totalXP = stats?.totalXPDistributed ?? 0;

  return (
    <div className="max-w-screen-xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
            <HiChartBar size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">
            Platform Analytics
          </h1>
        </div>
        <p className="text-[14px] text-brand-body dark:text-white/55 ml-12">
          Insights across students, courses, and XP activity.
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="mb-8">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* ── Overview cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={statsLoading ? "—" : totalUsers}
          sub="+12 this month"
          trend="up"
          icon={HiUsers}
          accent="bg-gradient-to-br from-brand-blue to-indigo-600"
          loading={statsLoading}
        />
        <StatCard
          label="Active Students"
          value={statsLoading ? "—" : (stats?.totalStudents ?? 0)}
          sub={`${studentPct}% of total`}
          trend="neutral"
          icon={HiAcademicCap}
          accent="bg-gradient-to-br from-emerald-500 to-teal-600"
          loading={statsLoading}
        />
        <StatCard
          label="Active Faculty"
          value={statsLoading ? "—" : (stats?.totalTeachers ?? 0)}
          sub={`${teacherPct}% of total`}
          trend="neutral"
          icon={HiUsers}
          accent="bg-gradient-to-br from-violet-500 to-purple-600"
          loading={statsLoading}
        />
        <StatCard
          label="Total Courses"
          value={statsLoading ? "—" : (stats?.totalCourses ?? 0)}
          sub="+3 this semester"
          trend="up"
          icon={HiBookOpen}
          accent="bg-gradient-to-br from-amber-500 to-orange-500"
          loading={statsLoading}
        />
        <StatCard
          label="Total Enrollments"
          value={coursesLoading ? "—" : totalEnrollments}
          sub="+150 this month"
          trend="up"
          icon={HiArrowTrendingUp}
          accent="bg-gradient-to-br from-sky-500 to-cyan-500"
          loading={coursesLoading}
        />
        <StatCard
          label="XP Distributed"
          value={statsLoading ? "—" : `${(totalXP / 1000).toFixed(1)}k`}
          sub="All time"
          trend="up"
          icon={HiSparkles}
          accent="bg-gradient-to-br from-rose-500 to-pink-600"
          loading={statsLoading}
        />
      </div>

      {/* ── Charts row 1: growth + XP breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Student + Enrollment Growth */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Student &amp; Enrollment Growth</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={STUDENT_GROWTH} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(v) => <span className="text-brand-body dark:text-white/60">{v}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="students"
                  name="Students"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  name="Enrollments"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* XP Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>XP by Activity</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={XP_BY_ACTIVITY}
                  cx="50%"
                  cy="45%"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {XP_BY_ACTIVITY.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(v) => <span className="text-brand-body dark:text-white/60">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Course Popularity bar chart ── */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Courses by Enrollment</CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          {coursesLoading ? (
            <ChartSkeleton height={280} />
          ) : courseChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[13px] text-brand-body/60 dark:text-white/40">
              No course data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={courseChartData}
                margin={{ left: -10, right: 8, top: 4, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} strokeOpacity={0.5} vertical={false} />
                <XAxis
                  dataKey="course"
                  tick={{ ...AXIS_TICK, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  angle={-38}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="enrollment"
                  name="Enrollments"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Data tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <TopStudentsTable entries={topStudents} loading={studentsLoading} />
        <TopCoursesTable  courses={courses}     loading={coursesLoading} />
      </div>
    </div>
  );
}
