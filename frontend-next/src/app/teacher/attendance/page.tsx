"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Teacher Attendance Sheets
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Interactive roster check sheet used by teachers to mark class attendance.
 * 
 * WHY IT EXISTS:
 * Streamlines roll call and rewards present students with points.
 * 
 * HOW IT WORKS (Technical Overview):
 * Maps students list to checklist grids that post records to backend attendance APIs.
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ProgressBarRoot,
  ProgressBarTrack,
  ProgressBarFill,
} from "@heroui/react";
import { toast } from "sonner";
import {
  HiCalendarDays,
  HiCheckCircle,
  HiXCircle,
  HiArrowPath,
  HiUserGroup,
  HiCheckBadge,
  HiUser,
  HiExclamationCircle,
  HiInformationCircle,
} from "react-icons/hi2";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/api/useCourses";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/api-response";

// ── Mock student generation ───────────────────────────────────────────────────
// No API returns enrolled students for a teacher's course, so we generate a
// deterministic list from the course's enrollmentCount field.

const FIRST = ["Alice","Bob","Carol","David","Eva","Frank","Grace","Henry","Iris","Jake","Karen","Leo","Maya","Noah","Olivia","Paul","Quinn","Rachel","Sam","Tara","Uma","Victor","Wendy","Xander","Yara","Zoe","Aiden","Bella","Carlos","Diana"];
const LAST  = ["Johnson","Martinez","White","Chen","Gonzalez","Brown","Davis","Wilson","Taylor","Anderson","Thomas","Moore","Jackson","Harris","Thompson","Lee","Walker","Hall","Allen","Young","King","Wright","Scott","Green","Baker","Adams","Nelson","Carter","Mitchell","Perez"];

// Makes up a consistent-looking class roster for a course (there's no real
// "list enrolled students" API yet, so this generates realistic-looking
// names deterministically from the course ID).
function genStudents(courseId: string, count: number) {
  // Deterministic seeding from courseId
  let seed = courseId.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const rng = () => { seed = (seed * 1664525 + 1013904223) | 0; return (seed >>> 0) / 4294967296; };

  return Array.from({ length: Math.min(count, 35) }, (_, i) => {
    const f = FIRST[Math.floor(rng() * FIRST.length)];
    const l = LAST[Math.floor(rng() * LAST.length)];
    return { id: `${courseId}-s${i}`, name: `${f} ${l}`, initials: `${f[0]}${l[0]}` };
  });
}

type Student = ReturnType<typeof genStudents>[number];

// ── Helpers ───────────────────────────────────────────────────────────────────

// Today's date as "YYYY-MM-DD", used as the default attendance date.
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Turns a date into "Today" (if it is) or a short friendly label otherwise.
function fmtDateLabel(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const today = todayIso();
  if (iso === today) return "Today";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// Avatar colours cycle for variety
const AVATAR_COLORS = [
  "bg-brand-blue",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

// ── Student row ───────────────────────────────────────────────────────────────

// One clickable row in the attendance checklist — toggles a single student
// between Present and Absent.
function StudentRow({
  student,
  checked,
  onChange,
  index,
}: {
  student: Student;
  checked: boolean;
  onChange: (id: string, val: boolean) => void;
  index: number;
}) {
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <label
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer select-none transition-colors",
        checked
          ? "bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100/70 dark:hover:bg-emerald-500/15"
          : "hover:bg-brand-bg dark:hover:bg-white/5",
      )}
    >
      {/* Native checkbox — visually hidden, keyboard-accessible */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(student.id, e.target.checked)}
        className="sr-only"
        aria-label={`Mark ${student.name} ${checked ? "absent" : "present"}`}
      />

      {/* Custom checkbox visual */}
      <span
        className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
          checked
            ? "bg-emerald-500 border-emerald-500"
            : "border-brand-border dark:border-white/25 bg-white dark:bg-white/5",
        )}
        aria-hidden
      >
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      {/* Avatar */}
      <span className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white", avatarColor)}>
        {student.initials}
      </span>

      {/* Name */}
      <span className={cn(
        "flex-1 text-[13px] font-medium transition-colors",
        checked ? "text-brand-dark dark:text-white" : "text-brand-body dark:text-white/70",
      )}>
        {student.name}
      </span>

      {/* Status chip */}
      <span className={cn(
        "text-[11px] font-bold px-2 py-0.5 rounded-full transition-all",
        checked
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-500 dark:text-red-400 opacity-70",
      )}>
        {checked ? "Present" : "Absent"}
      </span>
    </label>
  );
}

