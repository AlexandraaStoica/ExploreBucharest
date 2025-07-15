import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { reviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/reviews?targetId=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId");
  if (!targetId) {
    return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
  }
  const rows = await db.select().from(reviews).where(eq(reviews.targetId, targetId)).orderBy(desc(reviews.createdAt));
  return NextResponse.json(rows);
}

// POST /api/reviews
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || !user.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  // Look up local user by Clerk user ID
  const dbUserRows = await db.select().from(users).where(eq(users.clerkUserId, user.id)).limit(1);
  const dbUser = dbUserRows[0];
  if (!dbUser) {
    return NextResponse.json({ error: "User not found in database" }, { status: 404 });
  }
  const { targetId, rating, comment } = await req.json();
  if (!targetId || !rating) {
    return NextResponse.json({ error: "Missing targetId or rating" }, { status: 400 });
  }
  const [created] = await db.insert(reviews).values({
    userId: dbUser.id,
    targetId,
    rating,
    comment,
  }).returning();
  return NextResponse.json(created, { status: 201 });
} 