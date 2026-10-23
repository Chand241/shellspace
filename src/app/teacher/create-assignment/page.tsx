import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Plus, BookOpen, Code2, Sparkles, Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Lab Assignment",
};

export default async function CreateAssignmentPage() {
  await requireRole(["TEACHER", "ADMIN"]);

  const [categories, courses] = await Promise.all([
    prisma.labCategory.findMany({ orderBy: { order: "asc" } }),
    prisma.course.findMany({ orderBy: { code: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/teacher/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Back to Assignments</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Plus size={22} className="text-violet-600" />
            Create New Lab Assignment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify the operating system practical problem, instructions, initial starter bash script, and verification test case.
          </p>
        </div>

        <form action="/api/assignments" method="POST" className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assignment Title *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Lab 4: Round Robin CPU Scheduling Simulation"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>

          {/* Category & Course & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                OS Topic Category *
              </label>
              <select
                name="categoryId"
                required
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Associated Course
              </label>
              <select
                name="courseId"
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              >
                <option value="">No Course / Open Lab</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                defaultValue="BEGINNER"
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* Description & Max Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Description *
              </label>
              <input
                type="text"
                name="description"
                required
                placeholder="Brief summary of the algorithm or OS concept..."
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Marks
              </label>
              <input
                type="number"
                name="maxMarks"
                defaultValue={100}
                min={10}
                max={500}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Detailed Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Problem Statement & Submission Requirements
            </label>
            <textarea
              name="instructions"
              rows={4}
              placeholder="Provide step-by-step requirements, input format, output format, edge cases..."
              className="w-full text-xs p-3.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 leading-relaxed"
            />
          </div>

          {/* Starter Template Script */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Starter Bash Script (`solution.sh`)
            </label>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900">
              <div className="h-8 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>solution.sh template</span>
                <span>Bash</span>
              </div>
              <textarea
                name="starterCode"
                rows={5}
                defaultValue={`#!/usr/bin/env bash\n# OS Lab Solution\n\necho "Hello from OS Lab"\n`}
                className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 outline-none resize-y leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Sample Test Case */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Verification Test Case (Auto-Grading)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Sample Input (STDIN or Args)
                </label>
                <input
                  type="text"
                  name="testInput"
                  placeholder="e.g. 4 1 2 3"
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Expected Output
                </label>
                <input
                  type="text"
                  name="testExpectedOutput"
                  placeholder="e.g. Average Waiting Time: 8.75 ms"
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Link
              href="/teacher/assignments"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              Publish Lab Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