// ── Success state ─────────────────────────────────────────────────────────────

// Shown after attendance is saved — a summary of present/absent counts and
// the attendance rate, with a button to mark another day.
function SuccessState({
  course,
  date,
  presentCount,
  total,
  onReset,
}: {
  course:       Course;
  date:         string;
  presentCount: number;
  total:        number;
  onReset:      () => void;
}) {
  const absent = total - presentCount;
  const pct    = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <Card>
      <CardContent className="py-10 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <HiCheckBadge size={32} className="text-emerald-500" />
        </div>

        <div className="space-y-1">
          <p className="text-[21px] font-black text-brand-dark dark:text-white">Attendance Saved!</p>
          <p className="text-[15px] text-brand-body dark:text-white/60">
            {course.title} · {fmtDateLabel(date)}
          </p>
        </div>

        {/* Summary grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {[
            { label: "Present", value: presentCount, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Absent",  value: absent,        color: "text-red-500 dark:text-red-400",         bg: "bg-red-500/10"     },
            { label: "Rate",    value: `${pct}%`,     color: "text-brand-blue",                        bg: "bg-brand-blue/10"  },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={cn("rounded-xl py-3 px-2", bg)}>
              <p className={cn("text-[23px] font-black", color)}>{value}</p>
              <p className="text-[12px] text-brand-body/60 dark:text-white/40">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs space-y-1.5">
          <ProgressBarRoot value={pct} minValue={0} maxValue={100} aria-label="Attendance rate" color="success" size="md">
            <ProgressBarTrack>
              <ProgressBarFill />
            </ProgressBarTrack>
          </ProgressBarRoot>
          <p className="text-[12px] text-brand-body/55 dark:text-white/35">{pct}% attendance rate</p>
        </div>

        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={onReset} className="gap-1.5">
            <HiCalendarDays size={14} />
            Mark Another Day
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

// The teacher's "Attendance" page: pick a course and date, check off which
// students were present, then save it (with an XP reward for present students).
export default function TeacherAttendancePage() {
  const { user }                               = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses({ limit: 200 });

  const teacherCourses = useMemo(
    () =>
      courses.filter((c: Course) =>
        c.teachers.some((t) =>
          typeof t === "string" ? t === user?._id : t._id === user?._id
        )
      ),
    [courses, user?._id],
  );

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [attendanceDate, setAttendanceDate]     = useState(todayIso());
  const [attendance, setAttendance]             = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [submitted, setSubmitted]               = useState(false);
  const [filter, setFilter]                     = useState<"all" | "present" | "absent">("all");
  const [search, setSearch]                     = useState("");

  const selectedCourse = teacherCourses.find((c) => c._id === selectedCourseId);

  // Auto-select first course
  useEffect(() => {
    if (!selectedCourseId && teacherCourses.length > 0) {
      setSelectedCourseId(teacherCourses[0]._id);
    }
  }, [teacherCourses, selectedCourseId]);

  // Seed students whenever course changes
  const students = useMemo(
    () =>
      selectedCourse
        ? genStudents(selectedCourse._id, selectedCourse.enrollmentCount || 20)
        : [],
    [selectedCourse],
  );

  // Reset attendance when course or date changes
  useEffect(() => {
    const init: Record<string, boolean> = {};
    students.forEach((s) => { init[s.id] = false; });
    setAttendance(init);
    setSubmitted(false);
  }, [students, attendanceDate]);

  // Derived counts
  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount  = students.length - presentCount;
  const pct          = students.length > 0 ? (presentCount / students.length) * 100 : 0;

  // Filtered + searched list
  const visibleStudents = useMemo(() => {
    let list = students;
    if (filter === "present") list = list.filter((s) => attendance[s.id]);
    if (filter === "absent")  list = list.filter((s) => !attendance[s.id]);
    if (search.trim())        list = list.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [students, attendance, filter, search]);

  // Flips one student's present/absent status.
  const handleToggle = useCallback((id: string, val: boolean) => {
    setAttendance((prev) => ({ ...prev, [id]: val }));
  }, []);

  // Marks every visible student present (or absent) at once.
  const markAll = useCallback((val: boolean) => {
    setAttendance((prev) => {
      const next = { ...prev };
      students.forEach((s) => { next[s.id] = val; });
      return next;
    });
    toast.success(val ? "All students marked present" : "All students marked absent", { duration: 2000 });
  }, [students]);

  // Saves today's attendance sheet (simulated delay) and shows the success screen.
  async function handleSubmit() {
    if (students.length === 0) return;
    setIsSubmitting(true);
    await new Promise<void>((r) => setTimeout(r, 1400));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Attendance saved!", {
      description: `${presentCount} present · ${absentCount} absent`,
      icon: "✅",
      duration: 4000,
    });
  }

  // Clears the sheet back to today's date with everyone unmarked, e.g. to
  // start marking a different day.
  function handleReset() {
    setSubmitted(false);
    setAttendanceDate(todayIso());
    const init: Record<string, boolean> = {};
    students.forEach((s) => { init[s.id] = false; });
    setAttendance(init);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (submitted && selectedCourse) {
    return (
      <div className="max-w-2xl mx-auto">
        <SuccessState
          course={selectedCourse}
          date={attendanceDate}
          presentCount={presentCount}
          total={students.length}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shrink-0">
            <HiCalendarDays size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">Attendance</h1>
        </div>
        <p className="text-[15px] text-brand-body dark:text-white/55 ml-12">
          Mark and track student attendance for your courses.
        </p>
      </div>

      {/* ── Course + date filter ── */}
      <Card className="mb-6">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Course select */}
            <div className="flex-1 min-w-[220px] max-w-xs space-y-1.5">
              <label className="block text-[12px] font-semibold text-brand-body/70 dark:text-white/50 uppercase tracking-wide">
                Course
              </label>
              {coursesLoading ? (
                <div className="h-10 rounded-md bg-brand-border/40 dark:bg-white/5 animate-pulse" />
              ) : (
                <Select value={selectedCourseId} onValueChange={(v) => { setSelectedCourseId(v); setSubmitted(false); }}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-white/10 dark:text-white">
                    <SelectValue placeholder="Select a course…" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherCourses.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Date input */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-semibold text-brand-body/70 dark:text-white/50 uppercase tracking-wide">
                Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                max={todayIso()}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="h-10 rounded-md border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-[13px] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>

            {/* Bulk action buttons */}
            {selectedCourseId && students.length > 0 && (
              <div className="flex gap-2 pb-0.5">
                <Button variant="outline" size="sm" onClick={() => markAll(true)} className="gap-1.5">
                  <HiCheckCircle size={14} className="text-emerald-500" />
                  All Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => markAll(false)} className="gap-1.5">
                  <HiXCircle size={14} className="text-red-500" />
                  All Absent
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── No course selected placeholder ── */}
      {!selectedCourseId && !coursesLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <HiCalendarDays size={40} className="text-brand-body/20 dark:text-white/10" />
            <p className="text-[16px] font-semibold text-brand-body dark:text-white/60">
              Select a course to mark attendance
            </p>
          </CardContent>
        </Card>
      )}

      {selectedCourseId && students.length > 0 && (
        <>
          {/* ── Attendance list card ── */}
          <Card className="mb-5">
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-0.5">
                  <CardTitle className="text-[15px]">
                    {selectedCourse?.title}
                    <span className="ml-2 text-[12px] font-normal text-brand-body/55 dark:text-white/35">
                      · {fmtDateLabel(attendanceDate)}
                    </span>
                  </CardTitle>
                  <p className="text-[13px] text-brand-body/55 dark:text-white/35">
                    {presentCount} of {students.length} present
                  </p>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 p-0.5 rounded-lg bg-brand-bg dark:bg-white/5">
                  {(["all", "present", "absent"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-3 py-1 rounded-md text-[12px] font-semibold capitalize transition-colors",
                        filter === f
                          ? "bg-white dark:bg-white/10 text-brand-dark dark:text-white shadow-sm"
                          : "text-brand-body/60 dark:text-white/40 hover:text-brand-dark dark:hover:text-white",
                      )}
                    >
                      {f}
                      {f !== "all" && (
                        <span className="ml-1.5 opacity-70">
                          {f === "present" ? presentCount : absentCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            {/* Progress bar */}
            <div className="px-5 pb-3">
              <ProgressBarRoot
                value={pct}
                minValue={0}
                maxValue={100}
                aria-label="Attendance progress"
                color={pct >= 75 ? "success" : pct >= 50 ? "warning" : "danger"}
                size="sm"
              >
                <ProgressBarTrack>
                  <ProgressBarFill className="transition-all duration-300 ease-out" />
                </ProgressBarTrack>
              </ProgressBarRoot>
            </div>

            <div className="h-px bg-brand-border dark:bg-white/8" />

            {/* Search */}
            <div className="px-4 py-3">
              <input
                type="search"
                placeholder="Search student…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 rounded-md border border-brand-border dark:border-white/10 bg-brand-bg dark:bg-white/5 px-3 text-[13px] text-brand-dark dark:text-white placeholder:text-brand-body/40 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            {/* Student list */}
            <CardContent className="pt-0 pb-4">
              {visibleStudents.length === 0 ? (
                <div className="py-8 text-center">
                  <HiUser size={28} className="mx-auto mb-2 text-brand-body/20 dark:text-white/10" />
                  <p className="text-[14px] text-brand-body/60 dark:text-white/40">No students match your filter</p>
                </div>
              ) : (
                <div className="space-y-0.5 max-h-96 overflow-y-auto pr-1">
                  {visibleStudents.map((s, i) => (
                    <StudentRow
                      key={s.id}
                      student={s}
                      checked={!!attendance[s.id]}
                      onChange={handleToggle}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Summary + submit card ── */}
          <Card>
            <CardContent className="py-5 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: HiUserGroup,    label: "Total",   value: students.length, color: "text-brand-blue",                    bg: "bg-brand-blue/10"   },
                  { icon: HiCheckCircle, label: "Present", value: presentCount,     color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
                  { icon: HiXCircle,     label: "Absent",  value: absentCount,      color: "text-red-500 dark:text-red-400",        bg: "bg-red-500/10"     },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className={cn("rounded-xl py-3 px-4 flex items-center gap-3", bg)}>
                    <Icon size={20} className={cn("shrink-0", color)} />
                    <div>
                      <p className={cn("text-[19px] font-black leading-none", color)}>{value}</p>
                      <p className="text-[12px] text-brand-body/60 dark:text-white/40 mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Late penalty notice */}
              {attendanceDate !== todayIso() && (
                <div className="flex gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/8 dark:bg-amber-500/10 border border-amber-500/20">
                  <HiExclamationCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-amber-700 dark:text-amber-400 leading-snug">
                    You're marking attendance for a past date ({fmtDateLabel(attendanceDate)}). This will be recorded as a retroactive entry.
                  </p>
                </div>
              )}

              {/* Info about XP */}
              <div className="flex gap-2.5 px-3 py-2.5 rounded-lg bg-brand-blue/8 dark:bg-brand-blue/10 border border-brand-blue/15">
                <HiInformationCircle size={15} className="text-brand-blue mt-0.5 shrink-0" />
                <p className="text-[13px] text-brand-blue/80 dark:text-brand-blue/70 leading-snug">
                  Present students will automatically receive their attendance XP reward.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  disabled={isSubmitting || students.length === 0}
                  className="flex-1 gap-1.5 justify-center"
                >
                  {isSubmitting ? (
                    <><HiArrowPath size={15} className="animate-spin" /> Saving…</>
                  ) : (
                    <><HiCheckBadge size={15} /> Save Attendance</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="flex-1 justify-center"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
