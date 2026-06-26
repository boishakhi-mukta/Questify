import Layout from "@/components/layout/Layout";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default function DemoStudentPage() {
  return (
    <Layout role="student" demoUser={{ name: "Demo Student", email: "student@demo.com" }}>
      <StudentDashboard />
    </Layout>
  );
}
