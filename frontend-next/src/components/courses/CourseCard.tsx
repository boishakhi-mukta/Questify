"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: CourseCard
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A visual box display representing a course, showing instructor names and semesters.
 * 
 * WHY IT EXISTS:
 * Renders brief summaries in search layouts to let users review options before enrolling.
 * 
 * HOW IT WORKS (Technical Overview):
 * Displays details inside an interactive, hoverable container linking to detail pages.
 * ============================================================================
 */

import Link from "next/link";
import { HiUserGroup } from "react-icons/hi2";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/api-response";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Maps backend level enum to a human-readable label and badge colour class. */
const LEVEL_META: Record<string, { label: string; classes: string }> = {
  BACHELOR: { label: "Bachelor", classes: "bg-brand-blue/8 text-brand-blue border-brand-blue/20" },
  MASTERS:  { label: "Masters",  classes: "bg-violet-50 text-violet-600 border-violet-200"       },
};

function levelMeta(level: string) {
  return LEVEL_META[level] ?? { label: level, classes: "bg-gray-50 text-gray-600 border-gray-200" };
}

/** Returns the first teacher's full name, or a fallback. */
function teacherName(teachers: Course["teachers"]): string {
  if (!teachers || teachers.length === 0) return "—";
  const t = teachers[0];
  if (typeof t === "string") return t;
  return `${t.firstName} ${t.lastName}`.trim();
}


// ── Component ─────────────────────────────────────────────────────────────────

export function CourseCard({ course }: { course: Course }) {
  const { t } = useTranslation();
  const meta = levelMeta(course.level);

  return (
    <Link href={`/courses/${course._id}`} className="no-underline group block h-full">
      <Card className="p-5 flex flex-col gap-3 h-full cursor-pointer transition-all duration-200 group-hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] group-hover:-translate-y-0.5 border-brand-border">

        {/* Category + level badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge>{course.category}</Badge>
          <span className={cn(
            "inline-flex items-center rounded-full text-[11px] font-bold px-2.5 py-0.5 border",
            meta.classes
          )}>
            {meta.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-brand-dark leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-[13px] text-brand-body">{t("courseCard.by")} {teacherName(course.teachers)}</p>

        {/* Description */}
        <p className="text-[13px] text-brand-body leading-relaxed line-clamp-2 flex-1">
          {course.shortDescription ?? course.description}
        </p>

        {/* Enrollments */}
        <span className="flex items-center gap-1 text-[12px] text-brand-body/70">
          <HiUserGroup size={13} />
          {(course.enrollmentCount ?? 0).toLocaleString()} {t("courseCard.enrolled")}
        </span>

        {/* Bottom row: campus + credits */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-border mt-auto">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{course.campus}</Badge>
            <span className="text-[12px] text-brand-body">{course.credits} ECTS</span>
          </div>
          {course.semester && (
            <span className="text-[12px] text-brand-body/70">{course.semester}</span>
          )}
        </div>

      </Card>
    </Link>
  );
}
