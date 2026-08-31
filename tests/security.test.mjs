import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const middleware = readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");
const protectedLayout = readFileSync(new URL("../app/(protected)/layout.tsx", import.meta.url), "utf8");
const homePage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const requiredRoutes = ["dashboard", "accounts", "review", "reconciliation", "audit", "intake", "supplier", "settings"];

test("every sensitive direct route is matched by the authentication middleware", () => {
  for (const route of requiredRoutes) assert.match(middleware, new RegExp(`"/${route}/:path\\*"`));
});

test("an unauthenticated server render is redirected as a second line of defense", () => {
  assert.match(protectedLayout, /if \(!authenticatedOwner\(\)\) redirect\("\/login"\)/);
});

test("the middleware redirects requests that do not have a valid session", () => {
  assert.match(middleware, /if \(await validSession\(request\.cookies\.get\(SESSION_COOKIE\)\?\.value\)\) return NextResponse\.next\(\)/);
  assert.match(middleware, /return NextResponse\.redirect\(login\)/);
});

test("the root URL directs visitors to sign in or the authorized dashboard", () => {
  assert.match(homePage, /redirect\(authenticatedOwner\(\) \? "\/dashboard" : "\/login"\)/);
});
