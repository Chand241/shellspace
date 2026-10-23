"use client";

import React, { useState } from "react";
import { useDesktopStore } from "@/lib/stores/desktop-store";
import type { AppId } from "@/types/desktop";
import { signOut } from "next-auth/react";
import {
  Terminal,
  Code2,
  FolderOpen,
  FileText,
  Activity,
  Cpu,
  Settings,
  BookOpen,
  Calculator,
  HelpCircle,
  Search,
  LogOut,
  User,
  ExternalLink,
} from "lucide-react";

interface StartMenuItem {
  appId: AppId;
  title: string;
  category: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}

const MENU_APPS: StartMenuItem[] = [
  {
    appId: "terminal",
    title: "Linux Terminal",
    category: "System",
    icon: Terminal,
    description: "Interactive virtual bash shell with file system",
    badge: "CLI",
  },
  {
    appId: "bash-studio",
    title: "Bash Studio & IDE",
    category: "Development",
    icon: Code2,
    description: "Script editor and OS algorithm simulations",
    badge: "IDE",
  },
  {
    appId: "process-manager",
    title: "Task Manager",
    category: "System",
    icon: Activity,
    description: "Inspect process states, CPU %, and memory",
  },
  {
    appId: "system-info",
    title: "System Specs",
    category: "System",
    icon: Cpu,
    description: "Kernel, CPU cores, memory architecture",
  },
  {
    appId: "labs",
    title: "OS Lab Platform",
    category: "Education",
    icon: BookOpen,
    description: "CPU scheduling, deadlock, and memory labs",
  },
  {
    appId: "file-manager",
    title: "File Explorer",
    category: "Files",
    icon: FolderOpen,
    description: "Browse virtual home workspace files",
  },
  {
    appId: "text-editor",
    title: "Text Editor",
    category: "Accessories",
    icon: FileText,
    description: "Create and edit scripts and notes",
  },
  {
    appId: "calculator",
    title: "OS Calc",
    category: "Utilities",
    icon: Calculator,
    description: "Binary, Hex, Base conversion and calculator",
  },
  {
    appId: "settings",
    title: "Desktop Settings",
    category: "Preferences",
    icon: Settings,
    description: "Wallpapers, themes, and sound toggles",
  },
  {
    appId: "help",
    title: "Cheat Sheet & Docs",
    category: "Documentation",
    icon: HelpCircle,
    description: "Linux bash commands and OS exam guide",
  },
];

interface StartMenuProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function DesktopStartMenu({ user }: StartMenuProps) {
  const { startMenuOpen, setStartMenuOpen, openWindow } = useDesktopStore();
  const [searchTerm, setSearchTerm] = useState("");

  if (!startMenuOpen) return null;

  const filteredApps = MENU_APPS.filter(
    (app) =>
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLaunch = (appId: AppId) => {
    openWindow(appId);
    setStartMenuOpen(false);
  };

  return (
    <>
      {/* Backdrop click dismiss */}
      <div
        onClick={() => setStartMenuOpen(false)}
        className="fixed inset-0 z-40 bg-transparent"
      />

      <div className="absolute bottom-14 left-3 w-[460px] max-h-[580px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
        {/* Search header */}
        <div className="p-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200/70 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search apps, tools, algorithms..."
              autoFocus
              className="w-full text-xs bg-transparent border-none outline-none text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Pinned apps list */}
        <div className="flex-1 overflow-y-auto p-3 max-h-[400px]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
            {searchTerm ? "Search Results" : "ShellSpace Laboratory Applications"}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {filteredApps.map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.appId}
                  onClick={() => handleLaunch(app.appId)}
                  className="flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-100/90 active:scale-98 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {app.title}
                      </span>
                      {app.badge && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-700 font-bold uppercase">
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {app.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching applications found.
            </div>
          )}
        </div>

        {/* User profile footer */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500">{user.role} Account</div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out of ShellSpace"
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
