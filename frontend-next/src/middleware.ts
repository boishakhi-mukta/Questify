import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/auth(.*)",
  "/courses(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect everything that isn't public.
  // Clerk redirects to NEXT_PUBLIC_CLERK_SIGN_IN_URL on failure.
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.lottie|.*\\.png|.*\\.jpg|.*\\.webp).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
