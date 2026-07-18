/**
 * ============================================================================
 * QUESTIFY ROOT LAYOUT: Global Page Wrapper
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The master wrapper template setting global themes and layouts.
 * 
 * WHY IT EXISTS:
 * Standardizes metadata configuration and global CSS across the app.
 * 
 * HOW IT WORKS (Technical Overview):
 * Implements HTML schemas and wraps Next.js pages inside providers.
 * ============================================================================
 */

import type { Metadata } from "next";
import { Providers } from "@/components/theme/Providers";
import { ChatAssistant } from "@/components/ai/ChatAssistant";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Questify",
  description: "Learn the skills to shape your future",
  icons: { icon: "/logo.svg" },
};

// Wraps every single page in the app with the shared setup: theming/auth
// providers, the global CSS, popup notifications (toasts), and the floating
// AI chat assistant button.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <div className="flex-1">{children}</div>
          <Toaster position="bottom-right" richColors theme="system" />
          <ChatAssistant />
        </Providers>
      </body>
    </html>
  );
}
