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
    // Allow access to ignored routes without authentication check
    if (auth.isIgnoredRoute) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users if they try to access a protected route
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
    "/(api|trpc)(.*)",
  ],
};
