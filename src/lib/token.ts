import "server-only";
import { jwtVerify, type JWTPayload, SignJWT, type JWTHeaderParameters } from "jose";
import { cookies } from "next/headers";
import { UserTokenPayload } from "@/types/data/user";
import { USER_TOKEN_TYPE } from "@/constants/token";
import { redis } from "./redis";

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
        const { value: token } = cookies().get("access") || {};

        if (!token) return null;

        const payload = await verifyJwtToken<UserTokenPayload>(token);

        if (!USER_TOKEN_TYPE.includes(payload.type)) return null;

        const storedToken = await redis.get(`token:${payload.id}:${payload.type}`);

        if (storedToken !== token) return null;

        return payload
    } catch {
        return null;
    }
}

export async function setSessionToken(payload: UserTokenPayload, expiresHours: number) {
    const expires = new Date();
    expires.setHours(expires.getHours() + expiresHours);

    const token = await generateJwtToken({
        ...payload,
    });

    await redis.set(`token:${payload.id}:${payload.type}`, token, {
        ex: expiresHours * 3600,
    });

    return token;
}