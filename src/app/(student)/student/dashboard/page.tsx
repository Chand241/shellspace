import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Monitor,
  Terminal,
  Code2,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Star,
  TrendingUp,
} from "lucide-react";

export const metadata = { title: "Dashboard" };

async function getStudentStats(userId: string) {
  const [submissions, pendingAssignments, recentActivity] = await Promise.all([
    prisma.labSubmission.findMany({
      where: { studentId: userId },
      include: { assignment: { select: { title: true, maxMarks: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.labAssignment.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
      },
      include: { category: true },
      orderBy: { deadline: "asc" },
      take: 4,
    }),
    prisma.executionJob.count({
      where: { userId },
    }),
  ]);

  const totalSubmissions = await prisma.labSubmission.count({ where: { studentId: userId } });
  const gradedCount = await prisma.labSubmission.count({
    where: { studentId: userId, status: "GRADED" },
  });

  return { submissions, pendingAssignments, recentActivity, totalSubmissions, gradedCount };
}

export default async function StudentDashboard() {
  const session = await requireRole(["STUDENT", "ADMIN"]);
  const { submissions, pendingAssignments, totalSubmissions, gradedCount } =
    await getStudentStats(session.user.id);

  const stats = [
    {
      label: "Submissions",
      value: totalSubmissions,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "Graded",
      value: gradedCount,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "Pending",
      value: pendingAssignments.length,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
    },
    {
      label: "Assignments",
      value: pendingAssignments.length,
      icon: BookOpen,
      color: "bg-violet-50 text-violet-600",
      border: "border-violet-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {session.user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s an overview of your lab progress and pending work.
          </p>
        </div>
        <Link
          href="/student/desktop"
          className="hidden md:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-sm transition-colors"
        >
          <Monitor size={16} />
          Open Desktop
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow ${stat.border}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Launch */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Launch</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/student/desktop", icon: Monitor, label: "Virtual Desktop", desc: "Open your workspace", color: "from-blue-500 to-blue-600" },
            { href: "/student/terminal", icon: Terminal, label: "Linux Terminal", desc: "Run Bash commands", color: "from-gray-700 to-gray-900" },
            { href: "/student/bash-studio", icon: Code2, label: "Bash Studio", desc: "Write & run scripts", color: "from-violet-500 to-violet-600" },
            { href: "/student/labs", icon: BookOpen, label: "OS Lab", desc: "Browse assignments", color: "from-emerald-500 to-emerald-600" },
          ].map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-100 hover:shadow-lg transition-all"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-3 shadow-sm group-hover:-translate-y-0.5 transition-transform`}>
                <app.icon size={20} className="text-white" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{app.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{app.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pending Assignments</h2>
            <Link href="/student/assignments" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {pendingAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Star size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No pending assignments. You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAssignments.map((a) => (
                <Link
                  key={a.id}
                  href={`/student/assignments/${a.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.category.name}</p>
                  </div>
                  {a.deadline && (
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1 flex-shrink-0">
                      <AlertCircle size={12} />
                      {formatDate(a.deadline, "MMM d")}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Submissions</h2>
            <Link href="/student/submissions" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No submissions yet. Start with an OS Lab assignment!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/student/submissions/${sub.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {sub.assignment.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(sub.createdAt)} · Attempt #{sub.attemptNumber}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                    sub.status === "GRADED" ? "bg-emerald-50 text-emerald-700" :
                    sub.status === "SUBMITTED" ? "bg-blue-50 text-blue-700" :
                    sub.status === "RETURNED" ? "bg-amber-50 text-amber-700" :
                    "bg-gray-50 text-gray-600"
                  }`}>
                    {sub.status === "GRADED" && sub.finalScore != null
                      ? `${sub.finalScore}/${sub.assignment.maxMarks}`
                      : sub.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
