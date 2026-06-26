"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
