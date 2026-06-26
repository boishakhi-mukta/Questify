"use client";

import Link from "next/link";
import { useCourses } from "@/hooks/api/useCourses";
import type { Course } from "@/types/api-response";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
  const { courses, isLoading } = useCourses({ limit: 6, sort: "featured" });

  return (
    <section id="courses" className="w-full bg-white">
      <div className="max-w-6xl mx-auto py-16 px-12">

        <h2 className="text-[32px] font-bold text-brand-dark text-center mb-3.5 leading-tight">
          Explore Courses
        </h2>

        <p className="text-[15px] text-brand-body text-center leading-relaxed max-w-[600px] mx-auto mb-10">
          Browse your institution&apos;s course catalogue and enroll to start earning
          XP and climbing the leaderboard.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-brand-bg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
