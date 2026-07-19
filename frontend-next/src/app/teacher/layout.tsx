/**
 * ============================================================================
 * QUESTIFY LAYOUT ROUTE: Teacher Layout
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Sidebar wrapper that outlines dashboards spacing for teachers.
 * 
 * WHY IT EXISTS:
 * Ensures teacher dashboard pages share consistent layouts.
 * 
 * HOW IT WORKS (Technical Overview):
 * Layout framework routing teacher routes.
 * ============================================================================
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Layout from "@/components/layout/Layout";

// Wraps every /teacher/* page: checks the visitor is actually logged in as
// a teacher (bouncing them to login or their own role's area otherwise),
// then shows the shared teacher sidebar + navbar frame around the page content.
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("questify_token")?.value;
  const role  = cookieStore.get("questify_role")?.value;

  if (!token)             redirect("/login");
  if (role !== "teacher") redirect(role ? `/${role}` : "/login");

  return <Layout role="teacher">{children}</Layout>;
}
