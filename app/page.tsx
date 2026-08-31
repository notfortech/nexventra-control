import { redirect } from "next/navigation";
import { authenticatedOwner } from "../lib/auth";

export default function Home() {
  redirect(authenticatedOwner() ? "/dashboard" : "/login");
}
