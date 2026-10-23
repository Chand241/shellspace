import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { BookOpen, Award, FileText, ChevronRight, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Lab Assignments",
};

export default async function AdminAssignmentsPage() {
  await requireRole(["ADMIN"]);

  const assignments = await prisma.labAssignment.findMany({
    include: {
      category: true,
      course: true,
      submissions: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={22} className="text-red-600" />
            Global Lab Assignments Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System-wide inventory of all operating systems lab exercises, test cases, and solutions
          </p>
        </div>

        <Link
          href="/teacher/create-assignment"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>New Lab</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Difficulty</th>
              <th className="py-3 px-4 text-center">Submissions</th>
              <th className="py-3 px-4 text-right">Max Marks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignments.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">
                  {a.title}
                </td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {a.category.name}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {a.course ? a.course.code : "Open Lab"}
                </td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {a.difficulty}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-mono">
                  {a.submissions.length}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                  {a.maxMarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
