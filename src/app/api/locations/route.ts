import { getAllLocations } from "@/db/queries"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const locations = await getAllLocations()
    return NextResponse.json(locations)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}
