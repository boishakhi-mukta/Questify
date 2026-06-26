import Layout from "@/components/layout/Layout";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";

export default function DemoTeacherPage() {
  return (
    <Layout role="teacher" demoUser={{ name: "Demo Teacher", email: "teacher@demo.com" }}>
      <TeacherDashboard />
    </Layout>
  );
}
