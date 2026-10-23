import { requireRole } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { TopBar } from "@/components/shared/top-bar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["ADMIN"]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar user={session.user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar user={session.user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
