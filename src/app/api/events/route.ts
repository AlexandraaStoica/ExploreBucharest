import { getAllEvents, getUserByClerkId, createUser } from "@/db/queries"
import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"

export async function GET() {
  try {
    // Clerk-Neon DB binding (no webhooks)
    let user
    try {
      user = await currentUser()
      console.log("[Clerk] currentUser:", user)
    } catch (err) {
      console.error("[Clerk] Error getting currentUser:", err)
    }
    if (user && user.id) {
      let dbUser = await getUserByClerkId(user.id)
      console.log("[DB] getUserByClerkId result:", dbUser)
      if (!dbUser || dbUser.length === 0) {
        const username = user.username || `user_${user.id.slice(0, 8)}`
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous'
        const email = user.emailAddresses?.[0]?.emailAddress || ''
        console.log("[DB] Creating user with:", { id: user.id, username, name, email })
        try {
          await createUser(user.id, username, name, email)
          console.log("[DB] User created successfully")
        } catch (err) {
          console.error("[DB] Error creating user:", err)
        }
      }
    }
    const events = await getAllEvents()
    return NextResponse.json(events)
  } catch (error) {
    console.error("[API] Error in GET /api/events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
