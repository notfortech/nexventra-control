import { NextRequest, NextResponse } from "next/server";
import { createReset } from "../../../../lib/auth";
export async function POST(request: NextRequest) {
  let email = ""; try { const body = await request.json(); email = typeof body.email === "string" ? body.email : ""; } catch { /* Deliberately return the same response. */ }
  const token = createReset(email);
  // Keeping the reset URL out of the HTTP response prevents account enumeration and token disclosure.
  if (token) {
    const resetUrl = new URL(`/reset-password?token=${token}`, request.url).toString();
    const webhook = process.env.PASSWORD_RESET_WEBHOOK_URL;
    if (webhook) await fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, resetUrl }) }).catch(() => undefined);
    else if (process.env.NODE_ENV !== "production") console.info(`Password reset URL: ${resetUrl}`);
  }
  return NextResponse.json({ ok: true }, { status: 202 });
}
