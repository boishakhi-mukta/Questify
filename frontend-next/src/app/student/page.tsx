/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Student Homepage
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Landing page dashboard for students after logging in.
 * 
 * WHY IT EXISTS:
 * Greets students, displaying status alerts and tasks.
 * 
 * HOW IT WORKS (Technical Overview):
 * Direct query loader populating dashboard components.
 * ============================================================================
 */

import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default function StudentPage() {
  return <StudentDashboard />;
}
