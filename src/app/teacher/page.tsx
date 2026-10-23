import { requireRole } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

// /teacher → redirect to /teacher/dashboard
export default async function TeacherRootPage() {
  await requireRole(["TEACHER", "ADMIN"]);
  redirect("/teacher/dashboard");
}
