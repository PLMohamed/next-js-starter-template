"use server";

import { withActionLogger, withActionValidator } from "@/lib/server/wrappers";
import { createSignupValidator } from "@/lib/validators/auth";
import { SignupRequest } from "@/types/request/Auth";
import { z } from "zod";
import { ClientError, createServerAction } from "../..";
import { getUserByEmail, createUser } from "@/lib/db/queries";
import { USERS_SCHEMA } from "@/lib/db/schema";
import { hash } from "bcrypt";

const signupActionSchema = z.tuple([createSignupValidator()]);

const baseActionSignup = async (values: SignupRequest) => {
  const { email, password, name } = values;

  const user = await getUserByEmail(email, {
    email: USERS_SCHEMA.email,
  });

  if (user) {
    throw new ClientError("Email already exists.", "EmailAlreadyExists");
  }

  const hashedPassword = await hash(password, 10);

  await createUser({
    name: name || email.split("@")[0],
    email,
    passwordHash: hashedPassword,
  });

  return;
};

const validatedSignupAction = withActionValidator(baseActionSignup, signupActionSchema);

export const ActionSignup = withActionLogger(
  "ActionSignup",
  createServerAction(validatedSignupAction),
);
