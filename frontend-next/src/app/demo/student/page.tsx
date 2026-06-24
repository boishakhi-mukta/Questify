import DashboardShell from "@/components/dashboard/DashboardShell";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default function DemoStudentPage() {
  return (
    <DashboardShell
      role="student"
      demoUser={{ name: "Demo Student", email: "student@demo.com" }}
    >
      <StudentDashboard />
    </DashboardShell>
  );
}
