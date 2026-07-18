/**
 * ============================================================================
 * QUESTIFY LIBRARY: General Utilities
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Tiny text styling helpers that merge CSS rules.
 * 
 * WHY IT EXISTS:
 * Simplifies applying conditional styles in components.
 * 
 * HOW IT WORKS (Technical Overview):
 * Wraps clsx and tailwind-merge to resolve styling conflicts.
 * ============================================================================
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines a list of CSS class names into one clean string, automatically
// removing any conflicting duplicates (e.g. two different "text-color" classes).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
