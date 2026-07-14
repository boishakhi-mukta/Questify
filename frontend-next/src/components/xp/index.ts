/**
 * ============================================================================
 * QUESTIFY FILE: xp/index.ts (XP Components Exporter)
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Acts as a single doorway or directory for all XP-related progress and
 * level components.
 * 
 * WHY IT EXISTS:
 * To make importing different progress-related UI features simpler and cleaner
 * for other programmers working on the website.
 * 
 * HOW IT WORKS (Technical Overview):
 * Re-exports the XPProgressBar, LevelUpModal, and XPBreakdown components
 * from their respective files for unified access.
 * ============================================================================
 */

export { XPProgressBar } from "./XPProgressBar";
export { XPBreakdown } from "./XPBreakdown";
export { LevelUpModal } from "./LevelUpModal";
export type { XPBreakdownEntry } from "./XPBreakdown";
