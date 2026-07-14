"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: Layout
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A layout shell that positions the Navbar, Sidebar, and core page contents correctly.
 * 
 * WHY IT EXISTS:
 * Saves code repetition by structuring all application sub-views inside one main skeleton.
 * 
 * HOW IT WORKS (Technical Overview):
 * Integrates sidebar positioning, desktop/mobile responsive spacing, and standard styling.
 * ============================================================================
 */

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "@/components/navbar/Navbar";
import type { UserRole } from "@/types/auth";

interface LayoutProps {
  children:  ReactNode;
  role:      UserRole;
  /** Pass through for /demo/* pages that don't have a real auth user */
  demoUser?: { name: string; email: string };
}

/**
 * Authenticated page layout: sticky top navbar + collapsible sidebar + main content.
 *
 * Usage (in a Server Component layout file):
 *   <Layout role="admin">{children}</Layout>
 */
export default function Layout({ children, role, demoUser }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-bg dark:bg-slate-950">

      {/* ── Sidebar ── */}
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        demoUser={demoUser}
      />

      {/* ── Right column: navbar + scrollable content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        <Navbar
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />

        {/* Page content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-6 py-7 lg:px-10 lg:py-9 outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
