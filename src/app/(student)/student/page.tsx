import { requireRole } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function StudentRootPage() {
  await requireRole(["STUDENT", "ADMIN"]);
  redirect("/student/dashboard");
}
