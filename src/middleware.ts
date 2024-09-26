import { NextRequest, NextResponse } from "next/server";
import sessionMiddleware from "./middlewares/token";
import applySetCookie from "./middlewares/cookie";
import localeMiddleware from "./middlewares/locale";
import allowMiddleware from "./middlewares/allow";


export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isApi: boolean = pathname.startsWith("/api");

  const response = isApi ? NextResponse.next() : await localeMiddleware(request);

  await sessionMiddleware(response);
  applySetCookie(request, response);

  const allowResponse = await allowMiddleware(request);

  if (allowResponse)
    return allowResponse;



  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};