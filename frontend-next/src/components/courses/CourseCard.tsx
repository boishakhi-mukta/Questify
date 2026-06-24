"use client";

import Link from "next/link";
import { HiStar, HiUserGroup } from "react-icons/hi2";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/data";
import { cn } from "@/lib/utils";

function StarRating({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <HiStar
          key={i}
          size={13}
          className={cn(
            i < full ? "text-amber-400" :
            i === full && half ? "text-amber-300" :
            "text-brand-border"
          )}
        />
      ))}
      <span className="text-[12px] font-semibold text-amber-600 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

const difficultyColor: Record<string, string> = {
  Beginner:     "bg-emerald-50 text-emerald-600 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-600 border-amber-200",
  Advanced:     "bg-red-50 text-red-600 border-red-200",
};

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`} className="no-underline group block h-full">
      <Card className="p-5 flex flex-col gap-3 h-full cursor-pointer transition-all duration-200 group-hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] group-hover:-translate-y-0.5 border-brand-border">

        {/* Category + difficulty badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge>{course.category}</Badge>
          <span className={cn(
            "inline-flex items-center rounded-full text-[11px] font-bold px-2.5 py-0.5 border",
            difficultyColor[course.difficulty] ?? "bg-gray-50 text-gray-600 border-gray-200"
          )}>
            {course.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-brand-dark leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
          {course.name}
        </h3>

        {/* Instructor */}
        <p className="text-[13px] text-brand-body">by {course.instructor}</p>

        {/* Description */}
        <p className="text-[13px] text-brand-body leading-relaxed line-clamp-2 flex-1">
          {course.description}
        </p>

        {/* Rating + enrollments */}
        <div className="flex items-center gap-3">
          <StarRating rating={course.rating} />
          <span className="flex items-center gap-1 text-[12px] text-brand-body/70">
            <HiUserGroup size={13} />
            {course.enrollments.toLocaleString()}
          </span>
        </div>

        {/* Bottom row: level/credit + price */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-border mt-auto">
          <div className="flex items-center gap-2">
            <Badge>{course.level}</Badge>
            <span className="text-[12px] text-brand-body">{course.credit} ECTS</span>
          </div>
          <span className={cn(
            "text-[15px] font-bold",
            course.price === 0 ? "text-emerald-600" : "text-brand-dark"
          )}>
            {course.price === 0 ? "Free" : `$${course.price}`}
          </span>
        </div>

      </Card>
    </Link>
  );
}
