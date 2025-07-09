import { db } from "./drizzle"
import { users, events, locations, eventReservations } from "./schema"
import { eq, desc, gte } from "drizzle-orm"

// User operations
export async function createUser(clerkUserId: string, username: string, name: string, email: string) {
  return await db
    .insert(users)
    .values({
      clerkUserId,
      username,
      name,
      email,
    })
    .returning()
}

export async function getUserByClerkId(clerkUserId: string) {
  return await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1)
}

// Event operations
export async function getAllEvents() {
  return await db.select().from(events).orderBy(desc(events.startDatetime)).limit(20)
}

export async function getUpcomingEvents() {
  const now = new Date()
  return await db.select().from(events).where(gte(events.startDatetime, now)).orderBy(events.startDatetime).limit(10)
}

export async function getEventById(eventId: string) {
  return await db.select().from(events).where(eq(events.id, eventId)).limit(1)
}

export async function getEventsByCategory(
  category:
    | "festival"
    | "concert"
    | "exhibition"
    | "standup"
    | "theater"
    | "film"
    | "dance"
    | "meetup"
    | "museum"
    | "monument"
    | "gallery"
    | "activity",
) {
  return await db.select().from(events).where(eq(events.category, category)).orderBy(desc(events.startDatetime))
}

// Location operations
export async function getAllLocations() {
  return await db.select().from(locations).limit(20)
}

export async function getLocationById(locationId: string) {
  return await db.select().from(locations).where(eq(locations.id, locationId)).limit(1)
}

// Reservation operations
export async function createReservation(userId: string, eventId: string, quantity: number) {
  return await db
    .insert(eventReservations)
    .values({
      userId,
      eventId,
      quantity,
    })
    .returning()
}

export async function getUserReservations(userId: string) {
  return await db.select().from(eventReservations).where(eq(eventReservations.userId, userId))
}
