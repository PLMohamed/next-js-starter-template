import { and, eq, isNull, type SQL, type SelectedFields } from "drizzle-orm";
import { db } from "..";
import { USERS_SCHEMA } from "../schema";
import { logger } from "@/logger";

type UserTable = typeof USERS_SCHEMA;
type UserColumns = UserTable["_"]["columns"][keyof UserTable["_"]["columns"]];
type InferSelectedFields<T extends SelectedFields<UserColumns, UserTable>> = {
  [K in keyof T]: T[K] extends SQL<infer R> ? R : never;
};

const DEFAULT_SELECT = {
  id: USERS_SCHEMA.id,
  name: USERS_SCHEMA.name,
  email: USERS_SCHEMA.email,
};

export async function getUserById<
  TSelect extends SelectedFields<UserColumns, UserTable> = typeof DEFAULT_SELECT,
>(id: string, selectFields?: TSelect): Promise<InferSelectedFields<TSelect> | null> {
  const fields = (selectFields ?? DEFAULT_SELECT) as TSelect;

  try {
    const result: InferSelectedFields<TSelect>[] = (await db
      .select(fields)
      .from(USERS_SCHEMA)
      .where(and(eq(USERS_SCHEMA.id, id), isNull(USERS_SCHEMA.deletedAt)))
      .limit(1)) as InferSelectedFields<TSelect>[];

    return result[0] ?? null;
  } catch (error) {
    logger.error("getUser Error: ", error);
    throw error;
  }
}

export async function getUserByEmail<
  TSelect extends SelectedFields<UserColumns, UserTable> = typeof DEFAULT_SELECT,
>(email: string, selectFields?: TSelect): Promise<InferSelectedFields<TSelect> | null> {
  const fields = (selectFields ?? DEFAULT_SELECT) as TSelect;

  try {
    const result: InferSelectedFields<TSelect>[] = (await db
      .select(fields)
      .from(USERS_SCHEMA)
      .where(and(eq(USERS_SCHEMA.email, email), isNull(USERS_SCHEMA.deletedAt)))
      .limit(1)) as InferSelectedFields<TSelect>[];

    return result[0] ?? null;
  } catch (error) {
    logger.error("getUser Error: ", error);
    throw error;
  }
}

export async function createUser(userData: {
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
}) {
  try {
    const result = await db
      .insert(USERS_SCHEMA)
      .values({
        name: userData.name,
        email: userData.email,
        passwordHash: userData.passwordHash,
        role: userData.role,
      })
      .returning({
        insertedId: USERS_SCHEMA.id,
      });

    return result[0];
  } catch (error) {
    logger.error("createUser Error: ", error);
    throw error;
  }
}
