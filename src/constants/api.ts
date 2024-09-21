export const API_VERSION: string = process.env.NEXT_PUBLIC_API_VERSION || "v1"

export const HTTP_RESPONSE = {
    SUCCESS: 200,
    UNAUTHORIZED: 401,
    FORBIDEN: 403,
    INTERNAL_SERVER_ERROR: 500
}