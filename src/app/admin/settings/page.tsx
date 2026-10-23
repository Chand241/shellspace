import { requireRole } from "@/lib/auth-helpers";
import { Settings, Shield, Sliders, Server, Save, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Settings",
};

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings size={22} className="text-red-600" />
          ShellSpace Platform & Sandbox Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Adjust global execution constraints, user quota limits, and security enforcement policies
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
            Sandbox Resource Limits
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="font-semibold text-slate-800">Max Script Execution Timeout</div>
                <div className="text-slate-400 text-[11px]">Hard CPU time limit per Bash invocation</div>
              </div>
              <span className="font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                10 seconds
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="font-semibold text-slate-800">Sandbox Memory Limit</div>
                <div className="text-slate-400 text-[11px]">RAM allocated per student workspace container</div>
              </div>
              <span className="font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                128 MB
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="font-semibold text-slate-800">Max Workspace Storage Quota</div>
                <div className="text-slate-400 text-[11px]">Disk storage allocated for virtual home directory</div>
              </div>
              <span className="font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                500 MB
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Student Self-Registration</div>
                <div className="text-slate-400 text-[11px]">Allow new students to sign up with university email</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
