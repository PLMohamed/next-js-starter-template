import dotenv from 'dotenv';
import { Pool } from 'pg';
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";


if (!process.env.DB_URL) dotenv.config();

if (!process.env.DB_URL)
    throw new Error('DB_URL environment variable is not set');


export const pool = new Pool({
    connectionString: process.env.DB_URL,
})

export const db = drizzle(pool, { schema });