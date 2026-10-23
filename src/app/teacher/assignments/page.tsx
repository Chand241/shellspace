import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { BookOpen, Plus, Calendar, Clock, Award, FileText, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Lab Assignments",
};

export default async function TeacherAssignmentsPage() {
  await requireRole(["TEACHER", "ADMIN"]);

  const assignments = await prisma.labAssignment.findMany({
    include: {
      category: true,
      course: true,
      submissions: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={22} className="text-violet-600" />
            Lab Assignments Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, configure, and monitor student progress across all practical laboratory assignments
          </p>
        </div>

        <Link
          href="/teacher/create-assignment"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>New Assignment</span>
        </Link>
      </div>

      {/* Grid of assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assignment) => {
          const totalSubs = assignment.submissions.length;
          const gradedSubs = assignment.submissions.filter((s) => s.status === "GRADED").length;

          return (
            <div
              key={assignment.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-violet-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                    {assignment.category.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {assignment.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {assignment.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {assignment.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Award size={13} className="text-slate-400" />
                    <span>{assignment.maxMarks} Marks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={13} className="text-slate-400" />
                    <span>{totalSubs} Submissions</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    {gradedSubs} / {totalSubs} evaluated
                  </span>
                  <Link
                    href={`/student/assignments/${assignment.id}`}
                    className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No assignments found. Click "New Assignment" to publish your first lab task.
        </div>
      )}
    </div>
  );
}
