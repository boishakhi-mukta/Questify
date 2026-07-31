"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Student Course Materials
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * Shows a course's study materials and assignments — the actual class
 * content — for a student who's already enrolled.
 *
 * WHY IT EXISTS:
 * The place a student lands after clicking "View Course," to get straight
 * to coursework rather than course-catalog-style details.
 *
 * HOW IT WORKS (Technical Overview):
 * Pulls materials and assignments for the course ID in the URL.
 * ============================================================================
 */

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Chip, Skeleton } from "@heroui/react";
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
import { useCourse } from "@/hooks/api/useCourse";
import { useCourseMaterials } from "@/hooks/api/useCourseMaterials";
import { useCourseAssignments } from "@/hooks/api/useCourseAssignments";
import type { Material, Assignment } from "@/types/api-response";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MATERIAL_ICON: Record<string, React.ElementType> = {
  VIDEO:    HiVideoCamera,
  PDF:      HiDocumentText,
  DOCUMENT: HiDocumentText,
  LINK:     HiLink,
  CODE:     HiLink,
  IMAGE:    HiDocumentText,
};

// Turns a raw date string into a short, friendly format (e.g. "Jun 12, 2026").
function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

// Works out whether an assignment's due date has already passed, is coming
// up within 3 days, or is still further away.
function assignmentStatus(assignment: Assignment): "overdue" | "due-soon" | "upcoming" {
  const now  = Date.now();
  const due  = new Date(assignment.dueDate).getTime();
  const diff = (due - now) / (1000 * 60 * 60 * 24);
  if (diff < 0)  return "overdue";
  if (diff <= 3) return "due-soon";
  return "upcoming";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

// A grey placeholder layout shown while the course's materials/assignments
// are still loading.
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-8 w-1/2 rounded-lg" />
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
  );
}

// ─── Error banner ──────────────────────────────────────────────────────────────

// A small red banner shown when a piece of the page (materials or
// assignments) failed to load, with an optional retry link.
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

// One clickable study-material row (opens the material in a new tab), with
// an icon matching its type and its XP reward if any.
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
        <p className="text-[15px] font-semibold text-brand-dark truncate">
          {material.title}
        </p>
        {material.description && (
          <p className="text-[13px] text-brand-body truncate">{material.description}</p>
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

// Groups the course's materials into Lectures/Readings/Resources and shows
// them as expandable accordion sections.
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
        <p className="text-[15px] text-brand-body">No materials published yet.</p>
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

// The table listing this course's assignments, their due dates, points, and
// status, with a "Submit" button linking to each one.
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
        <p className="text-[15px] text-brand-body">No assignments yet.</p>
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
                    <p className="font-semibold text-brand-dark leading-tight text-[17px]">
                      {a.title}
                    </p>
                    <p className="text-[13px] text-brand-body mt-0.5 capitalize">
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

// ─── Main page ────────────────────────────────────────────────────────────────

// The student's course content page: just the materials and assignments for
// a course they're enrolled in — no catalog-style details.
export default function CourseDetailPage() {
  const params   = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const router   = useRouter();

  const { course,      isLoading: courseLoading,  error: courseError  } = useCourse(courseId);
  const { materials,   isLoading: matsLoading,    error: matsError    } = useCourseMaterials(courseId);
  const { assignments, isLoading: assignsLoading, error: assignsError } = useCourseAssignments(courseId);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (courseLoading) {
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
          <p className="text-[19px] font-bold text-brand-dark">Course not found</p>
          <p className="text-[15px] text-brand-body mt-1">
            {courseError ?? "This course doesn't exist or you don't have access."}
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/student/courses")}>
          Back to My Courses
        </Button>
      </div>
    );
  }

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

      {/* ── Course title ── */}
      <h1 className="text-2xl font-bold text-brand-dark leading-tight">
        {course.title}
      </h1>

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
  );
}
