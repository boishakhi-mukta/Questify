/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Teacher Settings
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Settings configuration dashboard for teachers.
 * 
 * WHY IT EXISTS:
 * Enables teachers to configure profile details.
 * 
 * HOW IT WORKS (Technical Overview):
 * Renders settings components inside teacher dashboard layouts.
 * ============================================================================
 */

import SettingsPage from "@/components/settings/SettingsPage";

// The teacher's Settings page — shows the same shared settings UI everyone else gets.
export default function TeacherSettingsPage() {
  return <SettingsPage />;
}
