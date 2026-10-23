import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  User,
  Award,
  AlertCircle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submission Grading Queue",
};

interface TeacherSubmissionsPageProps {
  searchParams?: Promise<{ graded?: string }>;
}

export default async function TeacherSubmissionsPage({ searchParams }: TeacherSubmissionsPageProps) {
  const qParams = searchParams ? await searchParams : {};
  const isJustGraded = qParams.graded === "true";
  await requireRole(["TEACHER", "ADMIN"]);

  const submissions = await prisma.labSubmission.findMany({
    include: {
      student: { select: { id: true, name: true, email: true } },
      assignment: { select: { id: true, title: true, maxMarks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = submissions.filter((s) => s.status === "SUBMITTED").length;
  const gradedCount = submissions.filter((s) => s.status === "GRADED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText size={22} className="text-violet-600" />
            Student Submissions Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review code snapshots, run test cases, and record final marks and qualitative feedback
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
            {pendingCount} Pending Review
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            {gradedCount} Evaluated
          </span>
        </div>
      </div>

      {isJustGraded && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 shadow-xs">
          <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-emerald-900">Grade & Feedback Saved!</h4>
            <p className="text-emerald-700 mt-0.5">
              The student's submission has been evaluated, recorded in the gradebook, and feedback is now visible to the student.
            </p>
          </div>
        </div>
      )}

      {/* Submissions Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Assignment</th>
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
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{sub.student.name}</div>
                    <div className="text-[11px] text-slate-400">{sub.student.email}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {sub.assignment.title}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {sub.submittedAt ? formatDate(sub.submittedAt) : formatDate(sub.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    #{sub.attemptNumber}
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
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    {isGraded ? `${sub.finalScore} / ${sub.assignment.maxMarks}` : "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/teacher/submissions/${sub.id}`}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                    >
                      {isGraded ? "Review" : "Grade"}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {submissions.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No submissions in the queue.
          </div>
        )}
      </div>
    </div>
  );
}
