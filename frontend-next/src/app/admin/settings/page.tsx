/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Administrator System Settings
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The system configuration page for administrators.
 * 
 * WHY IT EXISTS:
 * Allows managers to edit global system values.
 * 
 * HOW IT WORKS (Technical Overview):
 * Renders configuration input forms.
 * ============================================================================
 */

import SettingsPage from "@/components/settings/SettingsPage";

// The admin's Settings page — shows the same shared settings UI everyone else gets.
export default function AdminSettingsPage() {
  return <SettingsPage />;
}
