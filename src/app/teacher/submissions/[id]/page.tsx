import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  User,
  Award,
  Calendar,
  CheckCircle2,
  Code2,
  Send,
  MessageSquare,
} from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Evaluate Submission" };
}

export default async function EvaluateSubmissionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireRole(["TEACHER", "ADMIN"]);

  const submission = await prisma.labSubmission.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true, email: true } },
      assignment: {
        include: {
          category: true,
          testCases: true,
        },
      },
      feedback: true,
    },
  });

  if (!submission) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/teacher/submissions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Back to Submissions Queue</span>
        </Link>
      </div>

      {/* Submission Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                {submission.assignment.category.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Attempt #{submission.attemptNumber}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              {submission.assignment.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
              <User size={13} className="text-slate-400" />
              <span className="font-semibold text-slate-800">{submission.student.name}</span>
              <span>({submission.student.email})</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center text-xs">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Max Marks</div>
            <div className="text-base font-bold text-slate-800">{submission.assignment.maxMarks}</div>
          </div>
        </div>

        {/* Script Snapshot */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Code2 size={14} className="text-violet-600" />
            <span>Student's Submitted Bash Script</span>
          </h2>
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900">
            <div className="h-8 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>solution.sh</span>
              <span>Submitted: {submission.submittedAt ? formatDate(submission.submittedAt) : ""}</span>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap select-text">
              {submission.scriptSnapshot || "# No code snapshot found"}
            </pre>
          </div>
        </div>

        {/* Grading Form */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Award size={14} className="text-violet-600" />
            <span>Instructor Evaluation & Grade</span>
          </h2>

          <form action="/api/grades" method="POST" className="space-y-4">
            <input type="hidden" name="submissionId" value={submission.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Final Score (out of {submission.assignment.maxMarks})
                </label>
                <input
                  type="number"
                  name="finalScore"
                  min={0}
                  max={submission.assignment.maxMarks}
                  defaultValue={submission.finalScore || ""}
                  required
                  placeholder="e.g. 85"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teacher Feedback & Qualitative Remarks
              </label>
              <textarea
                name="comments"
                rows={4}
                defaultValue={submission.feedback[0]?.comment || ""}
                placeholder="Explain what the student did well, code efficiency, or areas to improve in process handling..."
                className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors"
              >
                <Send size={13} />
                <span>Save Grade & Notify Student</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
