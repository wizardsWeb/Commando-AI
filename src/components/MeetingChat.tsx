"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, SendHorizontal, X, MinimizeIcon, MaximizeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTranscription } from "@/providers/transcript-provider"

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: number
}

export default function MeetingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { state: transcriptionState } = useTranscription()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
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
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          meetingTranscript: transcriptionState.fullText,
        }),
      })

      if (!response.ok) throw new Error("Failed to fetch response")

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
          timestamp: Date.now(),
        },
      ])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-full p-2 shadow-lg"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-[380px] rounded-lg overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-sm"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 bg-zinc-900 border-b border-zinc-800">
              <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4" />
                Meeting Chat
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-zinc-800"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? (
                    <MaximizeIcon className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <MinimizeIcon className="h-4 w-4 text-zinc-400" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-zinc-800"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4 text-zinc-400" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Chat Messages */}
                  <ScrollArea className="h-[400px] p-3">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-2 text-sm",
                            message.role === "assistant" ? "flex-row" : "flex-row-reverse",
                          )}
                        >
                          <Avatar className="w-6 h-6 border border-zinc-800 bg-zinc-900">
                            <AvatarFallback className="text-xs bg-zinc-800 text-zinc-400">
                              {message.role === "assistant" ? "AI" : "ME"}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "rounded-lg px-3 py-2 max-w-[75%] text-sm",
                              message.role === "assistant" ? "bg-zinc-800/50 text-white" : "bg-purple-600 text-white",
                            )}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-2">
                          <Avatar className="w-6 h-6 border border-zinc-800 bg-zinc-900">
                            <AvatarFallback className="text-xs bg-zinc-800 text-zinc-400">AI</AvatarFallback>
                          </Avatar>
                          <div className="bg-zinc-800/50 text-white rounded-lg px-3 py-2 text-sm">Thinking...</div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Chat Input */}
                  <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask about the meeting..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 h-9 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400 text-sm"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="h-9 w-9 bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={isLoading}
                      >
                        <SendHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

