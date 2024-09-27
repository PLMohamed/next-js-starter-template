import { logger } from "@/logger";
import { NextRequest } from "next/server";
import "server-only";

export function LogRequest(req: NextRequest): void {
    logger.info(`Request from ${req.ip} ${req.method} ${req.url} ${req.headers.get("user-agent")}`);
}