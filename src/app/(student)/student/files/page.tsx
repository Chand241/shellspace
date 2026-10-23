import { requireRole } from "@/lib/auth-helpers";
import { FileManagerApp } from "@/components/desktop/apps/file-manager-app";
import { FolderOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtual File Manager",
};

export default async function StudentFilesPage() {
  await requireRole(["STUDENT", "ADMIN"]);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-3">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FolderOpen size={22} className="text-blue-600" />
          Virtual File Manager & Workspace
        </h1>
        <p className="text-xs text-slate-500">
          Explore student home directory, Bash scripts, lab notes, and created source code files
        </p>
      </div>

      <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col bg-white">
        <FileManagerApp />
      </div>
    </div>
  );
}
