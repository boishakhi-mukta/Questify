import { redirect } from "next/navigation";
// Registration is admin-only. Redirect to login.
export default function OldRegisterRedirect() {
  redirect("/login");
}
