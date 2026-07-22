"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Teacher Class Analytics
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Displays charts monitoring class grade averages and homework submission rates.
 * 
 * WHY IT EXISTS:
 * Helps teachers identify students needing support.
 * 
 * HOW IT WORKS (Technical Overview):
 * Computes analytics filters to plot performance trends.
 * ============================================================================
 */

import { useState, useEffect, useMemo } from "react";
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
  HiChartBar,
  HiUsers,
  HiCalendarDays,
  HiSparkles,
  HiClipboardDocumentCheck,
  HiArrowTrendingUp,
} from "react-icons/hi2";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/api/useCourses";
import { useCourseAssignments } from "@/hooks/api/useCourseAssignments";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/api-response";

// ── Deterministic seeded RNG ──────────────────────────────────────────────────

// Builds a repeatable "random" number generator seeded from a course ID, so
// this page's demo data (students, charts) always looks the same for a
// given course instead of changing on every reload.
function makeSeed(courseId: string) {
  let s = courseId.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  return () => { s = (s * 1664525 + 1013904223) | 0; return (s >>> 0) / 4294967296; };
}

// ── Mock student generation ───────────────────────────────────────────────────

const FIRST = ["Alice","Bob","Carol","David","Eva","Frank","Grace","Henry","Iris","Jake","Karen","Leo","Maya","Noah","Olivia","Paul","Quinn","Rachel","Sam","Tara"];
const LAST  = ["Johnson","Martinez","White","Chen","Gonzalez","Brown","Davis","Wilson","Taylor","Anderson","Thomas","Moore","Jackson","Harris","Thompson"];

type StudentStatus = "excellent" | "good" | "at risk";

interface MockStudent {
  id:          string;
  name:        string;
  initials:    string;
  attendance:  number;
  xp:          number;
  assignments: number;
  totalAsgns:  number;
  status:      StudentStatus;
}

// Makes up a realistic-looking list of students with attendance/XP/assignment
// stats for a course (there's no real per-student analytics API yet, so
// this fills the table with consistent demo data).
function genStudents(courseId: string, count: number, totalAsgns: number): MockStudent[] {
  const rng = makeSeed(courseId);
  return Array.from({ length: Math.min(count, 25) }, (_, i) => {
    const f = FIRST[Math.floor(rng() * FIRST.length)];
    const l = LAST[Math.floor(rng() * LAST.length)];
    const attendance  = Math.round(40 + rng() * 60);
    const xp          = Math.round(50 + rng() * 450);
    const assignments = Math.min(totalAsgns, Math.round(rng() * (totalAsgns + 1)));
    const status: StudentStatus =
      attendance >= 80 && xp >= 250 && assignments >= Math.ceil(totalAsgns * 0.8) ? "excellent" :
      attendance >= 60 && xp >= 100 && assignments >= Math.ceil(totalAsgns * 0.5) ? "good" :
      "at risk";
    return {
      id: `${courseId}-s${i}`,
      name: `${f} ${l}`,
      initials: `${f[0]}${l[0]}`,
      attendance,
      xp,
      assignments,
      totalAsgns: totalAsgns || 1,
      status,
    };
  });
}

// ── Mock chart data ───────────────────────────────────────────────────────────

// Makes up 12 weeks of attendance percentages for the attendance chart.
function genAttendanceData(courseId: string) {
  const rng = makeSeed(courseId + "att");
  return Array.from({ length: 12 }, (_, i) => ({
    week:       `Wk ${i + 1}`,
    attendance: Math.round(55 + rng() * 40),
  }));
}

const XP_ACTIVITY_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

// Makes up the XP-by-activity breakdown for the donut chart.
function genXPData(courseId: string) {
  const rng = makeSeed(courseId + "xp");
  return [
    { name: "Attendance",   value: Math.round(1500 + rng() * 1000) },
    { name: "Assignments",  value: Math.round(2500 + rng() * 2000) },
    { name: "Materials",    value: Math.round(800  + rng() * 700)  },
    { name: "Quizzes",      value: Math.round(600  + rng() * 600)  },
    { name: "Participation",value: Math.round(400  + rng() * 400)  },
  ];
}

