import { auth } from "@clerk/nextjs"
import { OAuth2Client } from "google-auth-library"
import { NextResponse } from "next/server"

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

export async function GET() {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
    state: userId, // Pass the userId as state to retrieve it in the callback
    prompt: "consent", // Force the consent screen to appear every time
  })

  return NextResponse.json({ authUrl })
}

