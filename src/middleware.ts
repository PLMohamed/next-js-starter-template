import { NextRequest, NextResponse } from "next/server";
import { localeMiddleware } from "./middlewares";


export async function middleware(request: NextRequest): Promise<NextResponse> {
  const response = localeMiddleware(request);


  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};