import { requireRole } from "@/lib/auth-helpers";
import { BashStudioApp } from "@/components/desktop/apps/bash-studio-app";
import { Code2, Sparkles, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bash Script Studio & IDE",
};

export default async function BashStudioPage() {
  await requireRole(["STUDENT", "ADMIN"]);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Code2 size={22} className="text-blue-600" />
            Bash Script Studio & Simulation IDE
          </h1>
          <p className="text-xs text-slate-500">
            Write, execute, and debug Bash scripts with built-in Operating System algorithm templates
          </p>
        </div>
      </div>

      {/* Editor & Console Container */}
      <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col bg-white">
        <BashStudioApp />
      </div>
    </div>
  );
}
