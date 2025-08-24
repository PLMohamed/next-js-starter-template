import "server-only";
import { jwtVerify, type JWTPayload, SignJWT, type JWTHeaderParameters } from "jose";
import { cookies } from "next/headers";
import { UserTokenPayload } from "@/types/data/user";
import { USER_TOKEN_TYPE } from "@/constants/token";
import { redis } from "@/lib/redis";

/**
 * Retrieves and encodes the JWT secret key from environment variables.
 *
 * @returns {Uint8Array} The encoded JWT secret key
 * @throws {Error} When AUTH_SECRET environment variable is not set or empty
 *
 * @example
 * ```typescript
 * const secretKey = getJwtSecretKey();
 * // Use secretKey for JWT operations
 * ```
 */
export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error("The environment variable AUTH_SECRET is not set.");
  }

  return new TextEncoder().encode(secret);
}

/**
 * Verifies and decodes a JWT token.
 *
 * @template T - The expected payload type extending JWTPayload
 * @param {string} token - The JWT token to verify
 * @returns {Promise<T & JWTPayload>} The decoded and verified token payload
 * @throws {Error} When the token is invalid, expired, or malformed
 *
 * @example
 * ```typescript
 * try {
 *   const payload = await verifyJwtToken<UserTokenPayload>(token);
 *   console.log('User ID:', payload.id);
 * } catch (error) {
 *   console.error('Invalid token:', error.message);
 * }
 * ```
 */
export async function verifyJwtToken<T>(token: string): Promise<T & JWTPayload> {
  try {
    const verified = await jwtVerify<T>(token, getJwtSecretKey());
    return verified.payload;
  } catch (error) {
    throw new Error("Your token is expired or invalid");
  }
}

/**
 * Generates a signed JWT token with the specified payload and options.
 *
 * @param {JWTPayload} payload - The data to include in the token payload
 * @param {number | string | Date} [expiresIn="1h"] - Token expiration time (default: 1 hour)
 * @param {number | string | Date} [issuedAt] - Token issued at time (default: current time)
 * @param {JWTHeaderParameters} [protectedHeader] - Additional protected header parameters
 * @returns {Promise<string>} The signed JWT token
 * @throws {Error} When token generation fails
 *
 * @example
 * ```typescript
 * // Generate a token with 24 hour expiration
 * const token = await generateJwtToken(
 *   { userId: 123, role: 'user' },
 *   '24h'
 * );
 *
 * // Generate a token with custom header
 * const token = await generateJwtToken(
 *   { userId: 123 },
 *   '1h',
 *   undefined,
 *   { typ: 'JWT' }
 * );
 * ```
 */
