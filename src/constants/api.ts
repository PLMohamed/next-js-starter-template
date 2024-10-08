export const API_VERSION: string = process.env.NEXT_PUBLIC_API_VERSION || "v1"
export const API_URL: string = `/api/${API_VERSION}/` as const;

export const HTTP_RESPONSE = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
} as const;