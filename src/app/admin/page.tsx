import { requireRole } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

// /admin → redirect to /admin/dashboard
export default async function AdminRootPage() {
  await requireRole(["ADMIN"]);
  redirect("/admin/dashboard");
}
