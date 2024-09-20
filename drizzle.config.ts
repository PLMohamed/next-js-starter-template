import type { Config } from "drizzle-kit"

if (!process.env.DB_URL) throw new Error("DB_URL is not set")

export default {
    dialect: "postgresql",
    out: "./migrations",
    schema: "./src/lib/db/schema.ts",
    dbCredentials: {
        url: process.env.DB_URL,
    }
} satisfies Config