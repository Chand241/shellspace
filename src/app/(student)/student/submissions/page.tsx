import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  Award,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Submissions",
};

export default async function SubmissionsPage() {
  const session = await requireRole(["STUDENT", "ADMIN"]);

  const submissions = await prisma.labSubmission.findMany({
    where: { studentId: session.user.id },
    include: {
      assignment: {
        include: { category: true },
      },
      feedback: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Star size={22} className="text-amber-500 fill-amber-400" />
          My Practical Submissions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track submission history, evaluation status, and instructor feedback
        </p>
      </div>

      {/* Submissions Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <th className="py-3 px-4">Assignment</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Submitted At</th>
              <th className="py-3 px-4">Attempt</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Score</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.map((sub) => {
              const isGraded = sub.status === "GRADED";

              return (
                <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {sub.assignment.title}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {sub.assignment.category.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {sub.submittedAt ? formatDate(sub.submittedAt) : formatDate(sub.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    #{sub.attemptNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isGraded
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : sub.status === "SUBMITTED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    {isGraded ? `${sub.finalScore} / ${sub.assignment.maxMarks}` : "Pending"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/student/assignments/${sub.assignmentId}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {submissions.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No submissions recorded yet. Complete an assignment to submit your work.
          </div>
        )}
      </div>
    </div>
  );
}
