"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  HiArrowLeft,
  HiVideoCamera,
  HiDocumentText,
  HiLink,
  HiStar,
  HiExclamationTriangle,
  HiArrowPath,
  HiArrowTopRightOnSquare,
  HiCalendar,
  HiCheckCircle,
  HiClock,
  HiXCircle,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useCourse } from "@/hooks/api/useCourse";
import { useMyEnrollments } from "@/hooks/api/useMyEnrollments";
import { useCourseMaterials } from "@/hooks/api/useCourseMaterials";
import { useCourseAssignments } from "@/hooks/api/useCourseAssignments";
import { useEnrollCourse } from "@/hooks/api/useEnrollCourse";
import type { Material, Assignment } from "@/types/api-response";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_CHIP_COLOR = {
  BEGINNER:     "success",
  INTERMEDIATE: "default",
  ADVANCED:     "warning",
} as const;

const LEVEL_GRADIENT = {
  BEGINNER:     "from-emerald-500 to-teal-600",
  INTERMEDIATE: "from-brand-blue to-blue-700",
  ADVANCED:     "from-violet-500 to-purple-700",
} as const;

const MATERIAL_ICON: Record<string, React.ElementType> = {
  VIDEO:    HiVideoCamera,
  PDF:      HiDocumentText,
  DOCUMENT: HiDocumentText,
  LINK:     HiLink,
  CODE:     HiLink,
  IMAGE:    HiDocumentText,
};

function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

function assignmentStatus(assignment: Assignment): "overdue" | "due-soon" | "upcoming" {
  const now  = Date.now();
  const due  = new Date(assignment.dueDate).getTime();
  const diff = (due - now) / (1000 * 60 * 60 * 24);
  if (diff < 0)  return "overdue";
  if (diff <= 3) return "due-soon";
  return "upcoming";
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-brand-border", className)} />;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Header card */}
        <Card className="bg-white overflow-hidden">
          <Skeleton className="h-36 w-full rounded-none" />
          <CardContent className="flex flex-col gap-4 pt-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-16 rounded-lg" />
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-5 w-10 rounded-lg" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Materials */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
        {/* Assignments */}
        <Card className="bg-white">
          <CardContent className="flex flex-col gap-3 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <Card className="bg-white">
          <CardContent className="flex flex-col gap-3 pt-4">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-4 w-16 rounded-lg" />
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="flex flex-col gap-4 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

// ─── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <HiExclamationTriangle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 font-semibold shrink-0 hover:text-red-900 transition-colors"
        >
          <HiArrowPath size={14} />
          Retry
        </button>
      )}
    </div>
  );
}

// ─── MaterialCard ─────────────────────────────────────────────────────────────

