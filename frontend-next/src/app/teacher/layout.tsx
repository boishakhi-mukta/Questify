import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "teacher") redirect("/signin");

  return (
    <DashboardShell session={session} role="teacher">
      {children}
    </DashboardShell>
  );
}
