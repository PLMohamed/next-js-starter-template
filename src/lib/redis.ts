import "server-only";
import { Redis } from "@upstash/redis";
import { Duration, Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";

interface createRateLimitResult {
    responseHeader: Headers;
    success: boolean;
}

export const redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
});

export async function createRateLimit(key: string, limit: number, duration: Duration): Promise<createRateLimitResult> {
    const rateLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(limit, duration),
    });

    const response = new NextResponse();
    const result = await rateLimiter.limit(key);

    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", result.reset.toString());

    if (process.env.NODE_ENV === "development")
        return {
            responseHeader: response.headers,
            success: true,
        }

    return {
        responseHeader: response.headers,
        success: result.success,
    }
}