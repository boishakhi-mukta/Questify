import { auth } from "@/lib/auth";
import StudentDashboard from "@/components/dashboard/StudentDashboard";

export default async function StudentPage() {
  const session = await auth();
  return <StudentDashboard session={session} />;
}
