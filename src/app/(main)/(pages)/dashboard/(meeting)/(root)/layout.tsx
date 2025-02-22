import { ReactNode } from 'react';

import StreamVideoProvider from '@/providers/StreamClientProvider';
import Sidebar from '@/components/sidebar/index';
import type { Metadata } from "next"
import "@stream-io/video-react-sdk/dist/css/styles.css"
import { Urbanist } from "next/font/google"
import { cn } from "@/lib/utils"

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
})

export const metadata: Metadata = {
  title: "EdifyAI",
  description: "EdifyAI",
  icons: ["/icons/logo.png"],
}

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <main className={cn("font-sans", urbanist.variable)}>
      <StreamVideoProvider>{children}</StreamVideoProvider>
    </main>
  )
}

export default layout

