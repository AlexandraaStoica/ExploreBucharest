import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "BucharEst Explorer - Discover the Cultural Heart of Bucharest",
  description:
    "Explore events, activities, historical sites, and the best food & drink spots in Romania's vibrant capital",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${playfair.variable} font-sans bg-cream`}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
