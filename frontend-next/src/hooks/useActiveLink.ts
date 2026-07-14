"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useActiveLink
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Checks if a menu button points to the page the user is currently viewing.
 * 
 * WHY IT EXISTS:
 * Highlights active navigation items.
 * 
 * HOW IT WORKS (Technical Overview):
 * Matches paths against current Router window settings.
 * ============================================================================
 */

import { usePathname } from "next/navigation";

/**
 * Returns true when the current pathname matches the given href.
 * For root-like hrefs (e.g. "/admin") use `exact: true` so that
 * child routes ("/admin/users") don't also highlight the parent.
 */
export function useActiveLink(href: string, exact = false): boolean {
  const pathname = usePathname();
  if (exact) return pathname === href;
  // Treat "/admin" as exact-only; nested paths use startsWith
  return pathname === href || pathname.startsWith(`${href}/`);
}
