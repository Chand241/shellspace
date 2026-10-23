import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Users, Mail, GraduationCap, Award, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrolled Students",
};

export default async function TeacherStudentsPage() {
  await requireRole(["TEACHER", "ADMIN"]);

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      submissions: {
        select: { id: true, finalScore: true, status: true },
      },
      enrollments: {
        include: { course: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-violet-600" />
            Enrolled Students Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View student laboratory performance, submission activity, and course enrollment
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
          Total Students: {students.length}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Enrolled Courses</th>
              <th className="py-3 px-4 text-center">Submissions</th>
              <th className="py-3 px-4 text-right">Avg Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => {
              const gradedSubs = student.submissions.filter(
                (s) => s.status === "GRADED" && s.finalScore !== null
              );
              const avgScore =
                gradedSubs.length > 0
                  ? Math.round(
                      gradedSubs.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) /
                        gradedSubs.length
                    )
                  : "N/A";

              return (
                <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{student.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {student.email}
                  </td>
                  <td className="py-3 px-4">
                    {student.enrollments.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.enrollments.map((e) => (
                          <span
                            key={e.id}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                          >
                            {e.course.code}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">All OS Labs</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    {student.submissions.length}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    {typeof avgScore === "number" ? `${avgScore}%` : avgScore}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No registered students found.
          </div>
        )}
      </div>
    </div>
  );
}
