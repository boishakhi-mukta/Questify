"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useCourses } from "@/hooks/api/useCourses";
import type { Course } from "@/types/api-response";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";
import {
  BookOpen, Clock, Users, Monitor, Code2,
  Palette, Brain, Cloud, FlaskConical,
  ArrowRight, GraduationCap, ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoryConfig { color: string; Icon: LucideIcon }

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Technology: { color: "#1B7A5A", Icon: Monitor      },
  CS:         { color: "#1B4332", Icon: Code2        },
  Design:     { color: "#25B585", Icon: Palette      },
  AI:         { color: "#0F6E4A", Icon: Brain        },
  Cloud:      { color: "#2DCE9A", Icon: Cloud        },
  Testing:    { color: "#1B4332", Icon: FlaskConical },
};
const DEFAULT_CONFIG: CategoryConfig = { color: "#1B7A5A", Icon: BookOpen };

function CourseCard({ course }: { course: Course }) {
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
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color }}>
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
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {course.estimatedHours}h
            </span>
            <span className="flex items-center gap-1 ml-auto text-brand-body/45 group-hover:text-brand-blue transition-colors">
              <Users size={11} />
              {course.enrollmentCount}
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

function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-brand-border/40 bg-white shadow-xs">
      <div className="h-0.75 bg-brand-border/30 animate-pulse" />
      <div className="px-5 pt-5 pb-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-brand-bg rounded animate-pulse" />
          <div className="h-4 w-16 bg-brand-bg rounded-full animate-pulse" />
        </div>
        <div className="h-4 w-4/5 bg-brand-bg rounded animate-pulse" />
        <div className="h-3 w-full bg-brand-bg rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-brand-bg rounded animate-pulse" />
        <div className="pt-3 border-t border-brand-border/40 flex gap-4">
          <div className="h-3 w-14 bg-brand-bg rounded animate-pulse" />
          <div className="h-3 w-10 bg-brand-bg rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function CoursesSection() {
  const { t } = useTranslation();
  const { courses, isLoading } = useCourses({ limit: 6, sort: "featured" });

  return (
    <section id="courses" className="w-full bg-brand-bg">
      <div className="w-10/12 mx-auto py-20">

        {/* Header — left-aligned portal style with inline "Browse all" */}
        <ScrollReveal direction="up" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#1B7A5A] uppercase tracking-[0.15em] mb-3">
              <GraduationCap size={13} />
              {t("coursesSection.eyebrow")}
            </span>
            <h2 className="text-[30px] font-bold text-brand-dark leading-tight">
              {t("coursesSection.heading")}
            </h2>
          </div>
          <Link
            href="/courses"
            className="group flex items-center gap-1.5 text-sm font-semibold text-[#1B7A5A] hover:text-[#0F6E4A] transition-colors duration-150 shrink-0 pb-1"
          >
            Browse all courses
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          </Link>
        </ScrollReveal>

        {/* Course grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <StaggerContainer
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            staggerChildren={0.07}
            delayChildren={0.04}
          >
            {courses.map((course) => (
              <StaggerItem key={course._id}>
                <CourseCard course={course} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

      </div>
    </section>
  );
}
