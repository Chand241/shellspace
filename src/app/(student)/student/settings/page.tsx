import { requireRole } from "@/lib/auth-helpers";
import { DesktopSettingsApp } from "@/components/desktop/apps/settings-app";
import { Settings, User, Shield, Monitor } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account & System Settings",
};

export default async function StudentSettingsPage() {
  const session = await requireRole(["STUDENT", "ADMIN"]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings size={22} className="text-blue-600" />
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500">
          Manage your virtual operating system desktop appearance, sound, and account profile
        </p>
      </div>

      {/* Profile info card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {session.user.name?.charAt(0).toUpperCase() || "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{session.user.name}</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {session.user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{session.user.email}</p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400">
          <span>Role-Based Access: Verified</span>
        </div>
      </div>

      {/* Desktop & Terminal Customizations */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <DesktopSettingsApp />
      </div>
    </div>
  );
}
