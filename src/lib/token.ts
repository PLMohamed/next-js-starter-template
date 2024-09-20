import "server-only";
import { jwtVerify, type JWTPayload, SignJWT, type JWTHeaderParameters } from "jose";
import { cookies } from "next/headers";
import { UserTokenPayload } from "@/types/data/user";

export function getJwtSecretKey(): Uint8Array {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length === 0)
        throw new Error("The environment variable AUTH_SECRET is not set.");

    return new TextEncoder().encode(secret);
};

export async function verifyJwtToken<T>(token: string): Promise<T & JWTPayload> {
    try {
        const verified = await jwtVerify<T>(token, getJwtSecretKey());
        return verified.payload
    } catch {
        throw new Error("Your token is expired");
    }
}

export async function generateJwtToken(payload: JWTPayload,
    expiresIn: number | string | Date = "1h",
    issuedAt?: number | string | Date,
    protectedHeader?: JWTHeaderParameters

): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256", ...protectedHeader })
        .setIssuedAt(issuedAt)
        .setExpirationTime(expiresIn)
        .sign(getJwtSecretKey());
}

export async function getSessionToken() {
    try {
        const token = cookies().get("token")?.value;

        if (!token) return null;

        return await verifyJwtToken<UserTokenPayload>(token);
    } catch {
        return null;
    }
}

export async function setSessionToken(payload: Omit<UserTokenPayload, "expires">) {
    const expires = new Date();
    expires.setHours(expires.getHours() + 2);

    const token = await generateJwtToken({
        expires: expires.toISOString(),
        ...payload,
    });

    cookies().set('session', token, {
        expires,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
    });
}