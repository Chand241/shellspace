"use client";

import React, { useEffect, useState } from "react";
import { useDesktopStore } from "@/lib/stores/desktop-store";
import { DesktopWindow } from "@/components/desktop/window";
import { DesktopTaskbar } from "@/components/desktop/taskbar";
import { DesktopStartMenu } from "@/components/desktop/start-menu";
import { DesktopIcons } from "@/components/desktop/desktop-icons";
import { TerminalApp } from "@/components/desktop/apps/terminal-app";
import { BashStudioApp } from "@/components/desktop/apps/bash-studio-app";
import { ProcessManagerApp } from "@/components/desktop/apps/process-manager-app";
import { OSLabsApp } from "@/components/desktop/apps/os-labs-app";
import { SystemInfoApp } from "@/components/desktop/apps/system-info-app";
import { FileManagerApp } from "@/components/desktop/apps/file-manager-app";
import { DesktopSettingsApp } from "@/components/desktop/apps/settings-app";
import type { WindowInstance } from "@/types/desktop";

const WALLPAPER_CLASSES: Record<string, string> = {
  "wallpaper-mesh": "bg-gradient-to-tr from-sky-100 via-blue-50 to-indigo-100",
  "wallpaper-slate": "bg-gradient-to-br from-slate-100 via-zinc-100 to-slate-200",
  "wallpaper-emerald": "bg-gradient-to-tr from-emerald-100 via-teal-50 to-cyan-100",
  "wallpaper-sunset": "bg-gradient-to-tr from-amber-100 via-orange-50 to-rose-100",
  "wallpaper-dark": "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950",
};

interface DesktopContainerProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function DesktopContainer({ user }: DesktopContainerProps) {
  const { windows, wallpaper, openWindow } = useDesktopStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Automatically open Terminal and OS Labs as welcome windows if nothing is open on first load
  useEffect(() => {
    if (Object.keys(windows).length === 0) {
      openWindow("terminal");
    }
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    // Only trigger if clicking on wallpaper background
    if ((e.target as HTMLElement).closest(".window-element, button, input")) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const renderAppContent = (win: WindowInstance) => {
    switch (win.appId) {
      case "terminal":
        return <TerminalApp />;
      case "bash-studio":
        return <BashStudioApp />;
      case "process-manager":
        return <ProcessManagerApp />;
      case "labs":
        return <OSLabsApp />;
      case "system-info":
        return <SystemInfoApp />;
      case "file-manager":
        return <FileManagerApp />;
      case "settings":
        return <DesktopSettingsApp />;
      default:
        return (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-slate-500 text-xs">
            <p>Application {win.appId} is ready for execution.</p>
          </div>
        );
    }
  };

  const bgClass = WALLPAPER_CLASSES[wallpaper] || WALLPAPER_CLASSES["wallpaper-mesh"];

  return (
    <main
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenu(null)}
      className={`relative w-full h-screen overflow-hidden flex flex-col select-none transition-colors duration-300 ${bgClass}`}
    >
      {/* Desktop Workspace Area */}
      <div className="relative flex-1 w-full h-[calc(100vh-48px)] overflow-hidden">
        {/* Desktop Icons */}
        <DesktopIcons />

        {/* Windows Rendering */}
        {Object.values(windows).map((win) => (
          <DesktopWindow key={win.id} window={win}>
            {renderAppContent(win)}
          </DesktopWindow>
        ))}

        {/* Start Menu Popup */}
        <DesktopStartMenu user={user} />

        {/* Desktop Right Click Context Menu */}
        {contextMenu && (
          <div
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className="absolute z-50 w-48 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg py-1.5 text-xs text-slate-700"
          >
            <button
              onClick={() => {
                openWindow("terminal");
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              Open Terminal
            </button>
            <button
              onClick={() => {
                openWindow("bash-studio");
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              Open Bash Studio
            </button>
            <button
              onClick={() => {
                openWindow("labs");
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              OS Lab Simulations
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={() => {
                openWindow("settings");
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              Desktop Settings
            </button>
          </div>
        )}
      </div>

      {/* Fixed Taskbar at bottom */}
      <DesktopTaskbar user={user} />
    </main>
  );
}
