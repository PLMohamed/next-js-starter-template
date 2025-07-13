/**
 * Get client IP address from request headers
 * This function attempts to extract the client's IP address from various headers
 * @param headers - The headers of the request
 */
export function getClientIP(headers: Headers): string {
  const xForwardedFor = headers.get("x-forwarded-for");

  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

  const xRealIP = headers.get("x-real-ip");
  if (xRealIP) return xRealIP;

  const cfConnectingIP = headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  const xClientIP = headers.get("x-client-ip");
  if (xClientIP) return xClientIP;

  return "127.0.0.1";
}
