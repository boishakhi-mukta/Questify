import NextAuth from "next-auth";
import { authConfig, type UserRole } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware uses the Edge-safe config (no Credentials provider / Node.js APIs)
const { auth } = NextAuth(authConfig);

export default auth(function middleware(req) {
  const session = (req as NextRequest & { auth: { user?: { role?: UserRole } } | null }).auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const { pathname } = req.nextUrl;

  // Logged-in user visiting /signin → go straight to their dashboard
  if (pathname === "/signin" && isLoggedIn && role) {
    return NextResponse.redirect(new URL(`/${role}`, req.nextUrl));
  }

  // Always-public paths
  if (
    pathname === "/" ||
    pathname === "/signin" ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Protected — must be logged in
  if (!isLoggedIn) {
    const url = new URL("/signin", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based access control
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(`/${role}`, req.nextUrl));
  }
  if (pathname.startsWith("/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL(`/${role}`, req.nextUrl));
  }
  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL(`/${role}`, req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.lottie|.*\\.png|.*\\.jpg|.*\\.webp).*)",
  ],
};
