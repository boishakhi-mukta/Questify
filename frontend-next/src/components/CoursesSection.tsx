"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: CoursesSection
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A section on the home page that showcases a highlighted list of courses
 * currently available.
 * 
 * WHY IT EXISTS:
 * To display the main educational offerings of the platform immediately on the
 * landing page so visitors can quickly browse what is taught.
 * 
 * HOW IT WORKS (Technical Overview):
 * Queries or receives a preview list of course objects and renders them inside
 * a grid layout using CourseCard components.
 * ============================================================================
 */

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useCourses } from "@/hooks/api/useCourses";
import type { Course } from "@/types/api-response";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course._id}`} className="no-underline group">
      <Card className="p-5 flex flex-col gap-3.5 cursor-pointer transition-all duration-200 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] group-hover:scale-[1.02]">
        <p className="text-base font-bold text-brand-dark leading-snug">
          {course.title}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge>{course.category}</Badge>
          <Badge>{course.campus}</Badge>
          <Badge>{course.credits} Credits</Badge>
          {course.semester && <Badge>{course.semester}</Badge>}
        </div>
      </Card>
    </Link>
  );
}

export default function CoursesSection() {
  const { t } = useTranslation();
  const { courses, isLoading } = useCourses({ limit: 6, sort: "featured" });

  return (
    <section id="courses" className="w-full bg-white">
      <div className="max-w-6xl mx-auto py-16 px-6 md:px-12">

        {/* Section header */}
        <ScrollReveal direction="up" className="flex flex-col items-center text-center mb-12">
          <p className="text-sm font-semibold text-brand-blue uppercase tracking-widest mb-3">
            {t("coursesSection.eyebrow")}
          </p>
          <h2 className="text-[32px] font-bold text-brand-dark mb-3.5 leading-tight">
            {t("coursesSection.heading")}
          </h2>
          <p className="text-[15px] text-brand-body leading-relaxed max-w-[600px]">
            {t("coursesSection.body")}
          </p>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-brand-bg animate-pulse" />
            ))}
          </div>
        ) : (
          <StaggerContainer
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            staggerChildren={0.08}
            delayChildren={0.05}
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
