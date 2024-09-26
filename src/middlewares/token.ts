import { getSessionToken, setSessionToken } from "@/lib/token";
import { NextResponse } from "next/server";

export default async function sessionMiddleware(response: NextResponse) {
    const payload = await getSessionToken();

    if (!payload) {
        response.cookies.delete("access");
        return;
    }

    const token = await setSessionToken(payload, 1);

    response.cookies.set("access", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 1000 * 60 * 60),
        maxAge: 60 * 60,
        path: "/",
    });

    return;
}