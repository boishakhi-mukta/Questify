"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: TeacherDashboard
 *
 * WHAT IT DOES (For Non-Technical Readers):
 * The teacher's landing dashboard — a grid of shortcut tiles linking to
 * courses, assignments, attendance, materials, analytics, and students.
 *
 * WHY IT EXISTS:
 * Gives faculty one central place to jump straight into their most common tasks.
 *
 * HOW IT WORKS (Technical Overview):
 * Maps a static list of quick-link definitions into clickable navigation cards.
 * ============================================================================
 */

import Link from "next/link";
import {
  HiBookOpen,
  HiClipboardDocumentList,
  HiUserGroup,
  HiChartBarSquare,
  HiCalendarDays,
  HiFolderOpen,
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";

const quickLinks = [
  {
    label: "My Courses",
    description: "View and manage all courses you are teaching",
    href:  "/teacher",
    icon:  HiBookOpen,
    accent: "#2DCE9A",
    accentBg: "#EDFAF5",
  },
  {
    label: "Assignments",
    description: "Create, edit, and grade student assignments",
    href:  "/teacher/assignments",
    icon:  HiClipboardDocumentList,
    accent: "#1B7A5A",
    accentBg: "#E0F5ED",
  },
  {
    label: "Attendance",
    description: "Track student attendance for your sessions",
    href:  "/teacher/attendance",
    icon:  HiCalendarDays,
    accent: "#1B4332",
    accentBg: "#D6EFE5",
  },
  {
    label: "Materials",
    description: "Upload and organise learning resources",
    href:  "/teacher/materials",
    icon:  HiFolderOpen,
    accent: "#25B585",
    accentBg: "#E8FAF4",
  },
  {
    label: "Analytics",
    description: "View student progress and engagement data",
    href:  "/teacher/analytics",
    icon:  HiChartBarSquare,
    accent: "#2DCE9A",
    accentBg: "#EDFAF5",
  },
  {
    label: "Student Directory",
    description: "Browse and contact enrolled students",
    href:  "/admin/users",
    icon:  HiUserGroup,
    accent: "#1B7A5A",
    accentBg: "#E0F5ED",
  },
];

// Renders the grid of quick-navigation tiles for the teacher's home page.
export default function TeacherDashboard() {
  return (
    <div className="flex flex-col gap-8">

      <div>
        <h2 className="text-lg font-bold text-brand-dark mb-1">Quick Navigation</h2>
        <p className="text-sm text-brand-body">
          Access your teaching tools from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map(({ label, description, href, icon: Icon, accent, accentBg }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-start gap-4 rounded-xl border border-brand-border bg-white p-5 hover:border-brand-blue hover:shadow-md transition-all duration-200"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: accentBg }}
            >
              <Icon size={22} style={{ color: accent }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-brand-dark group-hover:text-brand-blue transition-colors">
                {label}
              </p>
              <p className="text-xs text-brand-body mt-0.5 leading-relaxed">
                {description}
              </p>
            </div>
            <HiArrowTopRightOnSquare
              size={14}
              className="text-brand-body/30 group-hover:text-brand-blue shrink-0 mt-0.5 transition-colors"
            />
          </Link>
        ))}
      </div>

    </div>
  );
}
