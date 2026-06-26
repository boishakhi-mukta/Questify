"use client";

import Image from "next/image";
import Link from "next/link";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { UserDropdown } from "./UserDropdown";

interface AuthenticatedNavbarProps {
  sidebarOpen: boolean;
  onMenuToggle: () => void;
}

export function AuthenticatedNavbar({ sidebarOpen, onMenuToggle }: AuthenticatedNavbarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white dark:bg-slate-900 border-b border-brand-border dark:border-white/10 flex items-center justify-between px-5 lg:px-6 shrink-0">

      {/* ── Skip to content (accessibility) ── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:rounded-md focus:bg-brand-blue focus:text-white focus:text-[13px] focus:font-semibold"
      >
        Skip to content
      </a>

      {/* ── Left: hamburger (mobile) + logo ── */}
      <div className="flex items-center gap-3">
        {/* Hamburger — hidden on desktop (sidebar is always visible) */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-brand-body dark:text-white/55 hover:text-brand-dark dark:hover:text-white hover:bg-brand-bg dark:hover:bg-white/8 transition-colors"
        >
          {sidebarOpen ? <HiXMark size={20} /> : <HiBars3 size={20} />}
        </button>

        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.svg"
            alt="Questify"
            width={110}
            height={28}
            className="h-7 w-auto object-contain dark:brightness-0 dark:invert"
          />
        </Link>
      </div>

      {/* ── Right: user dropdown ── */}
      <UserDropdown />
    </header>
  );
}
