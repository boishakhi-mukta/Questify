/**
 * ============================================================================
 * QUESTIFY COMPONENT: Navbar (Legacy Wrapper / Redirect)
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A router link file directing systems to the correct location of our modern Navbar.
 * 
 * WHY IT EXISTS:
 * Prevents system errors if legacy code looks for the old navbar file path.
 * 
 * HOW IT WORKS (Technical Overview):
 * Re-exports the modern navigation bar from the navbar sub-folder.
 * ============================================================================
 */

// Re-export from the new location — keeps existing imports working.
export { PublicNavbar as default } from "@/components/navbar/PublicNavbar";
