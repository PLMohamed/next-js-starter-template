import { HTTP_RESPONSE } from "@/constants/api";
import { APIResponse } from "@/types/response";
import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/auth/login", "/auth/register"];
const AUTH_API = ["/api/v1/auth/login", "/api/v1/auth/signup"];

const isAuthPage = (url: string): boolean => AUTH_PAGES.some(page => url.startsWith(page));
const isAuthApi = (url: string): boolean => AUTH_API.some(page => url.startsWith(page));

export default async function allowMiddleware(request: NextRequest): Promise<NextResponse | void> {
    const { nextUrl, url, cookies } = request;
    const { value: token } = cookies.get("access") || {};
    const { value: lang } = cookies.get("NEXT_LOCALE") || {};
    const nextUrlWithoutLang = nextUrl.pathname.replace(`/${lang}`, "");


    if (isAuthPage(nextUrlWithoutLang) && token) {
        return NextResponse.redirect(new URL("/", url));
    }

    if (isAuthApi(nextUrl.pathname) && token) {
        return new NextResponse(
            JSON.stringify({
                message: "Already authenticated.",
                messageTranslationCode: "AlreadyAuthenticated"
            } satisfies APIResponse),
            {
                status: HTTP_RESPONSE.FORBIDDEN,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }


    return
}