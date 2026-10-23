import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  BookOpen,
  Users,
  ClipboardList,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const metadata = { title: "Teacher Dashboard" };

async function getTeacherStats(userId: string) {
  const [assignmentCount, submissionCount, pendingReview, recentSubmissions] =
    await Promise.all([
      prisma.labAssignment.count({ where: { createdById: userId } }),
      prisma.labSubmission.count({
        where: { assignment: { createdById: userId } },
      }),
      prisma.labSubmission.count({
        where: {
          assignment: { createdById: userId },
          status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
        },
      }),
      prisma.labSubmission.findMany({
        where: { assignment: { createdById: userId } },
        include: {
          student: { select: { name: true, email: true } },
          assignment: { select: { title: true, maxMarks: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return { assignmentCount, submissionCount, pendingReview, recentSubmissions };
}

export default async function TeacherDashboard() {
  const session = await requireRole(["TEACHER", "ADMIN"]);
  const { assignmentCount, submissionCount, pendingReview, recentSubmissions } =
    await getTeacherStats(session.user.id);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {session.user.name.split(" ")[0]}
          </p>
        </div>
        <Link
          href="/teacher/create-assignment"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-sm transition-colors"
        >
          <Plus size={16} />
          New Assignment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Assignments", value: assignmentCount, icon: BookOpen, color: "bg-violet-50 text-violet-600", border: "border-violet-100" },
          { label: "Submissions", value: submissionCount, icon: ClipboardList, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
          { label: "Pending Review", value: pendingReview, icon: Clock, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
          { label: "Students", value: "—", icon: Users, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${s.border}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: "/teacher/create-assignment", icon: Plus, label: "Create Assignment", desc: "New lab task for students" },
              { href: "/teacher/assignments", icon: BookOpen, label: "Manage Assignments", desc: "Edit, publish, archive" },
              { href: "/teacher/submissions", icon: ClipboardList, label: "Review Submissions", desc: `${pendingReview} pending review` },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
                  <item.icon size={16} className="text-violet-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Submissions</h2>
            <Link href="/teacher/submissions" className="text-violet-600 text-sm font-medium hover:underline flex items-center gap-1">
              All <ChevronRight size={14} />
            </Link>
          </div>
          {recentSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No submissions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/teacher/submissions/${sub.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    sub.status === "GRADED" ? "bg-emerald-500" :
                    sub.status === "SUBMITTED" || sub.status === "UNDER_REVIEW" ? "bg-amber-500" :
                    "bg-gray-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{sub.student.name}</p>
                    <p className="text-xs text-gray-500 truncate">{sub.assignment.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-semibold ${
                      sub.status === "GRADED" ? "text-emerald-600" :
                      sub.status === "SUBMITTED" ? "text-amber-600" :
                      "text-gray-500"
                    }`}>
                      {sub.status === "GRADED" && sub.finalScore != null
                        ? `${sub.finalScore}/${sub.assignment.maxMarks}`
                        : sub.status}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(sub.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
