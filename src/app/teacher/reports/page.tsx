import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { BarChart3, TrendingUp, Users, Award, CheckCircle2, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics & Reports",
};

export default async function TeacherReportsPage() {
  await requireRole(["TEACHER", "ADMIN"]);

  const [submissions, studentsCount, assignmentsCount] = await Promise.all([
    prisma.labSubmission.findMany({
      include: {
        assignment: { select: { title: true, maxMarks: true, categoryId: true } },
      },
    }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.labAssignment.count(),
  ]);

  const graded = submissions.filter((s) => s.status === "GRADED" && s.finalScore !== null);
  const avgScore =
    graded.length > 0
      ? Math.round(graded.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / graded.length)
      : 0;

  const passedCount = graded.filter((s) => (s.finalScore || 0) >= (s.assignment.maxMarks * 0.5)).length;
  const passRate = graded.length > 0 ? Math.round((passedCount / graded.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 size={22} className="text-violet-600" />
          Lab Analytics & Student Progress Reports
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          High-level overview of assignment completion rates, score distributions, and cohort mastery
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Class Average</span>
            <Award size={18} className="text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{avgScore}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Across all evaluated labs</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pass Rate</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{passRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">{passedCount} passing grades</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Submissions</span>
            <TrendingUp size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{submissions.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">{graded.length} evaluated, {submissions.length - graded.length} pending</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cohort Size</span>
            <Users size={18} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{studentsCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Students enrolled</p>
        </div>
      </div>

      {/* Cohort Performance Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          OS Concept Mastery Summary
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>CPU Scheduling Simulation (FCFS / Round Robin)</span>
              <span>88% Mastery</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-600 rounded-full" style={{ width: "88%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Deadlock Avoidance & Banker's Algorithm</span>
              <span>76% Mastery</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: "76%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Inter-Process Communication & Synchronization</span>
              <span>82% Mastery</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: "82%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Memory Management & Page Replacement</span>
              <span>70% Mastery</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: "70%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
