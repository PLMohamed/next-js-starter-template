import { RequestCookies, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export default async function applySetCookie(request: NextRequest, response: NextResponse) {
  const setCookies = new ResponseCookies(response.headers);

  const newReqHeaders = new Headers(request.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach(cookie => newReqCookies.set(cookie));

  const dummyRes = NextResponse.next({ request: { headers: newReqHeaders } });

  dummyRes.headers.forEach((value, key) => {
    if (key === "x-middleware-override-headers") {
      value = value + ",x-next-intl-locale";
      response.headers.set(key, value);
    }

    if (key.startsWith("x-middleware-request-")) {
      response.headers.set(key, value);
    }
  });
}