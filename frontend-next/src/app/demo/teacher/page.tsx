import DashboardShell from "@/components/dashboard/DashboardShell";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";

export default function DemoTeacherPage() {
  return (
    <DashboardShell
      role="teacher"
      demoUser={{ name: "Demo Teacher", email: "teacher@demo.com" }}
    >
      <TeacherDashboard />
    </DashboardShell>
  );
}
