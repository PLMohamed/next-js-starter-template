import "server-only";
import { Duration, Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

interface createRateLimitResult {
  responseHeader: Headers;
  success: boolean;
}

/**
 * Creates a rate limit for a given key.
 * @param key - The key to rate limit.
 * @param limit - The maximum number of requests allowed.
 * @param duration - The duration for the rate limit.
 * @returns An object containing the response headers and success status.
 */
export async function createRateLimit(
  key: string,
  limit: number,
  duration: Duration,
): Promise<createRateLimitResult> {
  const rateLimiter = new Ratelimit({
    redis: redis,
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
    };

  return {
    responseHeader: response.headers,
    success: result.success,
  };
}
