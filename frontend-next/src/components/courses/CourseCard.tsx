"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: CourseCard
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * One clickable preview card for a course, shown in the course catalogue grid.
 *
 * WHY IT EXISTS:
 * Gives students a quick, scannable summary of a course before they click
 * into its full details page.
 *
 * HOW IT WORKS (Technical Overview):
 * Picks a category color/icon, then renders the course's title, short
 * description, and a few key stats, all wrapped in a link to the detail page.
 * ============================================================================
 */

import Link from "next/link";
import {
  BookOpen, Clock, Users, Code2, Palette, Brain,
  Briefcase, BarChart3, Calculator, Cpu, ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Course } from "@/types/api-response";

interface CategoryConfig { color: string; Icon: LucideIcon }

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  "Computer Science": { color: "#1B4332", Icon: Code2      },
  "Business":         { color: "#0F6E4A", Icon: Briefcase  },
  "Data Science":     { color: "#1B7A5A", Icon: Brain      },
  "Mathematics":      { color: "#25B585", Icon: Calculator },
  "Design":           { color: "#2DCE9A", Icon: Palette    },
  "Engineering":      { color: "#0A5740", Icon: Cpu        },
};
const DEFAULT_CONFIG: CategoryConfig = { color: "#1B7A5A", Icon: BookOpen };

// Draws one course preview card (category, level, title, description,
// credits, hours, enrollment count) linking to that course's detail page.
export function CourseCard({ course }: { course: Course }) {
  const { color, Icon } = CATEGORY_CONFIG[course.category] ?? DEFAULT_CONFIG;

  return (
    <Link href={`/courses/${course._id}`} className="no-underline group block h-full">
      <article className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-brand-border/50 shadow-xs transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-brand-border">

        {/* Animated sweep border */}
        <div
          style={{
            height: "3px",
            flexShrink: 0,
            background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.85) 50%, ${color} 100%)`,
            backgroundSize: "200% 100%",
            animation: "card-border-flow 2.5s linear infinite",
          }}
        />

        <div className="flex flex-col flex-1 px-5 pt-5 pb-5 gap-3">

          {/* Category + level row */}
          <div className="flex items-center justify-between">
            <span
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color }}
            >
              <Icon size={12} strokeWidth={2.2} />
              {course.category}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: `${color}18`, color }}
            >
              {course.level === "BACHELOR" ? "Bachelor" : "Masters"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-brand-dark text-[15px] leading-snug line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-[13px] text-brand-body leading-relaxed line-clamp-2 flex-1">
            {course.shortDescription ?? course.description ?? ""}
          </p>

          {/* Meta footer */}
          <div className="pt-3 border-t border-brand-border/50 flex items-center gap-3.5 text-[12px] text-brand-body/65">
            <span className="flex items-center gap-1">
              <BookOpen size={11} />
              {course.credits} credits
            </span>
            {course.estimatedHours != null && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {course.estimatedHours}h
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto text-brand-body/45 group-hover:text-brand-blue transition-colors">
              <Users size={11} />
              {course.enrollmentCount ?? 0}
            </span>
            <ChevronRight
              size={14}
              className="text-brand-border group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all duration-200"
              strokeWidth={2.5}
            />
          </div>

        </div>
      </article>
    </Link>
  );
}
