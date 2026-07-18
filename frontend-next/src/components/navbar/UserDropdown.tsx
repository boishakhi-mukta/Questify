"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: UserDropdown
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The drop-down menu that opens when clicking your profile image, letting you sign out.
 * 
 * WHY IT EXISTS:
 * Safe and space-efficient home for personal account triggers.
 * 
 * HOW IT WORKS (Technical Overview):
 * Leverages HeroUI dropdown UI wrapper and Clerk SDK sign-out function.
 * ============================================================================
 */

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiUser,
  HiSquares2X2,
  HiCog6Tooth,
  HiChevronDown,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";
import { useTranslation } from "react-i18next";

const roleDashboard: Record<UserRole, string> = {
  admin:   "/admin",
  teacher: "/teacher",
  student: "/student",
};

// The account menu in the top-right corner (avatar + name) — opens a small
// menu with links to the user's profile, dashboard, settings, and sign out.
export function UserDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef   = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!user) return null;

  const displayName   = user.firstName || user.fullName || "Account";
  const dashboardHref = roleDashboard[user.role] ?? "/dashboard";
  const close         = () => setOpen(false);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open user menu"
        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-brand-bg dark:hover:bg-white/8 transition-colors duration-150"
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={displayName}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
            <HiUser size={15} className="text-white" />
          </div>
        )}
        <span className="hidden sm:block text-[14px] font-semibold text-brand-dark dark:text-white">
          {displayName}
        </span>
        <HiChevronDown
          size={13}
          className={cn(
            "text-brand-body dark:text-white/55 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-brand-border dark:border-white/10 rounded-lg shadow-lg overflow-hidden z-50"
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-brand-border dark:border-white/10">
            <p className="text-[13px] font-bold text-brand-dark dark:text-white truncate">
              {user.fullName}
            </p>
            <p className="text-[11px] text-brand-body dark:text-white/45 truncate">
              {user.email}
            </p>
          </div>

          {/* Links */}
          <div role="group" className="py-1">
            <Link
              href="/profile"
              role="menuitem"
              onClick={close}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-brand-dark dark:text-white/80 hover:bg-brand-bg dark:hover:bg-white/8 transition-colors no-underline"
            >
              <HiUser size={15} className="text-brand-body dark:text-white/40 shrink-0" />
              {t("navbar.profile")}
            </Link>
            <Link
              href={dashboardHref}
              role="menuitem"
              onClick={close}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-brand-dark dark:text-white/80 hover:bg-brand-bg dark:hover:bg-white/8 transition-colors no-underline"
            >
              <HiSquares2X2 size={15} className="text-brand-body dark:text-white/40 shrink-0" />
              {t("navbar.dashboard")}
            </Link>
            <Link
              href={`${dashboardHref}/settings`}
              role="menuitem"
              onClick={close}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-brand-dark dark:text-white/80 hover:bg-brand-bg dark:hover:bg-white/8 transition-colors no-underline"
            >
              <HiCog6Tooth size={15} className="text-brand-body dark:text-white/40 shrink-0" />
              {t("navbar.settings")}
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-brand-border dark:border-white/10 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => { close(); logout(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <HiArrowRightOnRectangle size={15} className="shrink-0" />
              {t("navbar.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
