import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileText, Award, User, CheckCircle2, ChevronRight, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Gradebook",
};

export default async function TeacherGradesPage() {
  await requireRole(["TEACHER", "ADMIN"]);

  const submissions = await prisma.labSubmission.findMany({
    include: {
      student: { select: { id: true, name: true, email: true } },
      assignment: { select: { id: true, title: true, maxMarks: true } },
      feedback: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award size={22} className="text-violet-600" />
            Master Lab Gradebook
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete record of student laboratory scores, evaluations, feedback, and grading status
          </p>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Lab Assignment</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Final Score</th>
              <th className="py-3 px-4">Instructor Feedback</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.map((sub) => {
              const isGraded = sub.status === "GRADED";
              const feedbackComment = sub.feedback[0]?.comment;

              return (
                <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{sub.student.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{sub.student.email}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {sub.assignment.title}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isGraded
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {isGraded ? `${sub.finalScore} / ${sub.assignment.maxMarks}` : "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {feedbackComment || <span className="text-slate-400 italic">No feedback yet</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/teacher/submissions/${sub.id}`}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors inline-block"
                    >
                      {isGraded ? "Edit Grade" : "Evaluate"}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {submissions.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No submissions recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
