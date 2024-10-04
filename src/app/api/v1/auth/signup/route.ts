import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createNextResponse } from "@/lib/fetch";
import { withLogger } from "@/lib/log";
import { createRateLimit } from "@/lib/redis";
import { createSignupValidator } from "@/lib/validators/auth";
import { SignupRequest } from "@/types/request/auth";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { logger } from "@/logger";
import { HTTP_RESPONSE } from "@/constants/api";

export const POST = withLogger(
    async (req: NextRequest) => {
        const { responseHeader, success } = await createRateLimit(`signup:${req.ip}`, 5, "120m");

        if (!success) {
            return createNextResponse({
                message: "Too many requests. Please try again later.",
                messageTranslationCode: "TooManyRequests"
            }, {
                status: HTTP_RESPONSE.TOO_MANY_REQUESTS,
                headers: {
                    ...responseHeader
                }
            });
        }

        const { confirmPassword, email, password, name } = await req.json() as SignupRequest;
        const signupValidator = createSignupValidator();

        try {
            await signupValidator.validate({ confirmPassword, email, password, name });
        } catch (error: any) {
            return createNextResponse({
                message: error.errors[0],
                messageTranslationCode: error.errors[0]
            }, {
                status: HTTP_RESPONSE.BAD_REQUEST,
                headers: {
                    ...responseHeader
                }
            });
        }


        try {
            const user = await db.query.users.findFirst({
                where: eq(users.email, email)
            });

            if (user) {
                return createNextResponse({
                    message: "Email already exists.",
                    messageTranslationCode: "EmailAlreadyExists"
                }, {
                    status: HTTP_RESPONSE.BAD_REQUEST,
                    headers: {
                        ...responseHeader
                    }
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await db.insert(users).values({
                email,
                name,
                passwordHash: hashedPassword,
            }).returning({
                insertedId: users.id,
            })

            logger.info(`New user created with id: ${newUser[0].insertedId} by email: ${email} with ip: ${req.ip}`);

            return createNextResponse({
                message: "Signup successful.",
                messageTranslationCode: "SignupSuccessful"
            }, {
                status: HTTP_RESPONSE.CREATED,
                headers: {
                    ...responseHeader
                }
            });

        } catch (error) {
            logger.error("Error in signup ", error);
            return createNextResponse({
                message: "Internal server error.",
                messageTranslationCode: "InternalServerError"
            }, {
                status: HTTP_RESPONSE.INTERNAL_SERVER_ERROR,
                headers: {
                    ...responseHeader
                }
            });

        }

    }
)