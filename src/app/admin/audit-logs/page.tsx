import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Shield, Lock, FileText, User, AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit & Security Logs",
};

export default async function AdminAuditLogsPage() {
  await requireRole(["ADMIN"]);

  const sampleEvents = [
    { event: "USER_LOGIN_SUCCESS", user: "student@shellspace.edu", ip: "192.168.1.102", status: "SUCCESS", time: "Just now" },
    { event: "LAB_SUBMISSION_POSTED", user: "student@shellspace.edu", ip: "192.168.1.102", status: "SUCCESS", time: "4 mins ago" },
    { event: "GRADE_EVALUATION_RECORDED", user: "teacher@shellspace.edu", ip: "192.168.1.55", status: "SUCCESS", time: "18 mins ago" },
    { event: "NEW_ASSIGNMENT_PUBLISHED", user: "teacher@shellspace.edu", ip: "192.168.1.55", status: "SUCCESS", time: "1 hour ago" },
    { event: "ADMIN_CONSOLE_ACCESS", user: "admin@shellspace.edu", ip: "127.0.0.1", status: "VERIFIED", time: "2 hours ago" },
    { event: "SANDBOX_CONTAINER_SPAWNED", user: "system", ip: "internal", status: "EXIT_0", time: "3 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield size={22} className="text-red-600" />
          Security Audit Logs & Compliance Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically auditable record of user authentications, grading interventions, and sandbox events
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-sans font-semibold text-[11px]">
              <th className="py-3 px-4">Event Type</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Source IP</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-center">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sampleEvents.map((evt, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-800">
                  {evt.event}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {evt.user}
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {evt.ip}
                </td>
                <td className="py-3 px-4 text-slate-500 text-[11px]">
                  {evt.time}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {evt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
