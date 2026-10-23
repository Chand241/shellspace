import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Clock,
  Calendar,
  Award,
  ChevronLeft,
  CheckCircle2,
  Code2,
  AlertCircle,
  Play,
  Send,
} from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ submitted?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const assignment = await prisma.labAssignment.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: assignment ? assignment.title : "Assignment Details" };
}

export default async function AssignmentDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const qParams = searchParams ? await searchParams : {};
  const isJustSubmitted = qParams.submitted === "true";
  const session = await requireRole(["STUDENT", "ADMIN"]);

  const [assignment, submission] = await Promise.all([
    prisma.labAssignment.findUnique({
      where: { id },
      include: {
        category: true,
        course: true,
        starterFiles: true,
        testCases: { where: { isHidden: false } },
      },
    }),
    prisma.labSubmission.findFirst({
      where: {
        assignmentId: id,
        studentId: session.user.id,
      },
      include: {
        feedback: true,
        testResults: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!assignment) {
    notFound();
  }

  const starterCode =
    assignment.starterFiles[0]?.content ||
    `#!/usr/bin/env bash\n# Solution for: ${assignment.title}\n\n# Your code here\n`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/student/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Back to Assignments</span>
        </Link>
      </div>

      {isJustSubmitted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 shadow-xs">
          <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-emerald-900">Solution Submitted Successfully!</h4>
            <p className="text-emerald-700 mt-0.5">
              Your Bash script has been recorded. Your instructor will review your work and provide grading and evaluation feedback.
            </p>
          </div>
        </div>
      )}

      {/* Main Assignment Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {assignment.category.name}
              </span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {assignment.difficulty}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{assignment.title}</h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <div className="text-[10px] text-slate-500 font-sans uppercase font-bold">Max Marks</div>
              <div className="text-base font-bold text-slate-800">{assignment.maxMarks}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
              <div className="text-[10px] text-slate-500 font-sans uppercase font-bold">Due Date</div>
              <div className="text-xs font-bold text-slate-700">
                {assignment.deadline ? formatDate(assignment.deadline) : "Open"}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Problem Description & Instructions
          </h2>
          <div className="prose prose-sm text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
            {assignment.instructions || assignment.description}
          </div>
        </div>

        {/* Public Test Cases */}
        {assignment.testCases.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Sample Test Cases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignment.testCases.map((tc, idx) => (
                <div key={tc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
                  <div className="font-sans font-semibold text-slate-700 mb-1">
                    Test Case #{idx + 1} ({tc.marks} marks)
                  </div>
                  {tc.input && (
                    <div className="text-[11px] text-slate-600 mb-1">
                      <span className="text-slate-400">Input:</span> {tc.input}
                    </div>
                  )}
                  {tc.expectedOutput && (
                    <div className="text-[11px] text-slate-600">
                      <span className="text-slate-400">Expected:</span> {tc.expectedOutput}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Panel */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Code2 size={15} className="text-blue-600" />
              <span>Solution Submission</span>
            </h2>

            {submission && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  submission.status === "GRADED"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
                }`}
              >
                Status: {submission.status}
              </span>
            )}
          </div>

          <form action="/api/submissions" method="POST" className="space-y-3">
            <input type="hidden" name="assignmentId" value={assignment.id} />
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900">
              <div className="h-8 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>solution.sh</span>
                <span>Bash Shell</span>
              </div>
              <textarea
                name="scriptContent"
                rows={12}
                defaultValue={submission?.scriptSnapshot || starterCode}
                className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 outline-none resize-y leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/student/bash-studio"
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Play size={12} />
                <span>Test in Interactive Bash Studio first</span>
              </Link>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                <Send size={13} />
                <span>Submit Final Solution</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Submission & Teacher Feedback */}
        {submission && submission.feedback && submission.feedback.length > 0 && (
          <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Teacher Evaluation & Feedback</span>
            </div>
            {submission.feedback.map((fb) => (
              <p key={fb.id} className="text-xs text-emerald-800 leading-relaxed">
                {fb.comment}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
