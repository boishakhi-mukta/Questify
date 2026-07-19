/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Admin Dashboard Main
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Landing page dashboard for administrators.
 * 
 * WHY IT EXISTS:
 * Displays system health stats overview.
 * 
 * HOW IT WORKS (Technical Overview):
 * Binds page inputs to AdminDashboard components.
 * ============================================================================
 */

import AdminDashboard from "@/components/dashboard/AdminDashboard";

// The admin dashboard home page — shows the AdminDashboard overview widgets.
export default function AdminPage() {
  return <AdminDashboard />;
}
