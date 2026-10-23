"use client";

import React, { useState, useEffect } from "react";
import { useDesktopStore } from "@/lib/stores/desktop-store";
import {
  Monitor,
  Volume2,
  VolumeX,
  Wifi,
  ChevronUp,
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
  Home,
} from "lucide-react";
import Link from "next/link";

const APP_ICONS: Record<string, React.ElementType> = {
  terminal: Terminal,
  "bash-studio": Code2,
  "file-manager": FolderOpen,
  "text-editor": FileText,
  labs: BookOpen,
  assignments: FileText,
  "process-manager": Activity,
  "system-info": Cpu,
  settings: Settings,
  calculator: Calculator,
  help: HelpCircle,
};

interface TaskbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function DesktopTaskbar({ user }: TaskbarProps) {
  const {
    windows,
    activeWindowId,
    focusWindow,
    minimizeWindow,
    startMenuOpen,
    toggleStartMenu,
    soundEnabled,
    toggleSound,
  } = useDesktopStore();

  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setDateStr(
        now.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const openWindows = Object.values(windows);

  return (
    <footer className="h-12 bg-white/90 backdrop-blur-md border-t border-slate-200/90 px-3 flex items-center justify-between select-none z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {/* Left: Start Button & Open Windows */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {/* ShellSpace Start Button */}
        <button
          onClick={toggleStartMenu}
          className={`h-9 px-3 rounded-lg flex items-center gap-2 font-semibold text-xs transition-all ${
            startMenuOpen
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 hover:bg-slate-200/80 text-slate-800"
          }`}
        >
          <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center text-white">
            <Monitor size={11} />
          </div>
          <span>Start</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Running Windows Task items */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {openWindows.map((win) => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            const Icon = APP_ICONS[win.appId] || Terminal;

            return (
              <button
                key={win.id}
                onClick={() => {
                  if (isActive) {
                    minimizeWindow(win.id);
                  } else {
                    focusWindow(win.id);
                  }
                }}
                className={`h-9 max-w-[180px] px-2.5 rounded-lg flex items-center gap-2 text-xs transition-all truncate border ${
                  isActive
                    ? "bg-blue-50 border-blue-200 text-blue-900 font-semibold shadow-xs"
                    : win.isMinimized
                    ? "bg-slate-100/50 border-transparent text-slate-500 hover:bg-slate-100"
                    : "bg-slate-50 border-slate-200/70 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                    isActive ? "text-blue-600" : "text-slate-500"
                  }`}
                >
                  <Icon size={13} />
                </div>
                <span className="truncate">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: System Tray & Clock */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {/* Return to Landing Page */}
        <Link
          href="/"
          title="Return to Landing Page"
          className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
        >
          <Home size={14} />
        </Link>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? "Sound enabled" : "Muted"}
          className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>

        {/* Network indicator */}
        <div
          title="Virtual Network: Connected (1000 Mbps)"
          className="w-7 h-7 rounded flex items-center justify-center text-emerald-600 hover:bg-slate-100 transition-colors"
        >
          <Wifi size={14} />
        </div>

        {/* Clock */}
        <div className="px-2 py-1 rounded hover:bg-slate-100 text-right cursor-default transition-colors">
          <div className="text-xs font-semibold text-slate-800 leading-none">
            {timeStr || "12:00 PM"}
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            {dateStr || "Oct 23"}
          </div>
        </div>

        {/* User initials badge */}
        <div
          title={`${user.name} (${user.role})`}
          className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs"
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </footer>
  );
}
