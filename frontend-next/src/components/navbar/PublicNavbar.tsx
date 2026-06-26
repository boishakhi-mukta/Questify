"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  HiBars3,
  HiXMark,
  HiUser,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

interface NavLink {
  type:   "route" | "scroll";
  to?:    string;
  id?:    string;
  label:  string;
}

const navLinks: NavLink[] = [
  { type: "route",  to: "/",         label: "Home"       },
  { type: "route",  to: "/courses",  label: "Courses"    },
  { type: "route",  to: "/about",    label: "About"      },
  { type: "route",  to: "/contact",  label: "Contact"    },
  { type: "route",  to: "/help",     label: "Help / FAQ" },
];

const roleDashboard: Record<UserRole, string> = {
  admin:   "/admin",
  teacher: "/teacher",
  student: "/student",
};

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const pathname        = usePathname();
  const router          = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  function scrollToSection(id: string) {
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/");
      setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
        150,
      );
    }
    setOpen(false);
  }

  function renderLink(link: NavLink, onClickExtra?: () => void) {
    if (link.type === "scroll" && link.id) {
      return (
        <button
          key={link.id}
          type="button"
          className="text-[15px] font-semibold bg-transparent border-0 p-0 cursor-pointer text-brand-body dark:text-white/70 hover:text-brand-blue dark:hover:text-white transition-colors"
          onClick={() => { scrollToSection(link.id!); onClickExtra?.(); }}
        >
          {link.label}
        </button>
      );
    }
    const isActive = pathname === link.to;
    return (
      <Link
        key={link.to}
        href={link.to!}
        onClick={onClickExtra}
        className={cn(
          "text-[15px] font-semibold no-underline transition-colors",
          isActive
            ? "text-brand-blue underline decoration-brand-blue underline-offset-4"
            : "text-brand-body dark:text-white/70 hover:text-brand-blue dark:hover:text-white",
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {link.label}
      </Link>
    );
  }

  const AuthSection = ({ onClose }: { onClose?: () => void }) => {
    if (isLoading) {
      return <div className="w-20 h-8 rounded-md bg-brand-border/50 animate-pulse" />;
    }

    if (isAuthenticated && user) {
      const dashboardHref = roleDashboard[user.role] ?? "/dashboard";
      const displayName   = user.firstName || user.fullName || "Account";

      return (
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={dashboardHref}
            onClick={onClose}
            className="flex items-center gap-2 no-underline text-brand-body dark:text-white/70 hover:text-brand-blue dark:hover:text-white transition-colors text-[14px] font-semibold"
          >
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={displayName}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
                <HiUser size={13} className="text-white" />
              </div>
            )}
            {displayName}
          </Link>
          <button
            type="button"
            onClick={() => { logout(); onClose?.(); }}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-body dark:text-white/55 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <HiArrowRightOnRectangle size={15} />
            Sign Out
          </button>
        </div>
      );
    }

    return (
      <Button variant="default" size="sm" asChild>
        <Link href="/login" onClick={onClose}>Sign In</Link>
      </Button>
    );
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-brand-border dark:border-white/10"
      aria-label="Main navigation"
    >
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:rounded-md focus:bg-brand-blue focus:text-white focus:text-[13px] focus:font-semibold"
      >
        Skip to content
      </a>

      <div className="h-14 flex items-center justify-between px-6 max-w-7xl mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0" aria-label="Questify home">
          <Image
            src="/logo.svg"
            alt="Questify"
            width={120}
            height={32}
            className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
          />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden lg:flex items-center gap-7 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.to ?? link.id}>{renderLink(link)}</li>
          ))}
        </ul>

        {/* Desktop auth */}
        <div className="hidden md:flex">
          <AuthSection />
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-brand-body dark:text-white/55 hover:text-brand-dark dark:hover:text-white hover:bg-brand-bg dark:hover:bg-white/8 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="public-mobile-menu"
        >
          {open ? <HiXMark size={22} /> : <HiBars3 size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          id="public-mobile-menu"
          className="md:hidden border-t border-brand-border dark:border-white/10 bg-white dark:bg-slate-900 px-6 py-5 flex flex-col gap-4"
        >
          {navLinks.map((link) => renderLink(link, () => setOpen(false)))}
          <div className="mt-2 pt-4 border-t border-brand-border dark:border-white/10">
            <AuthSection onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
}

// Default export so existing `import Navbar from "@/components/Navbar"` can be migrated
export default PublicNavbar;
