import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as Blob

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert blob to base64
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const base64Audio = buffer.toString("base64")

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64Audio,
        model: "whisper-1",
        response_format: "text",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to transcribe audio")
    }

    const transcript = await response.text()

    // Store transcript in vector database here
    // This is where you'd implement your embedding storage

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to process audio" }, { status: 500 })
  }
}

