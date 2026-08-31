import { NextRequest, NextResponse } from "next/server";
import { clearAttempts, createSession, loginAllowed, validCredentials } from "../../../../lib/auth";
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "../../../../lib/auth-config";

export async function POST(request: NextRequest) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!loginAllowed(address)) return NextResponse.json({ error: "Too many sign-in attempts. Try again later." }, { status: 429, headers: { "Retry-After": "900" } });
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email : "", password = typeof body.password === "string" ? body.password : "";
  if (!validCredentials(email, password)) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  clearAttempts(address);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: SESSION_COOKIE, value: createSession(email.trim().toLowerCase()), httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_TTL_SECONDS, priority: "high" });
  return response;
}
