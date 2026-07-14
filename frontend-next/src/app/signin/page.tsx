/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Portal Landing Gateway
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * landing page where users click to sign-in.
 * 
 * WHY IT EXISTS:
 * Gateway to access credentials login forms.
 * 
 * HOW IT WORKS (Technical Overview):
 * Static route displaying login buttons.
 * ============================================================================
 */

import { redirect } from "next/navigation";

// Legacy route kept so old bookmarks don't 404
export default function LegacySignInPage() {
  redirect("/auth/login");
}
