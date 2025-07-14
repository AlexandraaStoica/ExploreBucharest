import { db } from "@/db/drizzle";
import { questions } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { name, email, question } = await req.json();
    if (!name || !question) {
      return NextResponse.json({ error: "Name and question are required." }, { status: 400 });
    }
    const [created] = await db.insert(questions).values({ name, email, question }).returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save question." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allQuestions = await db.select().from(questions).orderBy(desc(questions.createdAt));
    return NextResponse.json(allQuestions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch questions." }, { status: 500 });
  }
} 