export async function generateJwtToken(
  payload: JWTPayload,
  expiresIn: number | string | Date = "1h",
  issuedAt?: number | string | Date,
  protectedHeader?: JWTHeaderParameters,
): Promise<string> {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", ...protectedHeader })
      .setIssuedAt(issuedAt)
      .setExpirationTime(expiresIn)
      .sign(getJwtSecretKey());
  } catch (error) {
    throw new Error(
      `Failed to generate JWT token: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Retrieves and validates the current user session token from cookies.
 *
 * This function performs multiple validation steps:
 * 1. Extracts the token from the 'access' cookie
 * 2. Verifies the JWT token signature and expiration
 * 3. Validates the token type against allowed types
 * 4. Checks if the token exists in Redis storage (for revocation support)
 *
 * @returns {Promise<UserTokenPayload | null>} The user token payload if valid, null otherwise
 *
 * @example
 * ```typescript
 * const session = await getSessionToken();
 * if (session) {
 *   console.log('Authenticated user:', session.id);
 *   console.log('Token type:', session.type);
 * } else {
 *   console.log('No valid session found');
 * }
 * ```
 */
export async function getSessionToken(): Promise<UserTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("access");

    if (!tokenCookie?.value) {
      return null;
    }

    const token = tokenCookie.value;
    const payload = await verifyJwtToken<UserTokenPayload>(token);

    if (!USER_TOKEN_TYPE.includes(payload.type)) {
      return null;
    }

    const storedToken = await redis.get(`token:${payload.uuid}:${payload.type}`);
    if (storedToken !== token) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Creates and stores a new session token for a user.
 *
 * This function:
 * 1. Generates a new JWT token with the provided payload
 * 2. Stores the token in Redis with expiration for revocation support
 * 3. Returns the generated token (caller should set it in cookies)
 *
 * @param {UserTokenPayload} payload - The user data to encode in the token
 * @param {number} expiresHours - Token expiration time in hours
 * @returns {Promise<string>} The generated JWT token
 * @throws {Error} When token generation or storage fails
 *
 * @example
 * ```typescript
 * const userPayload = {
 *   id: '123',
 *   email: 'user@example.com',
 *   type: 'access'
 * };
 *
 * try {
 *   const token = await setSessionToken(userPayload, 24); // 24 hours
 *   // Set token in cookie or return to client
 *   cookies().set('access', token, {
 *     httpOnly: true,
 *     secure: true,
 *     maxAge: 24 * 60 * 60 * 1000
 *   });
 * } catch (error) {
 *   console.error('Failed to create session:', error);
 * }
 * ```
 */
export async function setSessionToken(
  payload: UserTokenPayload,
  expiresHours: number,
): Promise<string> {
  try {
    const token = await generateJwtToken(payload, `${expiresHours}h`);

    await redis.set(`token:${payload.uuid}:${payload.type}`, token, {
      ex: expiresHours * 3600, // Convert hours to seconds
    });

    return token;
  } catch (error) {
    throw new Error(
      `Failed to set session token: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Revokes a user's session token by removing it from Redis storage.
 *
 * @param {string} userId - The user ID whose token should be revoked
 * @param {string} tokenType - The type of token to revoke
 * @returns {Promise<boolean>} True if token was successfully revoked, false otherwise
 *
 * @example
 * ```typescript
 * const revoked = await revokeSessionToken('123', 'access');
 * if (revoked) {
 *   console.log('User session revoked successfully');
 * }
 * ```
 */
export async function revokeSessionToken(userId: string, tokenType: string): Promise<boolean> {
  try {
    const result = await redis.del(`token:${userId}:${tokenType}`);
    return result > 0;
  } catch (error) {
    console.error("Failed to revoke session token:", error);
    return false;
  }
}

/**
 * Revokes all session tokens for a specific user across all token types.
 *
 * @param {string} userId - The user ID whose tokens should be revoked
 * @returns {Promise<number>} Number of tokens successfully revoked
 *
 * @example
 * ```typescript
 * const revokedCount = await revokeAllUserTokens('123');
 * console.log(`Revoked ${revokedCount} tokens for user`);
 * ```
 */
export async function revokeAllUserTokens(userId: string): Promise<number> {
  try {
    const pattern = `token:${userId}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length === 0) {
      return 0;
    }

    const result = await redis.del(...keys);
    return result;
  } catch (error) {
    console.error("Failed to revoke all user tokens:", error);
    return 0;
  }
}

/**
 * Checks if a token exists in Redis storage without validating its content.
 *
 * @param {string} userId - The user ID
 * @param {string} tokenType - The token type
 * @returns {Promise<boolean>} True if token exists in storage, false otherwise
 *
 * @example
 * ```typescript
 * const exists = await isTokenStored('123', 'access');
 * if (!exists) {
 *   console.log('Token has been revoked or expired');
 * }
 * ```
 */
export async function isTokenStored(userId: string, tokenType: string): Promise<boolean> {
  try {
    const exists = await redis.exists(`token:${userId}:${tokenType}`);
    return exists === 1;
  } catch (error) {
    console.error("Failed to check token storage:", error);
    return false;
  }
}
