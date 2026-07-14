/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Login Form
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The standard login credentials form.
 * 
 * WHY IT EXISTS:
 * Gateway to input credentials.
 * 
 * HOW IT WORKS (Technical Overview):
 * Captures user parameters, forwarding credentials checks.
 * ============================================================================
 */

import { redirect } from "next/navigation";
// Permanent redirect for old /auth/login bookmarks
export default function OldLoginRedirect() {
  redirect("/login");
}
