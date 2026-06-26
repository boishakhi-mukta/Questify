import type { Metadata } from "next";
import { Providers } from "@/components/theme/Providers";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Questify",
  description: "Learn the skills to shape your future",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster position="bottom-right" richColors theme="system" />
        </Providers>
      </body>
    </html>
  );
}
