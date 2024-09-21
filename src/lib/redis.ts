import "server-only";
import { Redis } from "@upstash/redis";
import { Duration, Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";


export const redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
});

export async function createRateLimitKey(key: string, limit: number, duration: Duration) {
    const rateLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(limit, duration),
    });

    const response = new NextResponse();
    const result = await rateLimiter.limit(key);

    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", result.reset.toString());

    return {
        responseHeader: response.headers,
        success: result.success,
    }
}