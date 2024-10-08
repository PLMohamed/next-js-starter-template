import { sql } from 'drizzle-orm';
import {
    pgTable,
    varchar,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 20 }).notNull().default('member'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => sql`now()`),
    deletedAt: timestamp('deleted_at'),
});



export type User = typeof users.$inferSelect;