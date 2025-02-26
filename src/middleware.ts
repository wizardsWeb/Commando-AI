import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/clerk-webhook",
    "/api/drive-activity/notification",
    "/api/payment/success",
    "/api/webhooks/clerk",
    "/api/webhooks/stripe",
  ],

  ignoredRoutes: [
    "/api/webhooks/clerk",
    "/api/webhooks/stripe",
    "/api/auth/callback/discord",
    "/api/auth/callback/notion",
    "/api/auth/callback/slack",
    "/api/flow",
    "/api/cron/wait",
  ],

  afterAuth(auth, req) {
    // Check if the current route is in ignoredRoutes
    const isIgnoredRoute = ignoredRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    // Handle requests to ignored routes
    if (isIgnoredRoute) {
      return NextResponse.next();
    }

    // Redirect if not authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      // Preserve the current URL as a redirect after sign-in
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files with extensions (.svg, .jpg, etc)
     */
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};