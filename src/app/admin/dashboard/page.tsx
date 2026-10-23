import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Users, BookOpen, Terminal, Shield, Activity,
  AlertCircle, CheckCircle2, ChevronRight,
} from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

async function getAdminStats() {
  const [
    userCount, studentCount, teacherCount,
    assignmentCount, submissionCount,
    runningJobs, failedJobs,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.labAssignment.count(),
    prisma.labSubmission.count(),
    prisma.executionJob.count({ where: { status: "RUNNING" } }),
    prisma.executionJob.count({ where: { status: "FAILED" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true, isActive: true },
    }),
  ]);

  return {
    userCount, studentCount, teacherCount,
    assignmentCount, submissionCount,
    runningJobs, failedJobs,
    recentUsers,
  };
}

export default async function AdminDashboard() {
  await requireRole(["ADMIN"]);
  const stats = await getAdminStats();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.userCount, icon: Users, color: "bg-blue-50 text-blue-600", border: "border-blue-100", href: "/admin/users" },
          { label: "Assignments", value: stats.assignmentCount, icon: BookOpen, color: "bg-violet-50 text-violet-600", border: "border-violet-100", href: "/admin/assignments" },
          { label: "Submissions", value: stats.submissionCount, icon: Terminal, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100", href: "/admin/executions" },
          { label: "Failed Jobs", value: stats.failedJobs, icon: AlertCircle, color: "bg-red-50 text-red-600", border: "border-red-100", href: "/admin/executions" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className={`bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow ${s.border}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* User breakdown */}
      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { label: "Students", value: stats.studentCount, color: "text-blue-600 bg-blue-50" },
          { label: "Teachers", value: stats.teacherCount, color: "text-violet-600 bg-violet-50" },
          { label: "Running Jobs", value: stats.runningJobs, color: "text-amber-600 bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
            <p className={`text-3xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Users</h2>
            <Link href="/admin/users" className="text-red-600 text-sm font-medium hover:underline flex items-center gap-1">
              Manage <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === "ADMIN" ? "bg-red-50 text-red-700" :
                    u.role === "TEACHER" ? "bg-violet-50 text-violet-700" :
                    "bg-blue-50 text-blue-700"
                  }`}>{u.role}</span>
                  {u.isActive
                    ? <CheckCircle2 size={14} className="text-emerald-500" />
                    : <AlertCircle size={14} className="text-red-400" />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <div className="space-y-2">
            {[
              { href: "/admin/users", icon: Users, label: "Manage Users", desc: "Roles, suspension, reset" },
              { href: "/admin/executions", icon: Terminal, label: "Execution Monitor", desc: `${stats.runningJobs} running, ${stats.failedJobs} failed` },
              { href: "/admin/audit-logs", icon: Shield, label: "Audit Logs", desc: "Security & access history" },
              { href: "/admin/health", icon: Activity, label: "System Health", desc: "Services & resource status" },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                  <a.icon size={16} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
