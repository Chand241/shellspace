import { requireRole } from "@/lib/auth-helpers";
import { DesktopContainer } from "@/components/desktop/desktop-container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtual Desktop",
};

export default async function DesktopPage() {
  const session = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);

  return <DesktopContainer user={session.user} />;
}
