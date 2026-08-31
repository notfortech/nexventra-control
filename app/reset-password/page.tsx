"use client";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
export default function ResetPassword() {
  const [notice, setNotice] = useState(""); const token = useSearchParams().get("token");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const endpoint = token ? "/api/auth/reset-password" : "/api/auth/request-password-reset"; const payload = Object.fromEntries(new FormData(event.currentTarget)); if (token) Object.assign(payload, { token }); const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); setNotice(response.ok ? (token ? "Password changed. You can now sign in." : "If the address is registered, password reset instructions have been sent.") : "Unable to reset password. Request a new link and try again."); }
  return <section><h1>Reset password</h1><form onSubmit={submit}>{token ? <label>New password <input name="password" type="password" minLength={12} required autoComplete="new-password" /></label> : <label>Owner email <input name="email" type="email" required autoComplete="email" /></label>}<button>{token ? "Set new password" : "Request reset"}</button></form>{notice && <p className="notice" role="status">{notice}</p>}<p><a href="/login">Return to sign in</a></p></section>;
}
