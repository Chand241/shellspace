import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { GraduationCap, BookOpen, Users, Calendar, Award } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Courses",
};

export default async function TeacherCoursesPage() {
  await requireRole(["TEACHER", "ADMIN"]);

  const courses = await prisma.course.findMany({
    include: {
      assignments: true,
      enrollments: true,
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap size={22} className="text-violet-600" />
          Operating System Lab Courses
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review curriculum courses, enrolled student counts, and assigned laboratory experiments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-violet-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                  {course.code}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{course.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {course.description || "Comprehensive hands-on operating systems laboratory course."}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-slate-400" />
                <span>{course.assignments.length} Labs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-slate-400" />
                <span>{course.enrollments.length} Enrolled</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No courses currently configured in the database.
        </div>
      )}
    </div>
  );
}
