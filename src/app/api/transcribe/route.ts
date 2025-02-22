import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { writeFile, mkdir, unlink, appendFile, existsSync } from "fs/promises"
import path from "path"

// Set runtime to nodejs since we need file system access
export const runtime = "nodejs"


// Increase payload size limit
export const maxDuration = 300 // 5 minutes timeout

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // Create temporary directories if they don't exist
    const tmpDir = path.join(process.cwd(), "tmp")
    const transcriptionsDir = path.join(process.cwd(), "transcriptions")

    await mkdir(tmpDir, { recursive: true })
    await mkdir(transcriptionsDir, { recursive: true })

    // Create temporary file
    const tempFilePath = path.join(tmpDir, `temp_${Date.now()}.webm`)
    await writeFile(tempFilePath, buffer)

    try {
      console.log("Sending audio file to OpenAI for transcription...")
      const transcription = await openai.audio.transcriptions.create({
        file: await import("fs").then((fs) => fs.createReadStream(tempFilePath)),
        model: "whisper-1",
        response_format: "text",
        language: "en",
      })

      // Clean up temp file
      await unlink(tempFilePath)

      if (!transcription) {
        throw new Error("No transcription received from OpenAI")
      }

      console.log("Transcription received:", transcription)

      // Save transcription to a file
      const filePath = path.join(transcriptionsDir, `${meetingId}.txt`)
      await appendFile(filePath, transcription + " ")

      return NextResponse.json({ transcription })
    } finally {
      // Ensure temp file is deleted even if transcription fails
      if (existsSync(tempFilePath)) {
        await unlink(tempFilePath)
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

