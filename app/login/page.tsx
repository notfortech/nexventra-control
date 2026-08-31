"use client";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
export default function LoginPage() {
  const router = useRouter(), search = useSearchParams(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) }); if (response.ok) router.replace(search.get("next")?.startsWith("/") ? search.get("next")! : "/dashboard"); else { const body = await response.json(); setError(body.error || "Unable to sign in."); setBusy(false); } }
  return <section><h1>Owner sign in</h1><p>Use the configured owner account to access Nexventra Control.</p><form onSubmit={submit}><label>Email <input name="email" type="email" autoComplete="username" required /></label><label>Password <input name="password" type="password" autoComplete="current-password" required /></label>{error && <p className="error" role="alert">{error}</p>}<button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form><p><a href="/reset-password">Forgot your password?</a></p></section>;
}
