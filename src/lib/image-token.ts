import crypto from "crypto";

/**
 * Image token signing -- short-lived HMAC-SHA256 tokens for gallery images.
 *
 * Token format: <expiry>.<base64url(hmac)>
 * Token TTL: configurable, default 300s (5 min)
 */

const TOKEN_TTL_SECONDS: number = parseInt(process.env.IMAGE_TOKEN_TTL || "300", 10);
const SECRET: string =
  process.env.IMAGE_TOKEN_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "fallback-dev-secret-do-not-use-in-prod";

function b64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf) : buf;
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

function sign(payload: string): string {
  return b64url(crypto.createHmac("sha256", SECRET).update(payload).digest());
}

/** Generate a signed token for accessing an image */
export function generateImageToken(slug: string, ttlSeconds: number = TOKEN_TTL_SECONDS): string {
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = slug + "." + expiry;
  const sig = sign(payload);
  return expiry + "." + sig;
}

/** Verify a token is valid for the given slug */
export function verifyImageToken(slug: string, token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const expiry = parseInt(parts[0], 10);
  if (isNaN(expiry)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (now > expiry) return false;
  const payload = slug + "." + expiry;
  const expectedSig = sign(payload);
  try {
    const a = b64urlDecode(parts[1]);
    const b = b64urlDecode(expectedSig);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Build a full URL with token attached (for client-side fetch) */
export function buildSignedImageUrl(
  slug: string,
  baseUrl?: string,
  variant: string = "full",
): string {
  const token = generateImageToken(slug);
  const base =
    baseUrl ||
    (typeof process !== "undefined" && process.env.NEXTAUTH_URL) ||
    "";
  const path =
    variant === "thumb"
      ? "/api/gallery/" + slug + "/thumb"
      : "/api/gallery/" + slug + "/image";
  return base + path + "?token=" + token;
}

/** Extract token from a Request's search params */
export function extractTokenFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("token");
}
