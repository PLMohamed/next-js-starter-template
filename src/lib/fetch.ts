import { logger } from "@/logger";
import { APIResponse } from "@/types/response";
import { getTranslations } from "next-intl/server";
import { NextResponse } from "next/server";

interface FetchAPIProps {
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: HeadersInit;
    next?: NextFetchRequestConfig;
    body?: any;
    config?: RequestInit;
    params?: Params;
}

interface FetchAPIResponse<T> {
    status: number;
    data?: T;
    error?: string;
    pageCount: number;
}

interface HeadersInit {
    [key: string]: string;
}

interface NextFetchRequestConfig {
    revalidate?: number | false;
    tags?: string[];
}

interface RequestInit {
    [key: string]: any;
}

interface Params {
    [key: string]: any;
}

export default async function FetchAPI<T>({
    endpoint,
    method,
    headers,
    next,
    body,
    config,
    params,
}: FetchAPIProps): Promise<FetchAPIResponse<T>> {
    const t = await getTranslations()

    try {
        const response = await fetch(`${endpoint}${params ? "?" + new URLSearchParams({ ...params }) : ""}`, {
            method: method,
            headers,
            body,
            next,
            ...config,
        });

        const result = await response.json().catch(() => { });

        if (!response.ok)
            return {
                status: response.status,
                data: undefined,
                error: result.message,
                pageCount: 0,
            };

        return {
            status: response.status,
            data: result.response,
            error: undefined,
            pageCount: result?.pageCount || 0,
        };
    } catch (error) {
        logger.error(`Error FetchApi: ${error}`);
        return {
            status: 500,
            data: undefined,
            error: t("internalServerError"),
            pageCount: 0,
        };
    }
}

export function createNextResponse(body: APIResponse,
    init?: ResponseInit
): NextResponse {
    return new NextResponse(JSON.stringify(body), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers,
        },
    });
}