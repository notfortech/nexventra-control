import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "./lib/auth-config";

function base64url(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function secureEqual(a: string, b: string) { if (a.length !== b.length) return false; let different = 0; for (let i = 0; i < a.length; i++) different |= a.charCodeAt(i) ^ b.charCodeAt(i); return different === 0; }
async function validSession(token?: string) {
  if (!token) return false;
  const [payload, signature] = token.split("."); if (!payload || !signature) return false;
  const secret = process.env.SESSION_SECRET || "development-only-secret-change-before-production";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
  if (!secureEqual(signature, expected)) return false;
  try { const s = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { email: string; exp: number }; return s.email === (process.env.OWNER_EMAIL || "owner@example.com").trim().toLowerCase() && s.exp > Date.now() / 1000; } catch { return false; }
}
export async function middleware(request: NextRequest) {
  if (await validSession(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();
  const login = new URL("/login", request.url); login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}
export const config = { matcher: ["/dashboard/:path*", "/accounts/:path*", "/review/:path*", "/reconciliation/:path*", "/audit/:path*", "/intake/:path*", "/supplier/:path*", "/settings/:path*"] };
