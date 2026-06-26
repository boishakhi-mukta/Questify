import Layout from "@/components/layout/Layout";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DemoAdminPage() {
  return (
    <Layout role="admin" demoUser={{ name: "Demo Admin", email: "admin@demo.com" }}>
      <AdminDashboard />
    </Layout>
  );
}
