import { type NextRequest, NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai"
import fs from "fs"
import path from "path"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export async function POST(req: NextRequest) {
  if (!configuration.apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as Blob
    const meetingId = formData.get("meetingId") as string

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    if (!meetingId) {
      return NextResponse.json({ error: "No meeting ID provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer())

    const response = await openai.createTranscription(buffer as any, "whisper-1", undefined, "text")

    const transcription = response.data as string

    // Save transcription to a file
    const transcriptionsDir = path.join(process.cwd(), "transcriptions")
    if (!fs.existsSync(transcriptionsDir)) {
      fs.mkdirSync(transcriptionsDir)
    }

    const filePath = path.join(transcriptionsDir, `${meetingId}.txt`)
    fs.appendFileSync(filePath, transcription + " ")

    return NextResponse.json({ transcription })
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      return NextResponse.json({ error: error.response.data }, { status: error.response.status })
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`)
      return NextResponse.json({ error: "An error occurred during your request." }, { status: 500 })
    }
  }
}

