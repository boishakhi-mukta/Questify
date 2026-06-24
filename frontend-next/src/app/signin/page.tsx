import { redirect } from "next/navigation";

// Legacy route kept so old bookmarks don't 404
export default function LegacySignInPage() {
  redirect("/auth/login");
}
