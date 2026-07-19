/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Student Settings
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Settings page allowing students to update details and credentials.
 * 
 * WHY IT EXISTS:
 * Gives students control over their profiles.
 * 
 * HOW IT WORKS (Technical Overview):
 * Renders settings components inside the student dashboard layout.
 * ============================================================================
 */

import SettingsPage from "@/components/settings/SettingsPage";

// The student's Settings page — shows the same shared settings UI everyone else gets.
export default function StudentSettingsPage() {
  return <SettingsPage />;
}
