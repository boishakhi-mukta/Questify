import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(function middleware(req) {
  const { nextUrl, auth: session } = req as typeof req & { auth: { user?: { role?: string } } | null };
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const path = nextUrl.pathname;

  // Logged-in user visiting /signin → redirect to their dashboard
  if (path === "/signin" && isLoggedIn && role) {
    return NextResponse.redirect(new URL(`/${role}`, nextUrl));
  }

  // Public paths — always allow
  if (
    path === "/" ||
    path === "/signin" ||
    path.startsWith("/courses") ||
    path.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Not logged in → send to sign in
  if (!isLoggedIn) {
    const signInUrl = new URL("/signin", nextUrl);
    signInUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based access control
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(`/${role}`, nextUrl));
  }
  if (path.startsWith("/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL(`/${role}`, nextUrl));
  }
  if (path.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL(`/${role}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.lottie|.*\\.png|.*\\.jpg|.*\\.webp).*)",
  ],
};
