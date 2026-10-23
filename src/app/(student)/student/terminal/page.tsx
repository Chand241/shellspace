import { requireRole } from "@/lib/auth-helpers";
import { TerminalApp } from "@/components/desktop/apps/terminal-app";
import { Terminal, Shield, RefreshCw } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linux Terminal Laboratory",
};

export default async function TerminalPage() {
  await requireRole(["STUDENT", "ADMIN"]);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-3">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Terminal size={22} className="text-blue-600" />
            Linux Bash Terminal Laboratory
          </h1>
          <p className="text-xs text-slate-500">
            Interactive virtual Linux environment with persistent workspace and command parser
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
            <Shield size={12} />
            Isolated Sandbox
          </span>
        </div>
      </div>

      {/* Terminal Viewport Container */}
      <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col bg-white">
        <div className="h-9 px-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 ml-2">
              student@shellspace: ~/workspace (bash)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">pts/0 • 80x24</span>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <TerminalApp />
        </div>
      </div>
    </div>
  );
}
