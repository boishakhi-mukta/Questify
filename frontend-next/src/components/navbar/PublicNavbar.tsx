"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { HiBars3, HiXMark, HiUser, HiArrowRightOnRectangle } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

interface NavLink {
  type:  "route" | "scroll";
  to?:   string;
  id?:   string;
  label: string;
}

const roleDashboard: Record<UserRole, string> = {
  admin:   "/admin",
  teacher: "/teacher",
  student: "/student",
};

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const pathname        = usePathname();
  const router          = useRouter();
  const { t }           = useTranslation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const navLinks: NavLink[] = [
    { type: "route", to: "/",        label: t("navbar.home")    },
    { type: "route", to: "/courses", label: t("navbar.courses") },
    { type: "route", to: "/about",   label: t("navbar.about")   },
    { type: "route", to: "/contact", label: t("navbar.contact") },
    { type: "route", to: "/help",    label: t("navbar.help")    },
  ];

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
          className="text-[14px] font-medium bg-transparent border-0 p-0 cursor-pointer text-brand-body hover:text-brand-blue transition-colors"
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
          "text-[14px] font-medium no-underline transition-colors",
          isActive
            ? "text-brand-blue font-semibold"
            : "text-brand-body hover:text-brand-blue",
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {link.label}
      </Link>
    );
  }

  const AuthSection = ({ onClose }: { onClose?: () => void }) => {
    if (isLoading) {
      return <div className="w-20 h-8 rounded-xl bg-white/30 animate-pulse" />;
    }

    if (isAuthenticated && user) {
      const dashboardHref = roleDashboard[user.role] ?? "/dashboard";
      const displayName   = user.firstName || user.fullName || t("navbar.profile");

      return (
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={dashboardHref}
            onClick={onClose}
            className="flex items-center gap-2 no-underline text-brand-body hover:text-brand-blue transition-colors text-[13px] font-semibold"
          >
            {user.avatar ? (
              <Image src={user.avatar} alt={displayName} width={28} height={28} className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-blue/30" />
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
            className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-body hover:text-red-600 transition-colors"
          >
            <HiArrowRightOnRectangle size={15} />
            {t("navbar.logout")}
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          asChild
          className="rounded-full px-5 text-[13px] shadow-sm shadow-brand-blue/25 hover:-translate-y-0.5 transition-transform"
        >
          <Link href="/login" onClick={onClose}>{t("navbar.login")}</Link>
        </Button>
      </div>
    );
  };

  return (
    <div className="sticky top-4 z-50 px-4 md:px-10">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:rounded-xl focus:bg-brand-blue focus:text-white focus:text-[13px] focus:font-semibold"
      >
        Skip to content
      </a>

      {/* ── Glassmorphism floating card ── */}
      <nav
        style={{
          background:    "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow:     "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.75)",
          border:        "1px solid rgba(255, 255, 255, 0.55)",
        }}
        className="max-w-6xl mx-auto rounded-[28px] dark:!bg-[rgba(22,43,33,0.50)] dark:[border-color:rgba(255,255,255,0.08)] dark:[box-shadow:0_4px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.06)]"
        aria-label="Main navigation"
      >
        <div className="h-[60px] flex items-center justify-between px-5 relative">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" aria-label="Questify home">
            <Image
              src="/logo.svg"
              alt="Questify"
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav links — absolute center */}
          <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <li key={link.to ?? link.id}>{renderLink(link)}</li>
            ))}
          </ul>

          {/* Desktop right: language + auth */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <AuthSection />
          </div>

          {/* Mobile: language + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <LanguageSwitcher />
            <button
              type="button"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-brand-body hover:bg-white/40 dark:text-white/60 dark:hover:bg-white/10 transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="public-mobile-menu"
            >
              {open ? <HiXMark size={22} /> : <HiBars3 size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer — inherits glass from parent */}
        {open && (
          <div
            id="public-mobile-menu"
            className="md:hidden border-t border-white/30 dark:border-white/8 px-5 py-5 flex flex-col gap-4 rounded-b-2xl"
          >
            {navLinks.map((link) => renderLink(link, () => setOpen(false)))}
            <div className="pt-4 border-t border-white/30 dark:border-white/8">
              <AuthSection onClose={() => setOpen(false)} />
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default PublicNavbar;
