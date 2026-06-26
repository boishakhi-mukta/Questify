"use client";

import { useAuth } from "@/hooks/useAuth";
import { PublicNavbar } from "./PublicNavbar";
import { AuthenticatedNavbar } from "./AuthenticatedNavbar";

interface NavbarProps {
  sidebarOpen?: boolean;
  onMenuToggle?: () => void;
}

/**
 * Unified Navbar — renders either the public marketing navbar or the
 * authenticated dashboard top-bar depending on auth state.
 *
 * When rendered inside <Layout>, pass sidebarOpen and onMenuToggle through so
 * the mobile hamburger can control the sidebar drawer.
 */
export function Navbar({ sidebarOpen = false, onMenuToggle = () => {} }: NavbarProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <header
        aria-hidden
        className="sticky top-0 z-50 h-14 bg-white dark:bg-slate-900 border-b border-brand-border dark:border-white/10 shrink-0"
      />
    );
  }

  if (isAuthenticated) {
    return (
      <AuthenticatedNavbar sidebarOpen={sidebarOpen} onMenuToggle={onMenuToggle} />
    );
  }

  return <PublicNavbar />;
}

export { PublicNavbar } from "./PublicNavbar";
export { AuthenticatedNavbar } from "./AuthenticatedNavbar";
export { UserDropdown } from "./UserDropdown";
