import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { UserRole } from "@/types/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  const role = user.publicMetadata?.role as UserRole | undefined;
  if (role !== "admin") {
    redirect(role ? `/${role}` : "/auth/login");
  }

  return <DashboardShell role="admin">{children}</DashboardShell>;
}
