import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { messages, audioTranscript } = await req.json()
    let response

    if (audioTranscript) {
    //   console.log("Sending request to webhook:", { query: audioTranscript })

      // Send the transcribed text to the webhook
      const webhookResponse = await fetch("https://virushacks.app.n8n.cloud/webhook-test/aichat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: audioTranscript }),
      })

      console.log("Webhook response status:", webhookResponse.status)

      if (webhookResponse.ok) {
        const data = await webhookResponse.json()
        console.log("Webhook response data:", data)
        response = data.output
      } else {
        console.error("Webhook error:", await webhookResponse.text())
        response = "Sorry, there was an error processing your request."
      }
    } else {
      // Use OpenAI for regular chat messages
      console.log("Sending request to OpenAI:", messages)


      response = "I am sorry , but i am not able to understand the audio" // Get the text response from OpenAI
    }

    // Return the response in the expected chat format
    return new Response(JSON.stringify({ role: "assistant", content: response }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("API route error:", error)
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}