// Makes up a completion percentage for each assignment title, for the
// "Assignment Completion Rate" bar chart.
function genAssignmentData(titles: string[], courseId: string) {
  const rng = makeSeed(courseId + "comp");
  return titles.map((t) => ({
    assignment: t.length > 18 ? `${t.slice(0, 18)}…` : t,
    completion: Math.round(45 + rng() * 52),
    fullTitle:  t,
  }));
}

// ── Derived stats ─────────────────────────────────────────────────────────────

// Averages the class's attendance, XP, and assignment completion from the
// (demo) per-student data, for the overview stat tiles.
function deriveStats(students: MockStudent[]) {
  if (!students.length) return { avgAttendance: 0, avgXP: 0, completionPct: 0 };
  const avgAttendance = Math.round(students.reduce((s, st) => s + st.attendance, 0) / students.length);
  const avgXP         = Math.round(students.reduce((s, st) => s + st.xp,         0) / students.length);
  const completionPct = Math.round(
    (students.reduce((s, st) => s + st.assignments / st.totalAsgns, 0) / students.length) * 100,
  );
  return { avgAttendance, avgXP, completionPct };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const GRID_STROKE = "var(--color-brand-border, #e5e7eb)";
const AXIS_TICK   = { fontSize: 11 };

// The hover popup shown over a point on any of the charts on this page.
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 shadow-lg text-[13px]">
      {label && <p className="font-semibold text-brand-dark dark:text-white mb-1 text-[17px]">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-brand-body dark:text-white/70 text-[17px]">
          <span style={{ color: p.color ?? "#3b82f6" }} className="mr-1.5">●</span>
          {p.name}: <span className="font-semibold text-brand-dark dark:text-white">{p.value}{p.name.toLowerCase().includes("attendance") || p.name.toLowerCase().includes("completion") ? "%" : ""}</span>
        </p>
      ))}
    </div>
  );
}

