import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, sessionSecret } from "./auth-config";

type Session = { email: string; exp: number };
type Reset = { email: string; exp: number };
const resets = new Map<string, Reset>();
const attempts = new Map<string, number[]>();
let replacementPassword: { salt: string; hash: Buffer } | undefined;

const b64 = (input: string | Buffer) => Buffer.from(input).toString("base64url");
const sign = (value: string) => createHmac("sha256", sessionSecret()).update(value).digest("base64url");

export function ownerEmail() { return (process.env.OWNER_EMAIL || "owner@example.com").trim().toLowerCase(); }
function passwordMatches(candidate: string) {
  if (replacementPassword) {
    const hash = scryptSync(candidate, replacementPassword.salt, 64);
    return timingSafeEqual(hash, replacementPassword.hash);
  }
  const expected = process.env.OWNER_PASSWORD || "change-this-before-deployment";
  // Constant-time comparison prevents leaking the configured password prefix.
  const candidateBuffer = Buffer.from(candidate), expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer);
}

export function createSession(email: string) {
  const payload = b64(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }));
  return `${payload}.${sign(payload)}`;
}

export function readSession(token?: string): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return session.email === ownerEmail() && Number.isFinite(session.exp) && session.exp > Date.now() / 1000 ? session : null;
  } catch { return null; }
}

export function authenticatedOwner() { return readSession(cookies().get(SESSION_COOKIE)?.value); }

export function loginAllowed(key: string) {
  const now = Date.now(), windowMs = 15 * 60_000, limit = 5;
  const recent = (attempts.get(key) || []).filter((at) => at > now - windowMs);
  if (recent.length >= limit) return false;
  recent.push(now); attempts.set(key, recent); return true;
}
export function clearAttempts(key: string) { attempts.delete(key); }
export function validCredentials(email: string, password: string) { return email.trim().toLowerCase() === ownerEmail() && passwordMatches(password); }

export function createReset(email: string) {
  if (email.trim().toLowerCase() !== ownerEmail()) return null;
  const token = randomBytes(32).toString("base64url");
  resets.set(token, { email: ownerEmail(), exp: Date.now() + 15 * 60_000 });
  return token;
}
export function consumeReset(token: string, password: string) {
  const reset = resets.get(token); resets.delete(token);
  if (!reset || reset.exp < Date.now() || password.length < 12) return false;
  const salt = randomBytes(16).toString("base64url");
  replacementPassword = { salt, hash: scryptSync(password, salt, 64) }; return true;
}
