import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import fs from "fs"
import path from "path"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "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",
})

export async function POST(req: NextRequest) {
  if (!openai.apiKey) {
    console.error("OpenAI API key is missing")
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
  }

  try {
    console.log("Receiving audio file...")
    const formData = await req.formData()
    const audioFile = formData.get("file") as Blob
    const meetingId = formData.get("meetingId") as string

    if (!audioFile) {
      console.error("No audio file provided")
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    if (!meetingId) {
      console.error("No meeting ID provided")
      return NextResponse.json({ error: "No meeting ID provided" }, { status: 400 })
    }

    // Convert Blob to Buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a temporary file
    const tmpDir = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    const tempFilePath = path.join(tmpDir, `temp_${Date.now()}.webm`)
    fs.writeFileSync(tempFilePath, buffer)

    try {
      console.log("Sending audio file to OpenAI for transcription...")
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        response_format: "text",
        language: "en",
      })

      // Clean up temp file
      fs.unlinkSync(tempFilePath)

      if (!response) {
        throw new Error("No transcription received from OpenAI")
      }

      console.log("Transcription received:", response)

      // Save transcription to a file
      const transcriptionsDir = path.join(process.cwd(), "transcriptions")
      if (!fs.existsSync(transcriptionsDir)) {
        fs.mkdirSync(transcriptionsDir, { recursive: true })
      }

      const filePath = path.join(transcriptionsDir, `${meetingId}.txt`)
      fs.appendFileSync(filePath, response + " ")

      return NextResponse.json({ transcription: response })
    } finally {
      // Ensure temp file is deleted even if transcription fails
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
    }
  } catch (error: any) {
    console.error("Error in transcription route:", error)

    // Determine if it's an OpenAI API error
    if (error.response) {
      console.error("OpenAI API Error:", {
        status: error.response.status,
        data: error.response.data,
      })
      return NextResponse.json(
        { error: "OpenAI API error", details: error.response.data },
        { status: error.response.status },
      )
    }

    // Generic error handling
    return NextResponse.json(
      {
        error: "Transcription failed",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

// Increase payload size limit for audio files
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}

