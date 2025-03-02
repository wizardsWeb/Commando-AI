import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Define public and ignored routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
  "/api/clerk-webhook",
  "/api/drive-activity/notification",
  "/api/payment/success",
])

const isIgnoredRoute = createRouteMatcher([
  "/api/auth/callback/discord",
  "/api/auth/callback/notion",
  "/api/auth/callback/slack",
  "/api/flow",
  "/api/cron/wait",
])

export default clerkMiddleware(async (auth, req) => {
  // For ignored routes, return early
  if (isIgnoredRoute(req)) {
    return
  }

  // For non-public routes, check authentication
  if (!isPublicRoute(req)) {
    const authObject = await auth()

    // If user is not authenticated, redirect to sign-in
    if (!authObject.userId) {
      return authObject.redirectToSignIn({
        returnBackUrl: req.url,
      })
    }
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

