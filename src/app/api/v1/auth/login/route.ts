import { HTTP_RESPONSE } from "@/constants/api";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { LogRequest } from "@/lib/log";
import { createRateLimit } from "@/lib/redis";
import { setSessionToken } from "@/lib/token";
import { createLoginValidator } from "@/lib/validators/auth";
import { logger } from "@/logger";
import { LoginRequest } from "@/types/request/auth";
import { APIResponse } from "@/types/response";
import { compare } from "bcrypt";
import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const { ip } = req

    LogRequest(req);
    const { responseHeader, success } = await createRateLimit(`login:${ip}`, 5, "5m");

    if (!success) {
        return new NextResponse(
            JSON.stringify({
                message: "Too many requests. Please try again later.",
                messageTranslationCode: "TooManyRequests"
            } satisfies APIResponse),
            {
                status: HTTP_RESPONSE.TOO_MANY_REQUESTS,
                headers: {
                    "Content-Type": "application/json",
                    ...responseHeader
                }
            }
        )
    }

    const { email, password } = await req.json() as LoginRequest;
    const loginValidator = createLoginValidator();

    try {
        await loginValidator.validate({ email, password });
    } catch (error: any) {
        return new NextResponse(
            JSON.stringify({
                message: error.errors[0],
                messageTranslationCode: error.errors[0]
            } satisfies APIResponse),
            {
                status: HTTP_RESPONSE.BAD_REQUEST,
                headers: {
                    "Content-Type": "application/json",
                    ...responseHeader
                }
            }
        )
    }

    try {
        const user = await db.query.users.findFirst({
            where: and(eq(users.email, email), isNull(users.deletedAt))
        });

        if (!user) {
            return new NextResponse(
                JSON.stringify({
                    message: "Email or password is incorrect.",
                    messageTranslationCode: "EmailPasswordIncorrect"
                } satisfies APIResponse),
                {
                    status: HTTP_RESPONSE.NOT_FOUND,
                    headers: {
                        "Content-Type": "application/json",
                        ...responseHeader
                    }
                }
            )
        }

        const passwordMatch = await compare(password, user.passwordHash);

        if (!passwordMatch) {
            return new NextResponse(
                JSON.stringify({
                    message: "Email or password is incorrect.",
                    messageTranslationCode: "EmailPasswordIncorrect"
                } satisfies APIResponse),
                {
                    status: HTTP_RESPONSE.NOT_FOUND,
                    headers: {
                        "Content-Type": "application/json",
                        ...responseHeader
                    }
                }
            )
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

        return new NextResponse(
            JSON.stringify({
                message: "Login successful.",
                messageTranslationCode: "LoginSuccessful"
            } satisfies APIResponse),
            {
                status: HTTP_RESPONSE.OK,
                headers: {
                    "Content-Type": "application/json",
                    ...responseHeader
                }
            }
        )
    } catch (error) {
        logger.error("Error in Login API ", error);

        return new NextResponse(
            JSON.stringify({
                message: "Internal server error.",
                messageTranslationCode: "InternalServerError"
            } satisfies APIResponse),
            {
                status: HTTP_RESPONSE.INTERNAL_SERVER_ERROR,
                headers: {
                    "Content-Type": "application/json",
                    ...responseHeader
                }
            }
        )
    }
}