"use client";

import Link from "next/link";
import { courses, type Course } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`} className="no-underline group">
      <Card className="p-5 flex flex-col gap-3.5 cursor-pointer transition-all duration-200 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] group-hover:scale-[1.02]">
        <p className="text-base font-bold text-brand-dark leading-snug">
          {course.name}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge>{course.level}</Badge>
          <Badge>{course.campus}</Badge>
          <Badge>{course.credit} Credits</Badge>
          <Badge>{course.semester}</Badge>
        </div>
      </Card>
    </Link>
  );
}

export default function CoursesSection() {
  return (
    <section id="courses" className="w-full bg-white">
      <div className="max-w-6xl mx-auto py-16 px-12">

        <h2 className="text-[32px] font-bold text-brand-dark text-center mb-3.5 leading-tight">
          Explore Courses
        </h2>

        <p className="text-[15px] text-brand-body text-center leading-relaxed max-w-[600px] mx-auto mb-10">
          Browse our catalogue and enroll in courses to start earning points
          and climbing the leaderboard.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

      </div>
    </section>
  );
}
