/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Admin Courses Management
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Admin courses list page.
 * 
 * WHY IT EXISTS:
 * Allows administrators to add, edit, and delete courses.
 * 
 * HOW IT WORKS (Technical Overview):
 * Direct wrapper component mapping AdminCourses UI.
 * ============================================================================
 */

import AdminCourses from "@/components/dashboard/AdminCourses";

export default function AdminCoursesPage() {
  return <AdminCourses />;
}
