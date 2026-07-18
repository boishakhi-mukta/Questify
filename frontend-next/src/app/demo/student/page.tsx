/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Student Demo Dashboard
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * An interactive sandbox page displaying mock student dashboards.
 * 
 * WHY IT EXISTS:
 * Helps developers verify UI updates without logging in manually.
 * 
 * HOW IT WORKS (Technical Overview):
 * Page component supplying mockup props to StudentDashboard wrappers.
 * ============================================================================
 */

import Layout from "@/components/layout/Layout";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

// Shows the student dashboard without needing to actually log in — useful
// for quickly previewing what a student sees.
export default function DemoStudentPage() {
  return (
    <Layout role="student" demoUser={{ name: "Demo Student", email: "student@demo.com" }}>
      <StudentDashboard />
    </Layout>
  );
}
