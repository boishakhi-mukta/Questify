// Role-based redirect hub — Clerk sends users here after sign-in.
// Reads publicMetadata.role and forwards to the correct dashboard.
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/auth";

const rolePaths: Record<UserRole, string> = {
  admin:   "/admin",
  teacher: "/teacher",
  student: "/student",
};

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) redirect("/auth/login");

  const role = user.publicMetadata?.role as UserRole | undefined;

  if (role && rolePaths[role]) {
    redirect(rolePaths[role]);
  }

  // Role not assigned yet — send to home until an admin sets it
  redirect("/");
}
