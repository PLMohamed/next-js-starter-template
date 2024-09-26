import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/auth/login", "/auth/register"];

const isAuthPage = (url: string): boolean => AUTH_PAGES.some(page => url.startsWith(page));

export default async function allowMiddleware(request: NextRequest): Promise<NextResponse | void> {
    const { nextUrl, url, cookies } = request;
    const { value: token } = cookies.get("access") || {};
    const { value: lang } = cookies.get("NEXT_LOCALE") || {};
    const nextUrlWithoutLang = nextUrl.pathname.replace(`/${lang}`, "");


    if (isAuthPage(nextUrlWithoutLang) && token) {
        const rep = NextResponse.redirect(new URL("/", url));
        return rep;
    }


    return
}