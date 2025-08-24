import { Duration, Ratelimit } from "@upstash/ratelimit";
import { ClientError } from "../actions";
import { headers } from "next/headers";
import { getClientIP } from "../helpers";
import { redis } from "@/lib/redis";

export interface RatelimitOptions {
  key: string;
  useIp?: boolean;
  limit: number;
  duration: Duration;
}

export function withRatelimitAction<T extends unknown[], U>(
  action: (...args: T) => Promise<U>,
  opts: Promise<RatelimitOptions> | RatelimitOptions,
) {
  return async (...args: T) => {
    const options = await opts;
    const headerStore = await headers();
    const clientIP = getClientIP(headerStore);
    const key = options.useIp ? `${options.key}:${clientIP}` : options.key;

    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(options.limit, options.duration),
    });

    const result = await ratelimit.limit(key);

    if (!result.success)
      throw new ClientError(
        "Your request exceeded the rate limit, please try again later.",
        "rateLimitExceeded",
      );

    return action(...args);
  };
}
