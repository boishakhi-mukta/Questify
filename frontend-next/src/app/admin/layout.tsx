import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Layout from "@/components/layout/Layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("questify_token")?.value;
  const role  = cookieStore.get("questify_role")?.value;

  if (!token)           redirect("/login");
  if (role !== "admin") redirect(role ? `/${role}` : "/login");

  return <Layout role="admin">{children}</Layout>;
}
