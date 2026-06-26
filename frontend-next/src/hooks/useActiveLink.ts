"use client";

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
