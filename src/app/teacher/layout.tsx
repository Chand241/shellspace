import { requireRole } from "@/lib/auth-helpers";
import { TeacherSidebar } from "@/components/teacher/teacher-sidebar";
import { TopBar } from "@/components/shared/top-bar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["TEACHER", "ADMIN"]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <TeacherSidebar user={session.user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar user={session.user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
