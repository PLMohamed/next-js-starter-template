"use server";

import { withActionLogger, withActionValidator } from "@/lib/server/wrappers";
import { ClientError, createServerAction } from "../..";
import { LoginRequest } from "@/types/request/Auth";
import { createLoginValidator } from "@/lib/validators/auth";
import { z } from "zod";
import { getUserByEmail } from "@/lib/db/queries";
import { USERS_SCHEMA } from "@/lib/db/schema";
import { compare } from "bcrypt";
import { setSessionToken } from "@/lib/server/services";
import { cookies } from "next/headers";

const loginActionSchema = z.tuple([createLoginValidator()]);

const baseActionLogin = async (values: LoginRequest) => {
  const { email, password } = values;

  const user = await getUserByEmail(email, {
    id: USERS_SCHEMA.id,
    email: USERS_SCHEMA.email,
    passwordHash: USERS_SCHEMA.passwordHash,
  });

  if (!user) {
    throw new ClientError("Email or password is incorrect.", "EmailPasswordIncorrect");
  }

  const passwordMatch = await compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new ClientError("Email or password is incorrect.", "EmailPasswordIncorrect");
  }

  const [token, cookieStore] = await Promise.all([
    setSessionToken(
      {
        id: user.id,
        type: "access",
        role: "user",
      },
      2,
    ),
    cookies(),
  ]);

  cookieStore.set("access", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
    maxAge: 2 * 60 * 60,
    path: "/",
  });

  return;
};

const validatedLogin = withActionValidator(baseActionLogin, loginActionSchema);

export const ActionLogin = withActionLogger("ActionLogin", createServerAction(validatedLogin));
