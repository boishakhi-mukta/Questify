import { redirect } from "next/navigation";
// Permanent redirect for old /auth/login bookmarks
export default function OldLoginRedirect() {
  redirect("/login");
}
