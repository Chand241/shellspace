import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { GraduationCap, BookOpen, Users, Plus, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Courses",
};

export default async function AdminCoursesPage() {
  await requireRole(["ADMIN"]);

  const courses = await prisma.course.findMany({
    include: {
      assignments: true,
      enrollments: true,
      teachers: { include: { user: true } },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap size={22} className="text-red-600" />
            Curriculum Courses & Faculty Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global course catalog, instructor allocations, and enrolled cohorts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  {course.code}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{course.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {course.description || "Course description configured in system database."}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-slate-400" />
                <span>{course.assignments.length} Labs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-slate-400" />
                <span>{course.enrollments.length} Students</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
