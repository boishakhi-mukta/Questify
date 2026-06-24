import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Role-based redirect hub — redirects authenticated users to their dashboard.
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("questify_token")?.value;
  const role  = cookieStore.get("questify_role")?.value;

  if (!token) redirect("/login");

  if (role === "admin")   redirect("/admin");
  if (role === "teacher") redirect("/teacher");
  if (role === "student") redirect("/student");

  redirect("/login");
}
