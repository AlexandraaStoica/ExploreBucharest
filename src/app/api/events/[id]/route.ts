import { db } from "@/db/drizzle";
import { events, locations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: any) {
  const { params } = await context;
  try {
    const eventArr = await db.select().from(events).where(eq(events.id, params.id));
    if (!eventArr.length) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    const event = eventArr[0];
    // Optionally, fetch location name
    const locArr = await db.select().from(locations).where(eq(locations.id, event.locationId));
    const locationName = locArr.length ? locArr[0].name : undefined;
    const locationLat = locArr.length ? locArr[0].latitude : undefined;
    const locationLng = locArr.length ? locArr[0].longitude : undefined;
    return NextResponse.json({ ...event, locationName, latitude: locationLat, longitude: locationLng });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch event." }, { status: 500 });
  }
} 