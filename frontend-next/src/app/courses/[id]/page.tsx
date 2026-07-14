/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Course Detail Description
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Description and info details page for specific courses.
 * 
 * WHY IT EXISTS:
 * Public page used to review course offerings before registering.
 * 
 * HOW IT WORKS (Technical Overview):
 * Dynamic layout inspecting URL id parameter to load syllabus descriptions.
 * ============================================================================
 */

import CourseDetail from "@/components/CourseDetail";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourseDetail id={id} />;
}
