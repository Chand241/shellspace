"use client";

import React from "react";
import { useDesktopStore } from "@/lib/stores/desktop-store";
import type { AppId } from "@/types/desktop";
import {
  Terminal,
  Code2,
  FolderOpen,
  BookOpen,
  Activity,
  Cpu,
  Settings,
  HelpCircle,
} from "lucide-react";

interface DesktopShortcut {
  appId: AppId;
  label: string;
  icon: React.ElementType;
  color: string;
}

const SHORTCUTS: DesktopShortcut[] = [
  {
    appId: "terminal",
    label: "Linux Terminal",
    icon: Terminal,
    color: "bg-slate-900 text-emerald-400 border border-slate-700",
  },
  {
    appId: "bash-studio",
    label: "Bash Studio",
    icon: Code2,
    color: "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm",
  },
  {
    appId: "file-manager",
    label: "File Explorer",
    icon: FolderOpen,
    color: "bg-amber-500 text-white shadow-sm",
  },
  {
    appId: "labs",
    label: "OS Lab",
    icon: BookOpen,
    color: "bg-emerald-600 text-white shadow-sm",
  },
  {
    appId: "process-manager",
    label: "Task Manager",
    icon: Activity,
    color: "bg-violet-600 text-white shadow-sm",
  },
  {
    appId: "system-info",
    label: "System Specs",
    icon: Cpu,
    color: "bg-cyan-600 text-white shadow-sm",
  },
  {
    appId: "settings",
    label: "Settings",
    icon: Settings,
    color: "bg-slate-700 text-white shadow-sm",
  },
];

export function DesktopIcons() {
  const { openWindow } = useDesktopStore();

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-3 select-none z-10">
      {SHORTCUTS.map((sc) => {
        const Icon = sc.icon;
        return (
          <button
            key={sc.appId}
            onDoubleClick={() => openWindow(sc.appId)}
            onClick={() => openWindow(sc.appId)}
            className="group flex flex-col items-center w-20 p-2 rounded-xl hover:bg-white/40 active:bg-white/60 backdrop-blur-xs transition-all focus:outline-none"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${sc.color}`}
            >
              <Icon size={22} />
            </div>
            <span className="mt-1 text-[11px] font-semibold text-slate-800 text-center tracking-tight leading-tight drop-shadow-xs truncate max-w-full">
              {sc.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
