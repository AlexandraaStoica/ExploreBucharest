"use client"

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "../ui/button"

export function Header() {
  const { isSignedIn } = useUser()

  return (
    <header className="bg-cream px-6 py-4 flex justify-between items-center border-b border-burgundy/10">
      <div>
        <h1 className="text-2xl font-bold text-burgundy font-display">BucharEst</h1>
        <p className="text-sm text-burgundy/70">Explorer</p>
      </div>

      {!isSignedIn ? (
        <div className="flex gap-3">
          <SignInButton mode="modal">
            <Button variant="outline" className="border-burgundy text-burgundy hover:bg-burgundy/5 bg-transparent">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="bg-burgundy hover:bg-burgundy/90">Sign Up</Button>
          </SignUpButton>
        </div>
      ) : (
        <UserButton afterSignOutUrl="/" />
      )}
    </header>
  )
}
