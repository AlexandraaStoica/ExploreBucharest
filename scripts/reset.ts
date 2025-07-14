import { db } from "../src/db/drizzle"
import { events, locations } from "../src/db/schema"

async function reset() {
  console.log("Deleting all events and locations...")
  await db.delete(events)
  await db.delete(locations)
  console.log("All events and locations deleted.")
}

reset().catch((error) => {
  console.error("Error resetting database:", error)
  process.exit(1)
}) 