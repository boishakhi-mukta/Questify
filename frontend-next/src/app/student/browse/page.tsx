"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Student Course Catalog (In-Dashboard)
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * The same searchable, filterable course catalog as the public "Browse
 * Courses" page, but shown inside the student's own dashboard (sidebar and
 * all) instead of sending them out to the public marketing site.
 *
 * WHY IT EXISTS:
 * So a logged-in student can discover and enroll in new courses without
 * ever leaving the dashboard experience.
 *
 * HOW IT WORKS (Technical Overview):
 * Reuses CoursesPageClient with basePath="/student/browse" so its URL sync
 * and course links stay under /student/browse instead of the public /courses.
 * ============================================================================
 */

import { Suspense } from "react";
import CoursesPageClient from "@/components/courses/CoursesPageClient";
import { CourseSkeletonGrid } from "@/components/courses/CourseSkeleton";

// A grey placeholder version of the catalog, shown for a split second while
// the real page (which needs the browser's URL) loads in.
function BrowseCoursesFallback() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="bg-white border-b border-brand-border">
        <div className="px-4 sm:px-6 py-8">
          <div className="w-48 h-8 bg-brand-bg rounded animate-pulse mb-1" />
          <div className="w-72 h-5 bg-brand-bg rounded animate-pulse mb-6" />
          <div className="w-full h-14 bg-brand-bg rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="px-4 sm:px-6 py-8">
        <CourseSkeletonGrid />
      </div>
    </div>
  );
}

export default function StudentBrowseCoursesPage() {
  return (
    <Suspense fallback={<BrowseCoursesFallback />}>
      <CoursesPageClient basePath="/student/browse" />
    </Suspense>
  );
}
