import { requireRole } from "@/lib/auth-helpers";
import { OSLabsApp } from "@/components/desktop/apps/os-labs-app";
import { BookOpen, Cpu, Sparkles, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OS Practical Laboratory",
};

export default async function StudentLabsPage() {
  await requireRole(["STUDENT", "ADMIN"]);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-3">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={22} className="text-blue-600" />
            Operating System Practical Algorithms Laboratory
          </h1>
          <p className="text-xs text-slate-500">
            Simulate and visualize CPU scheduling, process synchronization, deadlock avoidance, and memory management
          </p>
        </div>
      </div>

      {/* Simulator Container */}
      <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col bg-white">
        <OSLabsApp />
      </div>
    </div>
  );
}
