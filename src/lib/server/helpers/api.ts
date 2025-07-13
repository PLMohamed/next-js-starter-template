import { APIResponse } from "@/types/response";
import { NextResponse } from "next/server";

/**
 * Creates a Next.js response with the given body and optional response init.
 * @remarks
 * **Important:** You should only use this function if you want to return a JSON body.
 * @param body - The body of the response.
 * @param init - Optional response initialization parameters.
 * @returns A NextResponse object containing the JSON stringified body.
 */
export function createNextResponse(body: APIResponse, init?: ResponseInit): NextResponse {
  return new NextResponse(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
