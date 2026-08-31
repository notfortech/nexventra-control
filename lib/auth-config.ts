export const SESSION_COOKIE = "nexventra_owner_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;
export const PROTECTED_PATHS = [
  "/dashboard", "/accounts", "/review", "/reconciliation", "/audit", "/intake", "/supplier", "/settings",
] as const;

export function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("SESSION_SECRET must be at least 32 characters in production");
  }
  return secret || "development-only-secret-change-before-production";
}
