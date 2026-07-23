"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Student Course Detail (In-Dashboard)
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * The same course detail + enroll/unenroll view as the public course page,
 * shown inside the student's dashboard instead of the public marketing site.
 *
 * WHY IT EXISTS:
 * Lets a student research and enroll in a course they found while browsing
 * the in-dashboard catalog, without leaving the dashboard.
 *
 * HOW IT WORKS (Technical Overview):
 * Reuses the CourseDetail component with basePath="/student/browse" so its
 * "back to courses" links and post-login redirect stay under /student/browse.
 * ============================================================================
 */

import { useParams } from "next/navigation";
import CourseDetail from "@/components/CourseDetail";

export default function StudentBrowseCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <CourseDetail id={id} basePath="/student/browse" />;
}
