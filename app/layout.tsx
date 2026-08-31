import type { Metadata } from "next";
import Link from "next/link";
import { authenticatedOwner } from "../lib/auth";
import "./styles.css";

export const metadata: Metadata = { title: "Nexventra Control", robots: { index: false, follow: false } };
const links = ["dashboard", "accounts", "review", "reconciliation", "audit", "intake", "supplier", "settings"];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const owner = authenticatedOwner();
  return <html lang="en"><body><header><Link href={owner ? "/dashboard" : "/login"}>Nexventra Control</Link>
    {owner && <><nav aria-label="Primary navigation">{links.map((link) => <Link href={`/${link}`} key={link}>{link}</Link>)}</nav><form action="/api/auth/logout" method="post"><button type="submit">Log out</button></form></>}
  </header><main>{children}</main></body></html>;
}
