import { HTTP_RESPONSE } from "@/constants/api";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createNextResponse } from "@/lib/fetch";
import { withLogger } from "@/lib/log";
import { createRateLimit } from "@/lib/redis";
import { setSessionToken } from "@/lib/token";
import { createLoginValidator } from "@/lib/validators/auth";
import { logger } from "@/logger";
import { LoginRequest } from "@/types/request/auth";
import { compare } from "bcrypt";
import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = withLogger(
    async (req: NextRequest): Promise<NextResponse> => {
        const { ip } = req

        const { responseHeader, success } = await createRateLimit(`login:${ip}`, 5, "5m");

        if (!success) {
            return createNextResponse({
                message: "Too many requests. Please try again later.",
                messageTranslationCode: "TooManyRequests"
            }, {
                status: HTTP_RESPONSE.TOO_MANY_REQUESTS,
                headers: {
                    ...responseHeader
                }
            })
        }

        const { email, password } = await req.json() as LoginRequest;
        const loginValidator = createLoginValidator();

        try {
            await loginValidator.validate({ email, password });
        } catch (error: any) {
            return createNextResponse({
                message: error.errors[0],
                messageTranslationCode: error.errors[0]
            }, {
                status: HTTP_RESPONSE.BAD_REQUEST,
                headers: {
                    ...responseHeader
                }
            })
        }

        try {
            const user = await db.query.users.findFirst({
                where: and(eq(users.email, email), isNull(users.deletedAt))
            });

            if (!user) {
                return createNextResponse({
                    message: "Email or password is incorrect.",
                    messageTranslationCode: "EmailPasswordIncorrect"
                }, {
                    status: HTTP_RESPONSE.NOT_FOUND,
                    headers: {
                        ...responseHeader
                    }
                })
            }

            const { success: successUser } = await createRateLimit(`login:user:${user.id}`, 5, "30m");

            if (!successUser) {
                return createNextResponse({
                    message: "Too many requests. Please try again later.",
                    messageTranslationCode: "TooManyRequests"
                }, {
                    status: HTTP_RESPONSE.TOO_MANY_REQUESTS,
                    headers: {
                        ...responseHeader
                    }
                })
            }


            const passwordMatch = await compare(password, user.passwordHash);

            if (!passwordMatch) {
                return createNextResponse({
                    message: "Email or password is incorrect.",
                    messageTranslationCode: "EmailPasswordIncorrect"
                }, {
                    status: HTTP_RESPONSE.NOT_FOUND,
                    headers: {
                        ...responseHeader
                    }
                })
            }

            const token = await setSessionToken({
                id: user.id,
                type: "access",
                role: "user"
            }, 2);

            cookies().set("access", token, {
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
                expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
                maxAge: 2 * 60 * 60,
                path: "/"
            });

            return createNextResponse({
                message: "Login successful.",
                messageTranslationCode: "LoginSuccessful"
            }, {
                status: HTTP_RESPONSE.OK,
                headers: {
                    ...responseHeader
                }
            });

        } catch (error) {
            logger.error("Error in Login API ", error);
            console.error(error);

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