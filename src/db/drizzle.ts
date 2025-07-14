import { config } from "dotenv"
import { drizzle } from "drizzle-orm/neon-http"

config() // This will load .env by default

export const db = drizzle(process.env.DATABASE_URL!)
