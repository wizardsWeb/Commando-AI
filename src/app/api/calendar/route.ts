import { currentUser } from "@clerk/nextjs/server"
import { google } from "googleapis"
import { NextResponse } from "next/server"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

export async function GET() {
  try {
    const user = await currentUser() // ✅ Await the function

  if (!user) {
    return { message: 'User not found' }
  }

  const userId = user.id // ✅ Get user ID properly
    const { googleAccessToken, googleRefreshToken } = user.privateMetadata as {
      googleAccessToken?: string
      googleRefreshToken?: string
    }

    if (!googleAccessToken || !googleRefreshToken) {
      return new NextResponse("Google Calendar not connected", { status: 400 })
    }

    oauth2Client.setCredentials({
      access_token: googleAccessToken,
      refresh_token: googleRefreshToken,
    })

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    })

    const events =
      response.data.items?.map((event) => ({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
      })) || []

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to fetch calendar events:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

