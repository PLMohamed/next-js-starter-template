import { REGEX } from "@/constants/regex";
import { LoginRequest, SignupRequest } from "@/types/request/Auth";
import { z } from "zod";

export function createLoginValidator(translator: (key: string) => string = key => key) {
  return z.object({
    email: z
      .email(translator("invalidEmail") || "Invalid Email")
      .nonempty(translator("required") || "Email is Required"),
    password: z
      .string()
      .nonempty(translator("required") || "Password is Required")
      .regex(
        REGEX.PASSWORD,
        translator("invalidPassword") ||
          "Password must be at least 8 characters, include letters and numbers",
      ),
  }) as z.ZodType<LoginRequest>;
}

export function createSignupValidator(translator: (key: string) => string = key => key) {
  return z
    .object({
      email: z
        .email(translator("invalidEmail") || "Invalid Email")
        .nonempty(translator("required") || "Email is Required"),
      password: z
        .string()
        .nonempty(translator("required") || "Password is Required")
        .regex(
          REGEX.PASSWORD,
          translator("invalidPassword") ||
            "Password must be at least 8 characters, include letters and numbers",
        ),
      confirmPassword: z
        .string()
        .nonempty(translator("required") || "Confirm Password is Required"),
      name: z.string().nonempty(translator("required") || "Name is Required"),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: translator("passwordMismatch") || "Passwords do not match",
      path: ["confirmPassword"],
    }) as z.ZodType<SignupRequest>;
}
