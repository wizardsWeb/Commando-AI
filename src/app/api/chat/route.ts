import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai"
import fs from "fs"
import path from "path"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "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",
})

export async function POST(req: NextRequest) {
  if (!openai.apiKey) {
    console.error("OpenAI API key not configured.")
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
  }

  try {
    const { query, meetingId: meetingIdInput } = await req.json()
    const meetingId = meetingIdInput || "default-meeting"

    if (!query) {
      console.error("No query provided.")
      return NextResponse.json({ error: "No query provided" }, { status: 400 })
    }

    console.log(`Received query: "${query}" for meeting: "${meetingId}"`)

    // Construct the path to the transcription file
    const transcriptionsDir = path.join(process.cwd(), "transcriptions")
    const filePath = path.join(transcriptionsDir, `${meetingId}.txt`)

    let context = ""
    if (fs.existsSync(filePath)) {
      context = fs.readFileSync(filePath, "utf-8")
      console.log(`Loaded transcription from ${filePath}`)
    } else {
      console.warn(`Transcription file ${filePath} does not exist. Context will be empty.`)
    }

    // Prepare the messages for the chat completion
    const messages: Array<{ role: "system" | "user"; content: string }> = [
      {
        role: "system",
        content:
          "You are a helpful assistant that provides insightful, clear, and concise answers based on the context of a business meeting transcription. Your tone is professional and business-like.",
      },
      {
        role: "user",
        content: `Here is the context of the meeting:\n\n${context}\n\nBased on this conversation, please answer the following question:\n${query}`,
      },
    ]

    console.log("Sending messages to OpenAI for chat completion...")
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const answer = completion.choices[0]?.message?.content

    if (!answer) {
      throw new Error("No answer received from OpenAI")
    }

    console.log("Received answer from OpenAI:", answer)
    return NextResponse.json({ answer:answer })
  } catch (error: any) {
    console.error("Error processing request:", error)

    // Handle OpenAI API errors
    if (error.response) {
      return NextResponse.json(
        {
          error: "OpenAI API error",
          details: error.response.data || error.message,
        },
        { status: error.response.status || 500 },
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "An error occurred during your request.",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

// Increase the response size limit for longer answers
export const config = {
  api: {
    responseLimit: false,
  },
}

