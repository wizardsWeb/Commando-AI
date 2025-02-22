"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, SendHorizontal, X, MinimizeIcon, MaximizeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

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
          query: input,
          meetingId: "default-meeting",
        }),
      })

      if (!response.ok) throw new Error("Failed to fetch response")

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
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
    <div className="fixed bottom-3 right-4 z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full p-3 pl-4 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-7 w-7" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="w-[380px] overflow-hidden shadow-2xl bg-background/95 backdrop-blur-sm border-primary/20">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-3 border-b border-primary/10 bg-primary/5">
                <h2 className="font-medium flex items-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span>Meeting Chat</span>
                </h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-primary/10"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <MaximizeIcon className="h-4 w-4" /> : <MinimizeIcon className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-primary/10"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
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
                    <ScrollArea className="h-[400px] p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-2 text-sm",
                              message.role === "assistant" ? "flex-row" : "flex-row-reverse",
                            )}
                          >
                            <Avatar className="h-8 w-8 border shadow-sm">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {message.role === "assistant" ? "AI" : "ME"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2 max-w-[75%] text-sm leading-relaxed shadow-sm",
                                message.role === "assistant"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-primary text-primary-foreground",
                              )}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex gap-2">
                            <Avatar className="h-8 w-8 border shadow-sm">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">AI</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted text-muted-foreground rounded-2xl px-4 py-2 text-sm animate-pulse">
                              Thinking...
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-primary/10">
                      <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                          placeholder="Ask about the meeting..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          disabled={isLoading}
                          className="flex-1 bg-muted/50"
                        />
                        <Button type="submit" size="icon" disabled={isLoading} className="h-10 w-10 rounded-full">
                          <SendHorizontal className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

