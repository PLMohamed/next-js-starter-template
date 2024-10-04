import { logger } from "@/logger";
import { NextRequest, NextResponse } from "next/server";
import { RouteParams } from "@/types/data/page";

export function withLogger(handler: (req: NextRequest, { params }: { params: RouteParams }) => Promise<NextResponse>) {
    return async (req: NextRequest, { params }: { params: RouteParams }
    ) => {
        logger.info(`Request from ${req.ip} ${req.method} ${req.url} ${req.headers.get("user-agent")}`);
        return handler(req, { params });
    };
}