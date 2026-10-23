import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Users, Shield, UserCheck, Mail, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
};

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    include: {
      profile: true,
      submissions: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-red-600" />
            User Management & RBAC Roles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage student, teacher, and system administrator accounts and platform permissions
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
          Total Users: {users.length}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const roleColor =
                u.role === "ADMIN"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : u.role === "TEACHER"
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-blue-50 text-blue-700 border-blue-200";

              return (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${roleColor}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {u.profile?.department || "Computer Science"}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
