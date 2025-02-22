import { OpenAIStream, StreamingTextResponse } from "ai"
import { Configuration, OpenAIApi } from "openai-edge"

const config = new Configuration({
  apiKey: process.env.NEXT_OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Here you would:
  // 1. Get relevant meeting transcripts from your vector DB
  // 2. Add them to the system prompt
  const systemPrompt = {
    role: "system",
    content: `You are an AI meeting assistant that helps users understand and recall information from their meetings. 
    You have access to meeting transcripts and can answer questions about the discussion.
    Always be concise and accurate in your responses.
    If you're not sure about something, admit it and don't make assumptions.
    
    Meeting Context:
    [Insert relevant meeting transcripts here]`,
  }

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [systemPrompt, ...messages],
    temperature: 0.7,
    stream: true,
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}

