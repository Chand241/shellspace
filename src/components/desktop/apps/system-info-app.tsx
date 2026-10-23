"use client";

import React from "react";
import { Cpu, HardDrive, Shield, Server, Terminal, CheckCircle2 } from "lucide-react";

export function SystemInfoApp() {
  return (
    <div className="flex-1 p-6 bg-slate-50 font-sans overflow-y-auto">
      {/* OS Banner */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <Terminal size={28} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            ShellSpace Educational Linux Environment
          </h2>
          <p className="text-xs text-slate-500">
            Release 2026.1 LTS (Kernel 6.8.0-shellspace-generic x86_64)
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 size={11} />
              Sandbox Isolated & Secure
            </span>
          </div>
        </div>
      </div>

      {/* Hardware / Architecture Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Processor */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-3">
            <Cpu size={16} className="text-blue-600" />
            <span>Virtual CPU Architecture</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Architecture</span>
              <span className="font-mono font-medium text-slate-800">x86_64 (64-bit)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">vCPU Cores</span>
              <span className="font-mono font-medium text-slate-800">4 Cores @ 2.80GHz</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">L1/L2/L3 Cache</span>
              <span className="font-mono font-medium text-slate-800">256KB / 2MB / 16MB</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Scheduler</span>
              <span className="font-mono font-medium text-slate-800">CFS (Completely Fair)</span>
            </div>
          </div>
        </div>

        {/* Memory & Storage */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-3">
            <HardDrive size={16} className="text-emerald-600" />
            <span>Memory & File System</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">RAM Allocated</span>
              <span className="font-mono font-medium text-slate-800">4,096 MB DDR5</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Swap Memory</span>
              <span className="font-mono font-medium text-slate-800">2,048 MB (ZRAM)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Root File System</span>
              <span className="font-mono font-medium text-slate-800">ext4 (Journaled)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Page Size</span>
              <span className="font-mono font-medium text-slate-800">4,096 bytes (4 KB)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
