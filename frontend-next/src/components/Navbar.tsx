"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { HiMenu, HiX, HiUser } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  type: "route" | "scroll";
  to?: string;
  id?: string;
  label: string;
}

const publicNavLinks: NavLink[] = [
  { type: "route", to: "/", label: "Home" },
  { type: "scroll", id: "how-it-works", label: "How It Works" },
  { type: "scroll", id: "courses", label: "Courses" },
];

const roleDashboard: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  function scrollToSection(id: string) {
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  function renderLink(link: NavLink, onClickExtra?: () => void) {
    if (link.type === "scroll" && link.id) {
      return (
        <button
          key={link.id}
          className="text-[15px] font-semibold bg-transparent border-none p-0 cursor-pointer text-brand-body hover:text-brand-blue transition-colors duration-150"
          onClick={() => {
            scrollToSection(link.id!);
            onClickExtra?.();
          }}
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
        className={cn(
          "text-[15px] font-semibold no-underline transition-colors duration-150",
          isActive
            ? "text-brand-blue underline decoration-brand-blue underline-offset-4"
            : "text-brand-body hover:text-brand-blue"
        )}
        onClick={onClickExtra}
      >
        {link.label}
      </Link>
    );
  }

  const AuthSection = ({ onClose }: { onClose?: () => void }) => {
    if (session?.user) {
      const dashboardHref = roleDashboard[session.user.role] ?? "/";
      return (
        <div className="flex items-center gap-3">
          <Link
            href={dashboardHref}
            onClick={onClose}
            className="flex items-center gap-2 no-underline text-brand-body hover:text-brand-blue transition-colors duration-150"
          >
            <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
              <HiUser size={16} className="text-white" />
            </div>
            <span className="text-sm font-semibold">{session.user.name}</span>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { signOut({ callbackUrl: "/" }); onClose?.(); }}
            className="text-[13px] whitespace-nowrap hover:border-red-500 hover:text-red-600"
          >
            Sign Out
          </Button>
        </div>
      );
    }

    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/signin" onClick={onClose}>Sign In</Link>
      </Button>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-brand-border">
      {/* Desktop bar */}
      <div className="h-14 flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.svg" alt="Questify" width={120} height={32} className="h-8 w-auto object-contain" />
        </Link>

        {/* Nav links — desktop */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {publicNavLinks.map((link) => (
            <li key={link.to ?? link.id}>{renderLink(link)}</li>
          ))}
        </ul>

        {/* Auth — desktop */}
        <div className="hidden md:flex">
          <AuthSection />
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="md:hidden flex items-center justify-center text-brand-body hover:text-brand-blue transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-brand-border px-6 py-4 flex flex-col gap-4">
          {publicNavLinks.map((link) => renderLink(link, () => setOpen(false)))}
          <div className="mt-2">
            <AuthSection onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
}
