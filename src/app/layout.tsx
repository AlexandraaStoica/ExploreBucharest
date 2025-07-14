import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display } from "next/font/google"
import { ClerkProvider, UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Link from "next/link"
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
        <body className={`${playfair.variable} font-sans bg-cream`}>
          <header className="bg-cream px-6 py-4 flex justify-between items-center border-b border-burgundy/10">
            <div>
              <Link href="/" className="text-2xl font-bold text-burgundy font-display">BucharEst</Link>
              <p className="text-sm text-burgundy/70">Explorer</p>
            </div>
            <div className="flex items-center gap-4">
              <SignedIn>
                <Link href="/profile" className="text-burgundy font-semibold hover:underline">Profile</Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-burgundy text-white px-4 py-2 rounded">Sign In</button>
                </SignInButton>
              </SignedOut>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
