import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { eventReservations, events, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    
    // Get user from our database
    let userRows = await db.select().from(users).where(eq(users.clerkUserId, user.id));
    let dbUser;
    
    if (!userRows.length) {
      // Create user if they don't exist (for users who signed up before webhook was configured)
      const [newUser] = await db.insert(users).values({
        clerkUserId: user.id,
        username: user.username || `user_${user.id.slice(0, 8)}`,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
        email: user.emailAddresses[0]?.emailAddress || '',
      }).returning();
      dbUser = newUser;
    } else {
      dbUser = userRows[0];
    }
    
    // Find reservations for this user
    const reservations = await db.select().from(eventReservations).where(eq(eventReservations.userId, dbUser.id));
    if (!reservations.length) return NextResponse.json([]);
    // Get event details for each reservation
    const eventIds = reservations.map(r => r.eventId);
    const eventRows = await db.select().from(events).where(inArray(events.id, eventIds));
    // Merge reservations with event details
    const tickets = reservations.map(res => {
      const event = eventRows.find(ev => ev.id === res.eventId);
      return { ...res, event };
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    
    // Get user from our database
    let userRows = await db.select().from(users).where(eq(users.clerkUserId, user.id));
    let dbUser;
    
    if (!userRows.length) {
      // Create user if they don't exist (for users who signed up before webhook was configured)
      const [newUser] = await db.insert(users).values({
        clerkUserId: user.id,
        username: user.username || `user_${user.id.slice(0, 8)}`,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
        email: user.emailAddresses[0]?.emailAddress || '',
      }).returning();
      dbUser = newUser;
    } else {
      dbUser = userRows[0];
    }
    
    const body = await req.json();
    const { eventId, quantity } = body;
    if (!eventId || !quantity) {
      return NextResponse.json({ error: "Missing eventId or quantity" }, { status: 400 });
    }
    
    // Insert reservation using database user ID
    const [reservation] = await db.insert(eventReservations).values({ 
      userId: dbUser.id, 
      eventId, 
      quantity 
    }).returning();
    
    // Get event details
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    return NextResponse.json({ ...reservation, event });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
} 