function MaterialCard({ material }: { material: Material }) {
  const Icon = MATERIAL_ICON[material.type] ?? HiDocumentText;
  return (
    <a
      href={material.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-md border border-brand-border bg-brand-bg/50 px-4 py-3 hover:bg-brand-bg transition-colors group"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center">
        <Icon size={18} className="text-brand-blue" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-dark truncate">
          {material.title}
        </p>
        {material.description && (
          <p className="text-xs text-brand-body truncate">{material.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {material.xpReward > 0 && (
          <Chip size="sm" color="success" variant="soft" className="text-xs">
            +{material.xpReward} XP
          </Chip>
        )}
        <HiArrowTopRightOnSquare
          size={15}
          className="text-brand-body group-hover:text-brand-blue transition-colors"
        />
      </div>
    </a>
  );
}

// ─── MaterialsSection ─────────────────────────────────────────────────────────

function MaterialsSection({ materials }: { materials: Material[] }) {
  const lectures  = materials.filter((m) => m.type === "VIDEO");
  const readings  = materials.filter(
    (m) => m.type === "PDF" || m.type === "DOCUMENT"
  );
  const resources = materials.filter(
    (m) => m.type === "LINK" || m.type === "CODE" || m.type === "IMAGE"
  );

  const groups = [
    { value: "lectures",  label: "Lectures",  subtitle: "Video lectures", items: lectures },
    { value: "readings",  label: "Readings",  subtitle: "PDFs and documents", items: readings },
    { value: "resources", label: "Resources", subtitle: "Links, code, and tools", items: resources },
  ].filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center rounded-lg border border-dashed border-brand-border">
        <HiDocumentText size={28} className="text-brand-body/50" />
        <p className="text-sm text-brand-body">No materials published yet.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="gap-3">
      {groups.map((group) => (
        <AccordionItem key={group.value} value={group.value}>
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <span>{group.label}</span>
              <span className="text-xs font-normal text-brand-body">
                {group.subtitle}
              </span>
              <Chip size="sm" className="text-xs bg-brand-bg text-brand-body border-none ml-1">
                {group.items.length}
              </Chip>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 py-3">
            <div className="flex flex-col gap-2 px-4">
              {group.items
                .sort((a, b) => a.order - b.order)
                .map((material) => (
                  <MaterialCard key={material._id} material={material} />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// ─── AssignmentsSection ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  overdue:  { label: "Overdue",  color: "text-red-600 bg-red-50 border-red-200",  icon: HiXCircle },
  "due-soon": { label: "Due Soon", color: "text-amber-600 bg-amber-50 border-amber-200", icon: HiClock },
  upcoming: { label: "Upcoming", color: "text-brand-body bg-brand-bg border-brand-border", icon: HiCalendar },
} as const;

function AssignmentsSection({
  assignments,
  courseId,
}: {
  assignments: Assignment[];
  courseId:    string;
}) {
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center rounded-lg border border-dashed border-brand-border">
        <HiCheckCircle size={28} className="text-brand-body/50" />
        <p className="text-sm text-brand-body">No assignments yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-brand-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-brand-bg border-b border-brand-border">
            {["ASSIGNMENT", "DUE DATE", "POINTS", "STATUS", "ACTION"].map(
              (col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-brand-body"
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border bg-white">
          {assignments.map((a) => {
            const status = assignmentStatus(a);
            const cfg    = STATUS_CONFIG[status];
            const Icon   = cfg.icon;
            return (
              <tr key={a._id} className="hover:bg-brand-bg/50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-brand-dark leading-tight">
                      {a.title}
                    </p>
                    <p className="text-xs text-brand-body mt-0.5 capitalize">
                      {a.submissionType.toLowerCase()} submission
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-brand-body">
                  {formatDueDate(a.dueDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="flex items-center gap-1 font-semibold text-brand-dark">
                    <HiStar size={13} className="text-amber-500" />
                    {a.totalPoints} XP
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                      cfg.color
                    )}
                  >
                    <Icon size={12} />
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button asChild size="sm" variant="secondary" className="text-xs">
                    <Link href={`/student/courses/${courseId}/assignments/${a._id}`}>
                      Submit
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function ProgressCard({
  progress,
  xpEarned,
  lastActivity,
}: {
  progress:     number;
  xpEarned:     number;
  lastActivity?: string;
}) {
  const maxXP = Math.max(xpEarned, 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <p className="text-sm font-bold text-brand-dark">Overall Progress</p>
        </CardHeader>
        <Divider />
        <CardContent className="flex flex-col gap-3 pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-body">Completion</span>
            <span className="font-bold text-brand-dark text-lg">{progress}%</span>
          </div>
          <ProgressBar
            value={progress}
            minValue={0}
            maxValue={100}
            aria-label="Course completion"
          >
            <ProgressBarTrack className="h-2.5 rounded-full bg-brand-bg">
              <ProgressBarFill
                className={cn(
                  "h-full rounded-full transition-[width]",
                  progress >= 80
                    ? "bg-emerald-500"
                    : progress >= 40
                    ? "bg-brand-blue"
                    : "bg-amber-500"
                )}
              />
            </ProgressBarTrack>
          </ProgressBar>
          {lastActivity && (
            <p className="text-xs text-brand-body">
              Last activity {lastActivity}
            </p>
          )}
        </CardContent>
      </Card>

      {/* XP */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <p className="text-sm font-bold text-brand-dark">XP Progress</p>
        </CardHeader>
        <Divider />
        <CardContent className="flex flex-col gap-3 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-body">Total Earned</span>
            <span className="text-sm font-bold text-brand-dark">
              {xpEarned} XP
            </span>
          </div>
          <ProgressBar
            value={(xpEarned / maxXP) * 100}
            minValue={0}
            maxValue={100}
            aria-label="XP earned"
          >
            <ProgressBarTrack className="h-2 rounded-full bg-brand-bg">
              <ProgressBarFill className="h-full rounded-full bg-amber-500 transition-[width]" />
            </ProgressBarTrack>
          </ProgressBar>
          <Divider className="my-1" />
          <div className="flex flex-col gap-2 text-xs">
            {[
              { label: "Attendance XP",  icon: HiCheckCircle },
              { label: "Material XP",    icon: HiDocumentText },
              { label: "Assignment XP",  icon: HiStar },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between text-brand-body">
                <span className="flex items-center gap-1.5">
                  <Icon size={12} />
                  {label}
                </span>
                <span className="font-semibold text-brand-dark">—</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const params   = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const router   = useRouter();

  const { course,      isLoading: courseLoading,   error: courseError    } = useCourse(courseId);
  const { enrollments, isLoading: enrollLoading,   refetch               } = useMyEnrollments();
  const { materials,   isLoading: matsLoading,     error: matsError      } = useCourseMaterials(courseId);
  const { assignments, isLoading: assignsLoading,  error: assignsError   } = useCourseAssignments(courseId);
  const { unenroll,    isLoading: isUnenrolling                           } = useEnrollCourse(refetch);

  const [unenrollOpen, setUnenrollOpen] = useState(false);
  const [unenrollError, setUnenrollError] = useState<string | null>(null);

  const enrollment = useMemo(
    () => enrollments.find((e) => e.courseId._id === courseId),
    [enrollments, courseId]
  );

  const isEnrolled = !!enrollment && enrollment.status !== "DROPPED";
  const progress   = enrollment?.progressPercentage ?? 0;
  const xpEarned   = enrollment?.totalXpEarned ?? 0;

  const isLoading = courseLoading || enrollLoading;

  // ── Teacher name ──────────────────────────────────────────────────────────
  const teacherName = useMemo(() => {
    if (!course) return "—";
    const t = course.teachers[0];
    if (!t) return "—";
    if (typeof t === "string") return t;
    return `${t.firstName} ${t.lastName}`;
  }, [course]);

  // ── Unenroll ──────────────────────────────────────────────────────────────
  async function handleUnenroll() {
    if (!enrollment) return;
    setUnenrollError(null);
    try {
      await unenroll(enrollment._id);
      setUnenrollOpen(false);
      router.push("/student/courses");
    } catch (err) {
      setUnenrollError(err instanceof Error ? err.message : "Failed to unenroll");
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-28 rounded-lg" />
        <PageSkeleton />
      </div>
    );
  }

  // ── Course not found ──────────────────────────────────────────────────────
  if (courseError || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <HiExclamationTriangle size={40} className="text-red-400" />
        <div>
          <p className="text-lg font-bold text-brand-dark">Course not found</p>
          <p className="text-sm text-brand-body mt-1">
            {courseError ?? "This course doesn't exist or you don't have access."}
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/student/courses")}>
          Back to My Courses
        </Button>
      </div>
    );
  }

  const gradient = LEVEL_GRADIENT[course.level] ?? LEVEL_GRADIENT.INTERMEDIATE;
  const chipColor = LEVEL_CHIP_COLOR[course.level] ?? "default";

  return (
    <div className="flex flex-col gap-6">

      {/* ── Back navigation ── */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-brand-body hover:text-brand-dark -ml-2"
          onClick={() => router.push("/student/courses")}
        >
          <HiArrowLeft size={15} />
          My Courses
        </Button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main content ── */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Course header card */}
          <Card className="bg-white overflow-hidden">
            {/* Banner */}
            <div className={cn("h-32 bg-gradient-to-br flex items-end p-5", gradient)}>
              <div className="flex items-center gap-2 flex-wrap">
                <Chip
                  size="sm"
                  color={chipColor}
                  variant="soft"
                  className="text-xs bg-white/20 text-white border-white/30"
                >
                  {course.level.charAt(0) +
                    course.level.slice(1).toLowerCase()}
                </Chip>
                {course.semester && (
                  <Chip
                    size="sm"
                    className="text-xs bg-white/20 text-white border-white/30"
                  >
                    {course.semester}
                  </Chip>
                )}
                <Chip
                  size="sm"
                  className="text-xs bg-white/20 text-white border-white/30"
                >
                  {course.category}
                </Chip>
              </div>
            </div>

            {/* Title & meta */}
            <CardHeader className="pb-1">
              <h1 className="text-2xl font-bold text-brand-dark leading-tight">
                {course.title}
              </h1>
              <p className="text-sm text-brand-body mt-1">
                Instructor:{" "}
                <span className="font-semibold text-brand-dark">{teacherName}</span>
                {" · "}
                {course.credits} ECTS
                {" · "}
                {course.estimatedHours}h estimated
              </p>
            </CardHeader>

            {course.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-brand-body leading-relaxed">
                  {course.description}
                </p>
              </CardContent>
            )}

            <Divider />

            {/* Stats row */}
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-6">
                {/* Progress */}
                <div>
                  <p className="text-xs text-brand-body font-medium uppercase tracking-wide mb-2">
                    Progress
                  </p>
                  <ProgressBar
                    value={progress}
                    minValue={0}
                    maxValue={100}
                    aria-label="Course progress"
                  >
                    <ProgressBarTrack className="h-1.5 rounded-full bg-brand-bg">
                      <ProgressBarFill className="h-full rounded-full bg-emerald-500 transition-[width]" />
                    </ProgressBarTrack>
                  </ProgressBar>
                  <p className="text-xl font-bold text-brand-dark mt-2">
                    {progress}%
                  </p>
                </div>

                {/* XP */}
                <div>
                  <p className="text-xs text-brand-body font-medium uppercase tracking-wide mb-2">
                    XP Earned
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <HiStar size={18} className="text-amber-500" />
                    <p className="text-xl font-bold text-brand-dark">{xpEarned}</p>
                  </div>
                  <p className="text-xs text-brand-body mt-0.5">points earned</p>
                </div>

                {/* Enrollment status */}
                <div>
                  <p className="text-xs text-brand-body font-medium uppercase tracking-wide mb-2">
                    Status
                  </p>
                  <div className="mt-2">
                    <Chip
                      size="sm"
                      variant="soft"
                      color={
                        enrollment?.status === "COMPLETED"
                          ? "success"
                          : enrollment?.status === "DROPPED"
                          ? "default"
                          : "default"
                      }
                      className="text-xs"
                    >
                      {enrollment?.status ?? "NOT ENROLLED"}
                    </Chip>
                  </div>
                  <p className="text-xs text-brand-body mt-1.5">
                    {enrollment
                      ? `Enrolled ${new Date(enrollment.enrolledAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Materials section ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-dark">Course Materials</h2>
              {matsLoading && (
                <Skeleton className="h-4 w-16 rounded-lg" />
              )}
            </div>
            {matsError && (
              <ErrorBanner message={`Materials: ${matsError}`} />
            )}
            {matsLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <MaterialsSection materials={materials} />
            )}
          </section>

          {/* ── Assignments section ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-dark">Assignments</h2>
              {!assignsLoading && assignments.length > 0 && (
                <Chip size="sm" className="text-xs bg-brand-bg text-brand-body border-none">
                  {assignments.length} total
                </Chip>
              )}
            </div>
            {assignsError && (
              <ErrorBanner message={`Assignments: ${assignsError}`} />
            )}
            {assignsLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <AssignmentsSection assignments={assignments} courseId={courseId} />
            )}
          </section>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1 flex flex-col gap-4 lg:sticky lg:top-20 h-fit">
          <ProgressCard progress={progress} xpEarned={xpEarned} />

          {/* Course meta card */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <p className="text-sm font-bold text-brand-dark">Course Info</p>
            </CardHeader>
            <Divider />
            <CardContent className="flex flex-col gap-3 pt-3 text-sm">
              {[
                { label: "Campus",     value: course.campus },
                { label: "Language",   value: course.language ?? "English" },
                { label: "Level",      value: course.level.charAt(0) + course.level.slice(1).toLowerCase() },
                { label: "Credits",    value: `${course.credits} ECTS` },
                { label: "Estimated",  value: `${course.estimatedHours}h` },
                {
                  label: "Capacity",
                  value: `${course.enrollmentCount} / ${course.maxCapacity}`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-brand-body">{label}</span>
                  <span className="font-semibold text-brand-dark text-right">
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prerequisites / objectives */}
          {course.metadata?.objectives && course.metadata.objectives.length > 0 && (
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <p className="text-sm font-bold text-brand-dark">Learning Objectives</p>
              </CardHeader>
              <Divider />
              <CardContent className="pt-3">
                <ul className="flex flex-col gap-2">
                  {course.metadata.objectives.slice(0, 4).map((obj, i) => (
                    <li key={i} className="flex gap-2 text-xs text-brand-body">
                      <span className="text-brand-blue font-bold shrink-0">{i + 1}.</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Unenroll */}
          {isEnrolled && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setUnenrollOpen(true)}
            >
              Unenroll from Course
            </Button>
          )}
        </div>
      </div>

      {/* ── Unenroll dialog ── */}
      <Dialog
        open={unenrollOpen}
        onOpenChange={(open) => {
          if (!open) { setUnenrollOpen(false); setUnenrollError(null); }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Unenroll from Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to unenroll from{" "}
              <span className="font-semibold text-brand-dark">{course.title}</span>?
              Your progress and XP earned will be lost.
            </DialogDescription>
          </DialogHeader>
          {unenrollError && (
            <p className="text-sm text-red-600 -mt-2">{unenrollError}</p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={isUnenrolling}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleUnenroll}
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
