import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { wishlist, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/wishlist?targetType=event|location (optional)
export async function GET(req: Request) {
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
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType");
  const whereClause = targetType
    ? and(eq(wishlist.userId, dbUser.id), eq(wishlist.targetType, targetType))
    : eq(wishlist.userId, dbUser.id);
  const rows = await db
    .select()
    .from(wishlist)
    .where(whereClause)
    .orderBy(desc(wishlist.createdAt));
  return NextResponse.json(rows);
}

// POST /api/wishlist
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
  const { targetType, targetId } = await req.json();
  if (!targetType || !targetId) {
    return NextResponse.json({ error: "Missing targetType or targetId" }, { status: 400 });
  }
  // Prevent duplicates
  const existing = await db.select().from(wishlist).where(and(eq(wishlist.userId, dbUser.id), eq(wishlist.targetType, targetType), eq(wishlist.targetId, targetId)));
  if (existing.length > 0) {
    return NextResponse.json(existing[0]);
  }
  const [created] = await db.insert(wishlist).values({
    userId: dbUser.id,
    targetType,
    targetId,
  }).returning();
  return NextResponse.json(created, { status: 201 });
}

// DELETE /api/wishlist
export async function DELETE(req: Request) {
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
  const { targetType, targetId } = await req.json();
  if (!targetType || !targetId) {
    return NextResponse.json({ error: "Missing targetType or targetId" }, { status: 400 });
  }
  await db.delete(wishlist).where(and(eq(wishlist.userId, dbUser.id), eq(wishlist.targetType, targetType), eq(wishlist.targetId, targetId)));
  return NextResponse.json({ success: true });
} 