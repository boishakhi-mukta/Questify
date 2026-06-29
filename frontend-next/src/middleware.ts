import { NextRequest, NextResponse } from "next/server";

// Routes that do NOT require a JWT cookie
const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/signin",
  "/forgot-password",
  "/change-password",
  "/auth",
  "/courses",
  "/about",
  "/contact",
  "/help",
  "/demo",
  "/api/",
  "/_next",
  "/favicon",
];

function isPublic(pathname: string): boolean {
  // Exact root match
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.slice(1).some((prefix) => pathname.startsWith(prefix));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    // Already authenticated + visiting login → redirect to dashboard
    if (pathname === "/login") {
      const token = req.cookies.get("questify_token")?.value;
      const role  = req.cookies.get("questify_role")?.value;
      if (token && role) {
        const dest = role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";
        return NextResponse.redirect(new URL(dest, req.url));
      }
    }
    return NextResponse.next();
  }

  // Protected route — require token cookie
  const token = req.cookies.get("questify_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.lottie|.*\\.png|.*\\.jpg|.*\\.webp).*)",
  ],
};
