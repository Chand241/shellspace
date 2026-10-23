import { requireRole } from "@/lib/auth-helpers";
import { Settings, User, Mail, Shield, GraduationCap, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Settings",
};

export default async function TeacherSettingsPage() {
  const session = await requireRole(["TEACHER", "ADMIN"]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings size={22} className="text-violet-600" />
          Instructor Settings & Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your faculty credentials, teaching privileges, and notification preferences
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white font-bold text-xl flex items-center justify-center shadow-sm">
            {session.user.name?.charAt(0).toUpperCase() || "T"}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{session.user.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{session.user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                {session.user.role} FACULTY
              </span>
              <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                <CheckCircle2 size={12} />
                Verified Instructor
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Teaching Capabilities & Permissions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="font-semibold text-slate-800">Lab Creation & Management</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Author and publish practical assignments</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="font-semibold text-slate-800">Automated & Manual Grading</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Evaluate submissions and write remarks</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="font-semibold text-slate-800">Terminal Script Inspection</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Audit student sandbox executions</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="font-semibold text-slate-800">Cohort Analytics</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Export class performance metrics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
