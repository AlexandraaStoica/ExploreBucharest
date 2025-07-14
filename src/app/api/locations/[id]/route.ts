import { db } from "@/db/drizzle";
import { locations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: any) {
  const { params } = await context;
  try {
    const locArr = await db.select().from(locations).where(eq(locations.id, params.id));
    if (!locArr.length) return NextResponse.json({ error: "Location not found" }, { status: 404 });
    return NextResponse.json(locArr[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch location." }, { status: 500 });
  }
} 