import { auth } from "@/lib/auth";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";

export default async function TeacherPage() {
  const session = await auth();
  return <TeacherDashboard session={session} />;
}
