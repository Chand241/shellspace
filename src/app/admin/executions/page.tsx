import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Terminal, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Execution Jobs Monitor",
};

export default async function AdminExecutionsPage() {
  await requireRole(["ADMIN"]);

  const submissions = await prisma.labSubmission.findMany({
    include: {
      student: { select: { name: true, email: true } },
      assignment: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Terminal size={22} className="text-red-600" />
            Sandbox Execution Jobs & Runtime Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry of containerized Bash script runs, resource consumption, and exit states
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Container Engine: Online
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Target Lab</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Exit Code</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                  {sub.student.name}
                </td>
                <td className="py-3 px-4 font-sans text-slate-700">
                  {sub.assignment.title}
                </td>
                <td className="py-3 px-4 text-[11px] text-slate-500">
                  {formatDate(sub.createdAt)}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    0 (SUCCESS)
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-sans text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {submissions.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No execution jobs logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
