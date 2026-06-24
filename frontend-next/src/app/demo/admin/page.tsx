import DashboardShell from "@/components/dashboard/DashboardShell";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DemoAdminPage() {
  return (
    <DashboardShell
      role="admin"
      demoUser={{ name: "Demo Admin", email: "admin@demo.com" }}
    >
      <AdminDashboard />
    </DashboardShell>
  );
}
