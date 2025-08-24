import { InferSelectModel, and, eq, isNull, type SQL, type SelectedFields } from "drizzle-orm";
import { db } from "..";
import { USERS_SCHEMA } from "../schema";
import { logger } from "@/logger";
import { cache } from "react";

type UserTable = typeof USERS_SCHEMA;
type UserColumns = UserTable["_"]["columns"][keyof UserTable["_"]["columns"]];
type InferSelectedFields<T extends SelectedFields<UserColumns, UserTable>> = {
  [K in keyof T]: K extends keyof InferSelectModel<UserTable>
    ? InferSelectModel<UserTable>[K]
    : never;
};

const DEFAULT_SELECT = {
  id: USERS_SCHEMA.id,
  name: USERS_SCHEMA.name,
  email: USERS_SCHEMA.email,
};

export const getUserById = cache(
  async <TSelect extends SelectedFields<UserColumns, UserTable> = typeof DEFAULT_SELECT>(
    id: string,
    selectFields?: TSelect,
  ): Promise<InferSelectedFields<TSelect> | null> => {
    const fields = (selectFields ?? DEFAULT_SELECT) as TSelect;

    const result: InferSelectedFields<TSelect>[] = (await db
      .select(fields)
      .from(USERS_SCHEMA)
      .where(and(eq(USERS_SCHEMA.id, id), isNull(USERS_SCHEMA.deletedAt)))
      .limit(1)) as InferSelectedFields<TSelect>[];

    return result[0] ?? null;
  },
);

export const getUserByEmail = cache(
  async <TSelect extends SelectedFields<UserColumns, UserTable> = typeof DEFAULT_SELECT>(
    email: string,
    selectFields?: TSelect,
  ): Promise<InferSelectedFields<TSelect> | null> => {
    const fields = (selectFields ?? DEFAULT_SELECT) as TSelect;

    const [result]: InferSelectedFields<TSelect>[] = (await db
      .select(fields)
      .from(USERS_SCHEMA)
      .where(and(eq(USERS_SCHEMA.email, email), isNull(USERS_SCHEMA.deletedAt)))
      .limit(1)) as InferSelectedFields<TSelect>[];

    return result ?? null;
  },
);

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
