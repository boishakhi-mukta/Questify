import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "student") redirect("/signin");

  return (
    <DashboardShell session={session} role="student">
      {children}
    </DashboardShell>
  );
}
