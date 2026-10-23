import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  BarChart3,
  Award,
  CheckCircle2,
  Clock,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grades & Feedback",
};

export default async function GradesPage() {
  const session = await requireRole(["STUDENT", "ADMIN"]);

  const gradedSubmissions = await prisma.labSubmission.findMany({
    where: {
      studentId: session.user.id,
      status: "GRADED",
    },
    include: {
      assignment: { include: { category: true } },
      feedback: { include: { teacher: { select: { name: true } } } },
    },
    orderBy: { gradedAt: "desc" },
  });

  const totalPointsEarned = gradedSubmissions.reduce(
    (acc, s) => acc + (s.finalScore || 0),
    0
  );
  const totalPointsPossible = gradedSubmissions.reduce(
    (acc, s) => acc + s.assignment.maxMarks,
    0
  );
  const percentage =
    totalPointsPossible > 0
      ? Math.round((totalPointsEarned / totalPointsPossible) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 size={22} className="text-blue-600" />
          Academic Grades & Teacher Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review graded evaluations, rubric breakdowns, and personalized teacher comments
        </p>
      </div>

      {/* Grade Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            {percentage}%
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium uppercase">Overall Lab Average</div>
            <div className="text-lg font-bold text-slate-800">{percentage >= 50 ? "Pass (In Good Standing)" : "Needs Review"}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <Award size={24} />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium uppercase">Total Marks Earned</div>
            <div className="text-lg font-bold text-slate-800">
              {totalPointsEarned} / {totalPointsPossible} pts
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium uppercase">Graded Practicals</div>
            <div className="text-lg font-bold text-slate-800">
              {gradedSubmissions.length} Completed
            </div>
          </div>
        </div>
      </div>

      {/* Graded Items List */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {gradedSubmissions.map((sub) => (
          <div key={sub.id} className="p-5 hover:bg-slate-50/60 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {sub.assignment.category.name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {sub.gradedAt ? formatDate(sub.gradedAt) : ""}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{sub.assignment.title}</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900 font-mono">
                    {sub.finalScore} / {sub.assignment.maxMarks}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {sub.finalScore && sub.assignment.maxMarks
                      ? `${Math.round((sub.finalScore / sub.assignment.maxMarks) * 100)}% score`
                      : ""}
                  </div>
                </div>

                <Link
                  href={`/student/assignments/${sub.assignmentId}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Teacher Feedback Note */}
            {sub.feedback.length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
                <MessageSquare size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">
                    {sub.feedback[0].teacher.name}:
                  </span>{" "}
                  {sub.feedback[0].comment}
                </div>
              </div>
            )}
          </div>
        ))}

        {gradedSubmissions.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No graded submissions yet. Completed assessments will show here once reviewed by your teacher.
          </div>
        )}
      </div>
    </div>
  );
}
