/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Registration Form
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The form where new students register account details.
 * 
 * WHY IT EXISTS:
 * Gateway to register accounts.
 * 
 * HOW IT WORKS (Technical Overview):
 * Captures user parameters, forwarding credentials checking requests.
 * ============================================================================
 */

import { redirect } from "next/navigation";
// Registration is admin-only. Redirect to login.
export default function OldRegisterRedirect() {
  redirect("/login");
}
