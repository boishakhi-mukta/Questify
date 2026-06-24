import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Questify",
  description: "Learn the skills to shape your future",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SessionProviderWrapper>
          <div className="flex-1">{children}</div>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
