"use client";

import Link              from "next/link";
import Image             from "next/image";
import { usePathname }   from "next/navigation";
import { useAuth }       from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";
import { cn }            from "@/lib/utils";
import { Badge }         from "@/components/ui/badge";
import {
  HiHome,
  HiUsers,
  HiAcademicCap,
  HiBookOpen,
  HiChartBar,
  HiArrowRightOnRectangle,
  HiUser,
} from "react-icons/hi2";

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ElementType;
}

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/admin",         label: "Overview",  icon: HiHome     },
    { href: "/admin/users",   label: "Users",     icon: HiUsers    },
    { href: "/admin/courses", label: "Courses",   icon: HiBookOpen },
  ],
  teacher: [
    { href: "/teacher",          label: "Overview",   icon: HiHome        },
    { href: "/teacher/courses",  label: "My Courses", icon: HiBookOpen    },
    { href: "/teacher/students", label: "Students",   icon: HiAcademicCap },
  ],
  student: [
    { href: "/student",             label: "Overview",    icon: HiHome     },
    { href: "/student/courses",     label: "My Courses",  icon: HiBookOpen },
    { href: "/student/leaderboard", label: "Leaderboard", icon: HiChartBar },
  ],
};

const roleBadgeVariant: Record<UserRole, "admin" | "teacher" | "student"> = {
  admin:   "admin",
  teacher: "teacher",
  student: "student",
};

const roleLabel: Record<UserRole, string> = {
  admin:   "Admin",
  teacher: "Teacher",
  student: "Student",
};

const roleActiveBg: Record<UserRole, string> = {
  admin:   "bg-violet-500/20",
  teacher: "bg-emerald-500/20",
  student: "bg-brand-blue/20",
};

// ── Backward-compat demo override (used by /demo/* pages) ─────────────────────
interface DemoUser { name: string; email: string }

export default function DashboardShell({
  children,
  role,
  demoUser,
}: {
  children:  React.ReactNode;
  role:      UserRole;
  demoUser?: DemoUser;
}) {
  const pathname           = usePathname();
  const { user, logout }   = useAuth();

  const navItems   = navByRole[role];
  const displayName = demoUser?.name ?? user?.fullName ??
    (`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "User");
  const displaySub  = demoUser?.email ?? user?.email ?? "";
  const isDemo      = displaySub.endsWith("@demo.com");

  function handleSignOut() {
    if (demoUser) {
      window.location.href = "/login";
    } else {
      logout();
    }
  }

  return (
    <div className="flex min-h-screen bg-brand-bg">

      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 bg-brand-dark flex flex-col sticky top-0 h-screen">

        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <Link href="/">
            <Image src="/logo.svg" alt="Questify" width={110} height={28} className="h-7 w-auto brightness-0 invert" />
          </Link>
        </div>

        {/* Role badge */}
        <div className="px-5 pb-5">
          <Badge variant={roleBadgeVariant[role]}>{roleLabel[role]}</Badge>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3">
          <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === `/${role}` ? pathname === href : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm no-underline transition-colors duration-150",
                      isActive
                        ? `font-bold text-white ${roleActiveBg[role]}`
                        : "font-medium text-white/55 hover:text-white hover:bg-white/8"
                    )}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + sign out */}
        <div className="px-5 py-4 border-t border-white/8">

          {/* Demo badge */}
          {isDemo && (
            <div className="mb-3 px-2 py-1 bg-amber-400/15 border border-amber-400/25 rounded-md flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Demo Account
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
              {user?.avatar ? (
                <Image src={user.avatar} alt={displayName} width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <HiUser size={18} className="text-white" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-semibold text-white truncate">{displayName}</p>
              <p className="text-[11px] text-white/45 truncate">{displaySub}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 bg-transparent border border-white/15 rounded-md px-3 py-2 text-[13px] font-semibold text-white/55 cursor-pointer transition-colors duration-150 hover:border-red-500 hover:text-red-400"
          >
            <HiArrowRightOnRectangle size={16} />
            {demoUser ? "Exit Demo" : "Sign Out"}
          </button>
        </div>

      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-10 py-9">
        {children}
      </main>

    </div>
  );
}
