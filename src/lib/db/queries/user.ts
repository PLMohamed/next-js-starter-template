import { and, eq, isNull } from "drizzle-orm";
import { db } from "..";
import { User, users } from "../schema";
import { logger } from "@/logger";

export async function getUser(id: string): Promise<User | null> {
    try {
        const user = await db.select().from(users).where(
            and(
                eq(users.id, id),
                isNull(users.deletedAt)
            )
        ).limit(1)

        if (user.length === 0)
            return null

        return user[0]
    } catch (error) {
        logger.error("getUser Error : " + error)

        throw new Error("error fetching user : " + error)
    }
}