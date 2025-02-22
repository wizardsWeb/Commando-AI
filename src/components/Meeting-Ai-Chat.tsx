"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageCircleIcon as Message, SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ChatMessage {
  role: "assistant" | "user"
  content: string
}

export default function MeetingAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) throw new Error("Failed to fetch response")

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
        },
      ])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-screen w-[400px] bg-background border-l transition-transform duration-300 transform",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-12 top-4 bg-primary text-primary-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Message className="h-4 w-4" />
      </Button>

      <Card className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Meeting Assistant</h2>
        </div>

        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "flex w-max max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.role === "assistant" ? "bg-muted ml-0" : "bg-primary text-primary-foreground ml-auto",
                )}
              >
                {message.content}
              </div>
            ))}
            {isLoading && <div className="bg-muted w-max rounded-lg px-3 py-2 text-sm">Thinking...</div>}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about the meeting..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

