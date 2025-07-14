import { db } from "../src/db/drizzle"
import { users } from "../src/db/schema"
import { eq, notInArray } from "drizzle-orm"

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY
if (!CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is not set in environment variables.")
}

async function fetchClerkUserIds(): Promise<string[]> {
  const allUserIds: string[] = []
  let url = "https://api.clerk.com/v1/users?limit=100"
  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) throw new Error(`Failed to fetch Clerk users: ${res.status}`)
    const data = await res.json()
    allUserIds.push(...(data.data?.map((u: any) => u.id) || []))
    url = data?.next_url || null
  }
  return allUserIds
}

async function cleanupOrphanedUsers() {
  console.log("Fetching Clerk user IDs...")
  const clerkUserIds = await fetchClerkUserIds()
  console.log(`Found ${clerkUserIds.length} users in Clerk.`)

  // Get all local users
  const localUsers = await db.select().from(users)
  const orphaned = localUsers.filter(u => !clerkUserIds.includes(u.clerkUserId))
  if (orphaned.length === 0) {
    console.log("No orphaned users found.")
    return
  }
  // Delete orphaned users
  await db.delete(users).where(notInArray(users.clerkUserId, clerkUserIds))
  console.log(`Deleted ${orphaned.length} orphaned users from the database.`)
}

cleanupOrphanedUsers().catch((err) => {
  console.error("Error cleaning up orphaned users:", err)
  process.exit(1)
}) 