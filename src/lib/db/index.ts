import dotenv from "dotenv";
import { Pool, PoolConfig } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { logger } from "@/logger";

if (!process.env.DB_URL) dotenv.config();

if (!process.env.DB_URL) {
  throw new Error("DB_URL environment variable is not set");
}

/**
 * Database configuration with enhanced pool settings
 */
const poolConfig: PoolConfig = {
  connectionString: process.env.DB_URL,
  max: parseInt(process.env.DB_POOL_MAX || "20"),
  min: parseInt(process.env.DB_POOL_MIN || "2"),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "5000"),
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || "30000"),
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || "60000"),
};

/**
 * PostgreSQL connection pool with enhanced configuration
 */
export const pool = new Pool(poolConfig);

/**
 * Drizzle ORM database instance
 */
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development" ? true : false,
});

/**
 * Database connection event handlers for monitoring
 */
pool.on("connect", _client => {
  if (process.env.NODE_ENV === "development") {
    logger.info("New database client connected");
  }
});

pool.on("acquire", _client => {
  if (process.env.NODE_ENV === "development") {
    logger.info("Database client acquired from pool");
  }
});

pool.on("release", (err, _client) => {
  if (err) {
    logger.error("Error releasing database client:", err);
  } else if (process.env.NODE_ENV === "development") {
    logger.info("Database client released back to pool");
  }
});

pool.on("remove", _client => {
  if (process.env.NODE_ENV === "development") {
    logger.info("Database client removed from pool");
  }
});

pool.on("error", (err, _client) => {
  logger.error("Unexpected database pool error:", err);
});

/**
 * Test database connection and log pool status
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time, version() as pg_version");
    client.release();

    if (process.env.NODE_ENV === "development") {
      logger.info("Database connection successful");
      logger.info(`PostgreSQL version: ${result.rows[0].pg_version}`);
      logger.info(`Server time: ${result.rows[0].current_time}`);
    }

    return true;
  } catch (error) {
    logger.error("Database connection failed:", error);
    return false;
  }
}

/**
 * Get current pool status for monitoring
 */
export function getPoolStatus() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Gracefully close the database pool
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    logger.info("Database pool closed gracefully");
  } catch (error) {
    logger.error("Error closing database pool:", error);
    throw error;
  }
}

/**
 * Health check function for the database
 */
export async function healthCheck(): Promise<{
  status: "healthy" | "unhealthy";
  details: {
    connection: boolean;
    poolStatus: ReturnType<typeof getPoolStatus>;
    timestamp: string;
  };
}> {
  const connectionOk = await testConnection();
  const poolStatus = getPoolStatus();

  return {
    status: connectionOk ? "healthy" : "unhealthy",
    details: {
      connection: connectionOk,
      poolStatus,
      timestamp: new Date().toISOString(),
    },
  };
}

// Handle process termination gracefully
process.on("SIGINT", async () => {
  console.log("🛑 Received SIGINT, closing database pool...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Received SIGTERM, closing database pool...");
  await closePool();
  process.exit(0);
});

// Test connection on module load in development
if (process.env.NODE_ENV === "development") {
  testConnection().catch(console.error);
}
