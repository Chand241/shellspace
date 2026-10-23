import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  FileText,
  Clock,
  Calendar,
  Award,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Code2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab Assignments",
};

export default async function AssignmentsPage() {
  const session = await requireRole(["STUDENT", "ADMIN"]);

  const [assignments, submissions] = await Promise.all([
    prisma.labAssignment.findMany({
      where: { status: "PUBLISHED" },
      include: {
        category: true,
        course: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.labSubmission.findMany({
      where: { studentId: session.user.id },
      select: {
        assignmentId: true,
        status: true,
        finalScore: true,
      },
    }),
  ]);

  const submissionMap = new Map(submissions.map((s) => [s.assignmentId, s]));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText size={22} className="text-blue-600" />
          Operating System Lab Assignments
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete practical lab problems, write Bash automation scripts, and submit for evaluation
        </p>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assignment) => {
          const sub = submissionMap.get(assignment.id);
          const isSubmitted = sub && sub.status !== "DRAFT";
          const isGraded = sub?.status === "GRADED";

          return (
            <div
              key={assignment.id}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Category & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {assignment.category?.name}
                  </span>
                  {isGraded ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 size={12} />
                      {sub.finalScore} / {assignment.maxMarks} Marks
                    </span>
                  ) : isSubmitted ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock size={12} />
                      Submitted
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {assignment.difficulty}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                  {assignment.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {assignment.description}
                </p>

                {/* Meta Items */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Award size={13} className="text-slate-400" />
                      Max Marks:
                    </span>
                    <span className="font-semibold text-slate-800">{assignment.maxMarks}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Calendar size={13} className="text-slate-400" />
                      Deadline:
                    </span>
                    <span className="font-mono text-[11px] font-medium text-slate-700">
                      {assignment.deadline ? formatDate(assignment.deadline) : "No deadline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/student/bash-studio"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <Code2 size={13} />
                  <span>Solve in Studio</span>
                </Link>

                <Link
                  href={`/student/assignments/${assignment.id}`}
                  className="flex items-center gap-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>Details</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 p-8">
            <FileText size={36} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Assignments Available</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your instructor will publish new lab practicals here soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
