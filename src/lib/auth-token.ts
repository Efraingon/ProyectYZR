/**
 * Signed session token. Uses Web Crypto only, so the same code works in the
 * Edge Proxy and in Node Server Actions / Server Components.
 */

export const SESSION_COOKIE = "pyzr_session";

export type Session = {
  sub: string;
  email: string;
  name: string;
  role: "demo" | "admin";
  /** Expiration time in epoch milliseconds. */
  exp: number;
};

const encoder = new TextEncoder();
const secret = process.env.AUTH_SECRET ?? "proyectyzr-demo-secret-change-me";

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(
    String.fromCharCode(...new Uint8Array(signature))
  );
}

/** Constant-time comparison for credential and signature checks. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(session: Session): Promise<string> {
  const payload = toBase64Url(JSON.stringify(session));
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<Session | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expected = await sign(payload);
  if (!safeEqual(signature, expected)) return null;

  try {
    const session = JSON.parse(fromBase64Url(payload)) as Session;
    if (!session || typeof session.exp !== "number") return null;
    if (session.exp <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}
