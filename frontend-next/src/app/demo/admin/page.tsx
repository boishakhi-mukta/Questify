/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Admin Demo Dashboard
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * An interactive sandbox page displaying mock admin dashboards.
 * 
 * WHY IT EXISTS:
 * Helps developers verify UI updates without logging in manually.
 * 
 * HOW IT WORKS (Technical Overview):
 * Page component supplying mockup props to AdminDashboard wrappers.
 * ============================================================================
 */

import Layout from "@/components/layout/Layout";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

// Shows the admin dashboard without needing to actually log in — useful for
// quickly previewing what an admin sees.
export default function DemoAdminPage() {
  return (
    <Layout role="admin" demoUser={{ name: "Demo Admin", email: "admin@demo.com" }}>
      <AdminDashboard />
    </Layout>
  );
}
