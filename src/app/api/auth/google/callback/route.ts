import { clerkClient } from "@clerk/nextjs"
import { OAuth2Client } from "google-auth-library"
import { NextResponse } from "next/server"

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state") // This should be the userId we passed earlier

  if (!code || !state) {
    return new NextResponse("Missing authorization code or state", { status: 400 })
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Store tokens in Clerk user metadata
    await clerkClient.users.updateUser(state, {
      privateMetadata: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      },
    })

    // Redirect to the dashboard or wherever you want after successful connection
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Error in Google OAuth callback:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

