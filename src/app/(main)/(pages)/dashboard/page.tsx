"use client"

import { Calendar } from "@/components/ui/Calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PopupAssistant } from "@/components/PopupAssistant"
import { CalendarIcon, Users, Bot, Video } from "lucide-react"
import { ModeToggle } from "@/components/global/mode-toggle"
import { CalendarCard } from "@/components/CalendarCard"

const data = [
  { month: "Jan", users: 600 },
  { month: "Feb", users: 300 },
  { month: "Mar", users: 800 },
  { month: "Apr", users: 700 },
  { month: "May", users: 1400 },
  { month: "Jun", users: 1800 },
]

const meetings = [
  {
    title: "Team Sync",
    time: "2:00 PM",
    attendees: 5,
  },
  {
    title: "Product Review",
    time: "4:00 PM",
    attendees: 8,
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col ">
      {/* Header */}
      <header className="sticky top-0 z-[10] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 overflow-y-auto mx-24">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Stats Graph */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Growth Statistics</CardTitle>
              <CardDescription>Platform growth and user engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar
              </CardTitle>
              <CardDescription>Integrated with Google Calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" className="rounded-md border" />
            </CardContent>
          </Card> */}
          <CalendarCard />

          {/* AI Platform Info */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Platform
              </CardTitle>
              <CardDescription>Multi-agent AI system capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Active Users</p>
                    <p className="text-2xl font-bold">2,543</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">AI Interactions</p>
                    <p className="text-2xl font-bold">12,345</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meetings Info */}
          <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Upcoming AI-Powered Meetings
        </CardTitle>
        <CardDescription>Today's scheduled AI-enhanced meetings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="relative w-full aspect-video max-h-[400px]">
            <img
              src="https://smartek21.com/wp-content/uploads/2021/11/ai-powered-header.png"
              alt="AI-Powered Meeting Illustration"
              className="rounded-lg object-cover w-full h-full"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4 w-full">
            {meetings.map((meeting, index) => (
              <div key={index} className="rounded-lg border p-6 bg-card">
                <div className="space-y-3">
                  <p className="text-xl font-semibold">{meeting.title}</p>
                  <p className="text-lg text-muted-foreground">{meeting.time}</p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{meeting.attendees} attendees</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
          
          <PopupAssistant />
        </div>
      </main>

    </div>
  )
}

