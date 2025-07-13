import "server-only";
import { logger } from "@/logger";
import { NextRequest, NextResponse } from "next/server";
import { RouteParams } from "@/types/data/page";
import { ActionResponse, getClientIP } from "..";
import { headers as headersPromise } from "next/headers";

export function withApiLogger(
  handler: (req: NextRequest, { params }: { params: RouteParams }) => Promise<NextResponse>,
) {
  return async (req: NextRequest, { params }: { params: RouteParams }) => {
    const ip = getClientIP(req.headers);
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers.get("user-agent") || "unknown";
    const referer = req.headers.get("referer") || "none";
    const timestamp = new Date().toISOString();

    logger.info(
      `[${timestamp}] Request from ${ip} | ${method} ${url} | UA: ${userAgent} | Referer: ${referer}`,
      {
        ip,
        method,
        url,
        userAgent,
        referer,
        timestamp,
        params,
      },
    );
    return handler(req, { params });
  };
}

export function withActionLogger<T extends any[], U>(
  actionName: string,
  action: (...args: T) => Promise<ActionResponse<U>>,
): (...args: T) => Promise<ActionResponse<U>> {
  return async (...args: T) => {
    const headers = await headersPromise();
    const ip = getClientIP(headers);
    const userAgent = headers.get("user-agent") || "unknown";
    const referer = headers.get("referer") || "none";
    const timestamp = new Date().toISOString();

    logger.info(
      `[${timestamp}] Action: ${actionName} | IP: ${ip} | UA: ${userAgent} | Referer: ${referer}`,
      {
        ip,
        userAgent,
        referer,
        timestamp,
        actionName,
      },
    );

    return action(...args);
  };
}
