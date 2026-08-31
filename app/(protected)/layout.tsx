import { redirect } from "next/navigation";
import { authenticatedOwner } from "../../lib/auth";
export default function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) { if (!authenticatedOwner()) redirect("/login"); return children; }
