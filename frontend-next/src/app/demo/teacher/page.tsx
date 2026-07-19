/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Teacher Demo Dashboard
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * An interactive sandbox page displaying mock teacher dashboards.
 * 
 * WHY IT EXISTS:
 * Helps developers verify UI updates without logging in manually.
 * 
 * HOW IT WORKS (Technical Overview):
 * Page component supplying mockup props to TeacherDashboard wrappers.
 * ============================================================================
 */

import Layout from "@/components/layout/Layout";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";

// Shows the teacher dashboard without needing to actually log in — useful
// for quickly previewing what a teacher sees.
export default function DemoTeacherPage() {
  return (
    <Layout role="teacher" demoUser={{ name: "Demo Teacher", email: "teacher@demo.com" }}>
      <TeacherDashboard />
    </Layout>
  );
}
