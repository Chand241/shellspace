"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDesktopStore } from "@/lib/stores/desktop-store";
import type { WindowInstance } from "@/types/desktop";
import {
  Minus,
  Square,
  X,
  Copy,
  Terminal,
  Code2,
  FolderOpen,
  FileText,
  BookOpen,
  Activity,
  Cpu,
  Settings,
  Calculator,
  HelpCircle,
} from "lucide-react";

interface WindowProps {
  window: WindowInstance;
  children: React.ReactNode;
}

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

export function DesktopWindow({ window: win, children }: WindowProps) {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    activeWindowId,
  } = useDesktopStore();

  const isFocused = activeWindowId === win.id;

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number }>({
    mouseX: 0,
    mouseY: 0,
    winX: win.position.x,
    winY: win.position.y,
  });

  // Resizing state
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
  }>({
    mouseX: 0,
    mouseY: 0,
    width: win.size.width,
    height: win.size.height,
  });

  // Drag handle
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    if ((e.target as HTMLElement).closest("button")) return;

    focusWindow(win.id);
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.position.x,
      winY: win.position.y,
    };
  };

  // Resize handle
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    focusWindow(win.id);
    isResizingRef.current = true;
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: win.size.width,
      height: win.size.height,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingRef.current && !win.isMaximized) {
        const deltaX = e.clientX - dragStartRef.current.mouseX;
        const deltaY = e.clientY - dragStartRef.current.mouseY;
        const newX = Math.max(0, Math.min(window.innerWidth - 100, dragStartRef.current.winX + deltaX));
        const newY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.winY + deltaY));
        updateWindowPosition(win.id, { x: newX, y: newY });
      }

      if (isResizingRef.current && !win.isMaximized) {
        const deltaX = e.clientX - resizeStartRef.current.mouseX;
        const deltaY = e.clientY - resizeStartRef.current.mouseY;
        const newW = Math.max(320, resizeStartRef.current.width + deltaX);
        const newH = Math.max(200, resizeStartRef.current.height + deltaY);
        updateWindowSize(win.id, { width: newW, height: newH });
      }
    },
    [win.id, win.isMaximized, updateWindowPosition, updateWindowSize]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (win.isMinimized) return null;

  const IconComponent = APP_ICONS[win.appId] || Terminal;

  return (
    <div
      id={`window-${win.id}`}
      onMouseDown={() => focusWindow(win.id)}
      style={{
        position: "absolute",
        left: win.isMaximized ? 0 : `${win.position.x}px`,
        top: win.isMaximized ? 0 : `${win.position.y}px`,
        width: win.isMaximized ? "100%" : `${win.size.width}px`,
        height: win.isMaximized ? "calc(100% - 48px)" : `${win.size.height}px`,
        zIndex: win.zIndex,
      }}
      className={`flex flex-col bg-white rounded-xl overflow-hidden select-none border transition-[box-shadow] duration-150 ${
        win.isMaximized ? "rounded-none border-none" : ""
      } ${
        isFocused
          ? "border-blue-300 shadow-[0_16px_40px_rgba(30,58,138,0.18)]"
          : "border-slate-200/80 shadow-[0_8px_20px_rgba(0,0,0,0.08)] opacity-95"
      }`}
    >
      {/* Titlebar */}
      <div
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={() => maximizeWindow(win.id)}
        className={`h-10 px-3 flex items-center justify-between border-b cursor-grab active:cursor-grabbing flex-shrink-0 transition-colors ${
          isFocused
            ? "bg-gradient-to-r from-slate-50 to-blue-50/40 border-slate-200"
            : "bg-slate-50/80 border-slate-200"
        }`}
      >
        {/* Title & App Icon */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
              isFocused ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            <IconComponent size={13} />
          </div>
          <span className="text-xs font-semibold text-slate-800 truncate tracking-tight">
            {win.title}
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {/* Minimize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(win.id);
            }}
            title="Minimize"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 transition-colors"
          >
            <Minus size={13} />
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              maximizeWindow(win.id);
            }}
            title={win.isMaximized ? "Restore Down" : "Maximize"}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 transition-colors"
          >
            {win.isMaximized ? <Copy size={11} /> : <Square size={11} />}
          </button>

          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            title="Close"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-rose-500 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-hidden relative bg-white flex flex-col">
        {children}
      </div>

      {/* Resize Handle (bottom-right) */}
      {!win.isMaximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center opacity-40 hover:opacity-100 z-20"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M7 1L1 7M7 4L4 7M7 7L7 7"
              stroke="#64748b"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
