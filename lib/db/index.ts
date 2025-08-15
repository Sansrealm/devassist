import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  `postgresql://postgres:[YOUR-PASSWORD]@db.${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}.supabase.co:5432/postgres`

if (!connectionString) {
  throw new Error("DATABASE_URL, POSTGRES_URL, or Supabase environment variables are required")
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client, { schema })

export * from "./schema"
