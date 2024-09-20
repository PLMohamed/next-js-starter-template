import { relations } from 'drizzle-orm';
import {
    pgTable,
    varchar,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey(),
    name: varchar('name', { length: 100 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 20 }).notNull().default('member'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
});

export const userSessions = pgTable('user_sessions', {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id),
    device: varchar('device', { length: 100 }),
    lastActive: timestamp('last_active').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userRelations = relations(
    users, ({ many }) => ({
        sessions: many(userSessions),
    }),
);

export const userSessionRelations = relations(
    userSessions, ({ one }) => ({
        user: one(users, {
            fields: [userSessions.userId],
            references: [users.id],
        }),
    }),
)


export type User = typeof users.$inferSelect;