"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";
import {
  HiSquares2X2,
  HiBookOpen,
  HiUsers,
  HiChartBar,
  HiDocumentChartBar,
  HiUser,
  HiCog6Tooth,
  HiDocumentArrowUp,
  HiClipboardDocumentList,
  HiCalendarDays,
  HiTrophy,
  HiQuestionMarkCircle,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";

// ── Nav definitions ──────────────────────────────────────────────────────────

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ElementType;
  exact?: boolean;
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/admin",           label: "Dashboard",  icon: HiSquares2X2,       exact: true },
    { href: "/admin/users",     label: "Users",      icon: HiUsers                         },
    { href: "/admin/courses",   label: "Courses",    icon: HiBookOpen                      },
    { href: "/admin/analytics", label: "Analytics",  icon: HiChartBar                      },
    { href: "/admin/reports",   label: "Reports",    icon: HiDocumentChartBar              },
    { href: "/admin/profile",   label: "Profile",    icon: HiUser                          },
    { href: "/admin/settings",  label: "Settings",   icon: HiCog6Tooth                     },
  ],
  teacher: [
    { href: "/teacher",               label: "Dashboard",       icon: HiSquares2X2,        exact: true },
    { href: "/teacher/courses",       label: "My Courses",      icon: HiBookOpen                       },
    { href: "/teacher/materials",     label: "Materials",       icon: HiDocumentArrowUp                },
    { href: "/teacher/assignments",   label: "Assignments",     icon: HiClipboardDocumentList          },
    { href: "/teacher/attendance",    label: "Attendance",      icon: HiCalendarDays                   },
    { href: "/teacher/analytics",     label: "Analytics",       icon: HiChartBar                       },
    { href: "/teacher/profile",       label: "Profile",         icon: HiUser                           },
    { href: "/teacher/settings",      label: "Settings",        icon: HiCog6Tooth                      },
  ],
  student: [
    { href: "/student",               label: "Dashboard",       icon: HiSquares2X2,        exact: true },
    { href: "/student/courses",       label: "My Courses",      icon: HiBookOpen                       },
    { href: "/student/leaderboard",   label: "Leaderboard",     icon: HiTrophy                         },
    { href: "/student/profile",       label: "Profile",         icon: HiUser                           },
    { href: "/student/settings",      label: "Settings",        icon: HiCog6Tooth                      },
    { href: "/student/help",          label: "Help & Support",  icon: HiQuestionMarkCircle             },
  ],
};

const roleBadge: Record<UserRole, "admin" | "teacher" | "student"> = {
  admin:   "admin",
  teacher: "teacher",
  student: "student",
};

const roleLabel: Record<UserRole, string> = {
  admin:   "Admin",
  teacher: "Faculty",
  student: "Student",
};

const roleActiveBg: Record<UserRole, string> = {
  admin:   "bg-violet-500/20",
  teacher: "bg-emerald-500/20",
  student: "bg-brand-blue/20",
};

// ── NavLink item ─────────────────────────────────────────────────────────────

function SidebarLink({
  item,
  role,
  onClick,
}: {
  item:    NavItem;
  role:    UserRole;
  onClick: () => void;
}) {
  const pathname  = usePathname();
  const isActive  = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon      = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] no-underline transition-colors duration-150",
          isActive
            ? `font-bold text-white ${roleActiveBg[role]}`
            : "font-medium text-white/55 hover:text-white hover:bg-white/8",
        )}
      >
        <Icon size={17} className="shrink-0" />
        {item.label}
      </Link>
    </li>
  );
}

// ── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({
  role,
  onClose,
  demoUser,
}: {
  role:      UserRole;
  onClose:   () => void;
  demoUser?: { name: string; email: string };
}) {
  const { user, logout } = useAuth();
  const navItems         = navByRole[role];

  const fullFromParts = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const displayName = demoUser?.name ?? (user?.fullName || fullFromParts || "User");
  const displaySub  = demoUser?.email ?? user?.email ?? "";
  const isDemo      = displaySub.endsWith("@demo.com");

  function handleSignOut() {
    if (demoUser) { window.location.href = "/login"; return; }
    logout();
  }

  return (
    <div className="flex flex-col h-full bg-brand-dark">

      {/* Logo */}
      <div className="px-5 pt-6 pb-4 shrink-0">
        <Link href="/" aria-label="Questify home">
          <Image
            src="/logo.svg"
            alt="Questify"
            width={110}
            height={28}
            className="h-7 w-auto brightness-0 invert"
          />
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-5 pb-4 shrink-0">
        <Badge variant={roleBadge[role]}>{roleLabel[role]}</Badge>
      </div>

      {/* Nav items */}
      <nav aria-label={`${roleLabel[role]} navigation`} className="flex-1 px-3 overflow-y-auto">
        <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <SidebarLink key={item.href} item={item} role={role} onClick={onClose} />
          ))}
        </ul>
      </nav>

      {/* Bottom section: theme toggle + user + sign out */}
      <div className="px-3 py-4 border-t border-white/8 shrink-0 space-y-1">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Divider */}
        <div className="h-px bg-white/8 my-2" />

        {/* Demo badge */}
        {isDemo && (
          <div className="px-2 py-1 bg-amber-400/15 border border-amber-400/25 rounded-md flex items-center justify-center mb-2">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              Demo Account
            </span>
          </div>
        )}

        {/* User info */}
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <HiUser size={16} className="text-white" />
            )}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white truncate leading-tight">{displayName}</p>
            <p className="text-[10px] text-white/40 truncate leading-tight">{displaySub}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-semibold text-white/55 border border-white/10 hover:border-red-500 hover:text-red-400 transition-colors duration-150"
        >
          <HiArrowRightOnRectangle size={15} />
          {demoUser ? "Exit Demo" : "Sign Out"}
        </button>
      </div>
    </div>
  );
}

// ── Sidebar wrapper (handles mobile overlay) ─────────────────────────────────

interface SidebarProps {
  role:      UserRole;
  open:      boolean;
  onClose:   () => void;
  demoUser?: { name: string; email: string };
}

export function Sidebar({ role, open, onClose, demoUser }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        id="app-sidebar"
        aria-label="Application sidebar"
        className={cn(
          // Desktop: always visible, sticky
          "hidden lg:flex lg:flex-col lg:w-[240px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen",
          // Mobile/tablet: fixed overlay
          "lg:!flex",
          open
            ? "flex fixed inset-y-0 left-0 z-50 w-[240px]"
            : "hidden",
        )}
      >
        <SidebarContent role={role} onClose={onClose} demoUser={demoUser} />
      </aside>
    </>
  );
}
