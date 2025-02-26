import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/sign-in*",
    "/sign-up*",
    "/api/clerk-webhook",
    "/api/drive-activity/notification",
    "/api/payment/success",
    "/api/webhooks/clerk",
    "/api/webhooks/stripe",
  ],

  // Routes that can always be accessed, and have no authentication information
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
    // Redirect users who aren't authenticated unless they are accessing a public route
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