// A grey placeholder block shown while a chart's data is still loading.
function ChartSkeleton({ height = 280 }: { height?: number }) {
  return <div className="w-full rounded-lg bg-brand-bg dark:bg-white/5 animate-pulse" style={{ height }} />;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

// One top-row summary tile (e.g. "Avg Attendance: 82%, On track").
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  loading,
}: {
  label:    string;
  value:    string | number;
  sub?:     string;
  icon:     React.ElementType;
  accent:   string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        {loading ? (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-3 w-24 rounded bg-brand-border dark:bg-white/10" />
            <div className="h-8 w-16 rounded bg-brand-border dark:bg-white/10" />
            <div className="h-3 w-28 rounded bg-brand-border dark:bg-white/10" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="text-[13px] font-medium text-brand-body dark:text-white/55 uppercase tracking-wide">
                {label}
              </p>
              <p className="text-[29px] font-black text-brand-dark dark:text-white leading-none">
                {value}
              </p>
              {sub && (
                <p className="text-[13px] text-brand-body/60 dark:text-white/40">{sub}</p>
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

// ── Status chip ───────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<StudentStatus, "success" | "default" | "warning"> = {
  excellent: "success",
  good:      "default",
  "at risk": "warning",
};

const STATUS_LABEL: Record<StudentStatus, string> = {
  excellent: "Excellent",
  good:      "Good",
  "at risk": "At Risk",
};

// ── Student progress table ────────────────────────────────────────────────────

// The table listing every student in the selected course with their
// attendance, XP, assignment completion, and an overall status chip.
function StudentProgressTable({ students, totalAsgns, loading }: { students: MockStudent[]; totalAsgns: number; loading: boolean }) {
  const TH = "px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-brand-body/60 dark:text-white/40 text-left whitespace-nowrap";
  const TD = "px-4 py-3 text-[13px]";

  const AVATAR_COLORS = ["bg-brand-blue","bg-emerald-500","bg-violet-500","bg-amber-500","bg-rose-500","bg-cyan-500"];

  if (loading) {
    return (
      <div className="space-y-2 px-4 py-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-brand-border/40 dark:bg-white/5" />
        ))}
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
        <HiUsers size={32} className="text-brand-body/20 dark:text-white/10" />
        <p className="text-[15px] font-semibold text-brand-body dark:text-white/60">No enrollment data</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-brand-border dark:border-white/8">
            <th className={TH}>Student</th>
            <th className={TH}>Attendance</th>
            <th className={TH}>XP Earned</th>
            <th className={TH}>Assignments</th>
            <th className={TH}>Progress</th>
            <th className={TH}>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const progressPct = totalAsgns > 0 ? (s.assignments / totalAsgns) * 100 : 0;
            return (
              <tr
                key={s.id}
                className="border-b border-brand-border/40 dark:border-white/5 hover:bg-brand-bg dark:hover:bg-white/4 transition-colors"
              >
                {/* Name + avatar */}
                <td className={TD}>
                  <div className="flex items-center gap-2.5">
                    <span className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white", AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                      {s.initials}
                    </span>
                    <span className="font-medium text-brand-dark dark:text-white truncate max-w-[140px]">{s.name}</span>
                  </div>
                </td>

                {/* Attendance */}
                <td className={TD}>
                  <span className={cn(
                    "font-bold tabular-nums",
                    s.attendance >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                    s.attendance >= 60 ? "text-amber-600 dark:text-amber-400" :
                    "text-red-500 dark:text-red-400",
                  )}>
                    {s.attendance}%
                  </span>
                </td>

                {/* XP */}
                <td className={cn(TD, "font-bold tabular-nums text-brand-blue")}>{s.xp.toLocaleString()}</td>

                {/* Assignments */}
                <td className={cn(TD, "tabular-nums text-brand-body dark:text-white/70")}>
                  {s.assignments} / {totalAsgns}
                </td>

                {/* Progress bar */}
                <td className={cn(TD, "w-36")}>
                  <ProgressBarRoot
                    value={progressPct}
                    minValue={0}
                    maxValue={100}
                    aria-label={`${s.name} progress`}
                    color={
                      progressPct >= 80 ? "success" :
                      progressPct >= 50 ? "accent"  :
                      "warning"
                    }
                    size="sm"
                  >
                    <ProgressBarTrack>
                      <ProgressBarFill />
                    </ProgressBarTrack>
                  </ProgressBarRoot>
                </td>

                {/* Status chip */}
                <td className={TD}>
                  <Chip color={STATUS_COLOR[s.status]} variant="soft" size="sm">
                    {STATUS_LABEL[s.status]}
                  </Chip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

// The teacher's "Course Analytics" page — pick one of your courses, then
// see attendance/XP/completion charts and a per-student progress table for it.
export default function TeacherAnalyticsPage() {
  const { user }                               = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses({ limit: 200 });
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const teacherCourses = useMemo(
    () =>
      courses.filter((c: Course) =>
        c.teachers.some((t) =>
          typeof t === "string" ? t === user?._id : t._id === user?._id
        )
      ),
    [courses, user?._id],
  );

  useEffect(() => {
    if (!selectedCourseId && teacherCourses.length > 0) {
      setSelectedCourseId(teacherCourses[0]._id);
    }
  }, [teacherCourses, selectedCourseId]);

  const selectedCourse = teacherCourses.find((c) => c._id === selectedCourseId);
  const { assignments, isLoading: asgnLoading } = useCourseAssignments(selectedCourseId);

  // All chart/table data is derived deterministically from courseId
  const attendanceData  = useMemo(() => selectedCourseId ? genAttendanceData(selectedCourseId)  : [], [selectedCourseId]);
  const xpData          = useMemo(() => selectedCourseId ? genXPData(selectedCourseId)           : [], [selectedCourseId]);
  const assignmentData  = useMemo(() => {
    const titles = assignments.length
      ? assignments.map((a) => a.title)
      : [`Assignment 1`, `Assignment 2`, `Assignment 3`, `Quiz 1`, `Final Project`];
    return selectedCourseId ? genAssignmentData(titles, selectedCourseId) : [];
  }, [assignments, selectedCourseId]);

  const students = useMemo(
    () =>
      selectedCourse
        ? genStudents(
            selectedCourse._id,
            selectedCourse.enrollmentCount || 15,
            assignments.length || 5,
          )
        : [],
    [selectedCourse, assignments.length],
  );

  const { avgAttendance, avgXP, completionPct } = useMemo(
    () => deriveStats(students),
    [students, attendanceData],
  );

  const isLoading = coursesLoading;

  return (
    <div className="max-w-screen-xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center shrink-0">
            <HiChartBar size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">Course Analytics</h1>
        </div>
        <p className="text-[15px] text-brand-body dark:text-white/55 ml-12">
          Detailed performance insights for your courses.
        </p>
      </div>

      {/* ── Course selector ── */}
      <div className="mb-7">
        <label className="block text-[11px] font-semibold text-brand-body/60 dark:text-white/40 uppercase tracking-wide mb-1.5">
          Select Course
        </label>
        {coursesLoading ? (
          <div className="h-10 w-72 rounded-md bg-brand-border/40 dark:bg-white/5 animate-pulse" />
        ) : (
          <div className="w-72">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="dark:bg-slate-800 dark:border-white/10 dark:text-white">
                <SelectValue placeholder="Select a course…" />
              </SelectTrigger>
              <SelectContent>
                {teacherCourses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* ── No course placeholder ── */}
      {!selectedCourseId && !coursesLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <HiChartBar size={40} className="text-brand-body/20 dark:text-white/10" />
            <p className="text-[16px] font-semibold text-brand-body dark:text-white/60">
              Select a course to view analytics
            </p>
          </CardContent>
        </Card>
      )}

      {selectedCourseId && (
        <>
          {/* ── Overview cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Enrollments"
              value={isLoading ? "—" : (selectedCourse?.enrollmentCount ?? 0)}
              sub={`of ${selectedCourse?.maxCapacity ?? "—"} capacity`}
              icon={HiUsers}
              accent="bg-gradient-to-br from-brand-blue to-indigo-600"
              loading={isLoading}
            />
            <StatCard
              label="Avg Attendance"
              value={`${avgAttendance}%`}
              sub={avgAttendance >= 75 ? "On track" : "Needs attention"}
              icon={HiCalendarDays}
              accent="bg-gradient-to-br from-emerald-500 to-teal-600"
              loading={isLoading}
            />
            <StatCard
              label="Avg XP Earned"
              value={avgXP.toLocaleString()}
              sub="per student"
              icon={HiSparkles}
              accent="bg-gradient-to-br from-amber-500 to-orange-500"
              loading={isLoading}
            />
            <StatCard
              label="Assignment Completion"
              value={`${completionPct}%`}
              sub={completionPct >= 80 ? "Excellent" : completionPct >= 60 ? "Good" : "Needs follow-up"}
              icon={HiClipboardDocumentCheck}
              accent="bg-gradient-to-br from-violet-500 to-purple-600"
              loading={isLoading}
            />
          </div>

          {/* ── Charts row: attendance + XP side-by-side on lg ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Attendance trend (wide) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HiCalendarDays size={17} className="text-emerald-500" />
                  Attendance Pattern (by Week)
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                {isLoading ? <ChartSkeleton /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={attendanceData} margin={{ left: -12, right: 6, top: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} strokeOpacity={0.5} vertical={false} />
                      <XAxis dataKey="week" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                      <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="attendance" name="Attendance" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* XP distribution donut */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HiSparkles size={17} className="text-amber-500" />
                  XP by Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                {isLoading ? <ChartSkeleton /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={xpData}
                        cx="50%"
                        cy="44%"
                        innerRadius={48}
                        outerRadius={82}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {xpData.map((_, i) => (
                          <Cell key={i} fill={XP_ACTIVITY_COLORS[i % XP_ACTIVITY_COLORS.length]} stroke="transparent" />
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Assignment completion bar chart ── */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HiClipboardDocumentCheck size={17} className="text-brand-blue" />
                Assignment Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              {isLoading || asgnLoading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={assignmentData}
                    margin={{ left: -12, right: 6, top: 4, bottom: 64 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} strokeOpacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="assignment"
                      tick={{ ...AXIS_TICK, fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      angle={-35}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="completion" name="Completion" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* ── Student progress table ── */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <HiArrowTrendingUp size={17} className="text-violet-500" />
                  Student Progress
                </CardTitle>
                <div className="flex gap-2 text-[12px]">
                  {(["excellent","good","at risk"] as StudentStatus[]).map((s) => (
                    <span key={s} className="flex items-center gap-1">
                      <Chip color={STATUS_COLOR[s]} variant="soft" size="sm">{STATUS_LABEL[s]}</Chip>
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>

            <div className="h-px bg-brand-border dark:bg-white/8" />

            <CardContent className="px-0 pb-4">
              <StudentProgressTable
                students={students}
                totalAsgns={assignments.length || 5}
                loading={isLoading}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
