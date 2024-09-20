import { getSessionToken, setSessionToken } from "@/lib/token";

export default async function sessionMiddleware() {
    const payload = await getSessionToken();

    if (!payload) return;

    await setSessionToken(payload);

    return payload;
}