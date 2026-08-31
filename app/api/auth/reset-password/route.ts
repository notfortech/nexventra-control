import { NextRequest, NextResponse } from "next/server";
import { consumeReset } from "../../../../lib/auth";
export async function POST(request: NextRequest) {
  try { const body = await request.json(); const token = typeof body.token === "string" ? body.token : "", password = typeof body.password === "string" ? body.password : ""; if (!consumeReset(token, password)) return NextResponse.json({ error: "The reset link is invalid, expired, or the password is too short." }, { status: 400 }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
}
