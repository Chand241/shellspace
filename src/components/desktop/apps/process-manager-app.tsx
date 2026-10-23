"use client";

import React, { useState } from "react";
import {
  Activity,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  AlertOctagon,
  Cpu,
  Layers,
} from "lucide-react";

interface ProcessItem {
  pid: number;
  ppid: number;
  name: string;
  user: string;
  state: "RUNNING" | "SLEEPING" | "ZOMBIE" | "STOPPED";
  cpu: number;
  memoryMb: number;
  priority: number;
}

const INITIAL_PROCESSES: ProcessItem[] = [
  { pid: 1, ppid: 0, name: "systemd (init)", user: "root", state: "SLEEPING", cpu: 0.1, memoryMb: 12.4, priority: 20 },
  { pid: 2, ppid: 0, name: "kthreadd", user: "root", state: "SLEEPING", cpu: 0.0, memoryMb: 0.0, priority: 0 },
  { pid: 104, ppid: 1, name: "shellspace-kernel-broker", user: "student", state: "RUNNING", cpu: 1.4, memoryMb: 48.2, priority: 20 },
  { pid: 112, ppid: 104, name: "bash (pts/0)", user: "student", state: "SLEEPING", cpu: 0.0, memoryMb: 8.6, priority: 20 },
  { pid: 156, ppid: 112, name: "cpu_scheduler_sim", user: "student", state: "RUNNING", cpu: 12.8, memoryMb: 24.1, priority: 15 },
  { pid: 180, ppid: 112, name: "ipc_producer_daemon", user: "student", state: "SLEEPING", cpu: 0.3, memoryMb: 14.8, priority: 20 },
  { pid: 210, ppid: 1, name: "zombie_child_proc", user: "student", state: "ZOMBIE", cpu: 0.0, memoryMb: 0.0, priority: 20 },
];

export function ProcessManagerApp() {
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);
  const [filter, setFilter] = useState("");
  const [selectedPid, setSelectedPid] = useState<number | null>(null);

  const filtered = processes.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase()) || String(p.pid).includes(filter)
  );

  const totalCpu = filtered.reduce((acc, p) => acc + p.cpu, 0).toFixed(1);
  const totalMem = filtered.reduce((acc, p) => acc + p.memoryMb, 0).toFixed(1);

  const handleKill = (pid: number) => {
    if (pid === 1) {
      alert("Cannot kill init process (PID 1) — kernel protection fault!");
      return;
    }
    setProcesses((prev) => prev.filter((p) => p.pid !== pid));
    if (selectedPid === pid) setSelectedPid(null);
  };

  const handleSpawn = () => {
    const nextPid = Math.max(...processes.map((p) => p.pid)) + Math.floor(Math.random() * 5 + 1);
    const newProc: ProcessItem = {
      pid: nextPid,
      ppid: 104,
      name: `worker_fork_${nextPid}.sh`,
      user: "student",
      state: "RUNNING",
      cpu: parseFloat((Math.random() * 8 + 1).toFixed(1)),
      memoryMb: parseFloat((Math.random() * 30 + 10).toFixed(1)),
      priority: 20,
    };
    setProcesses((prev) => [...prev, newProc]);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 font-sans overflow-hidden">
      {/* Metrics Banner */}
      <div className="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-blue-600" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Total CPU</div>
              <div className="text-xs font-bold text-slate-800">{totalCpu}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-emerald-600" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">RAM Allocated</div>
              <div className="text-xs font-bold text-slate-800">{totalMem} MB</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-violet-600" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Active Threads</div>
              <div className="text-xs font-bold text-slate-800">{processes.length} Processes</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpawn}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Plus size={13} />
            fork() Process
          </button>
          {selectedPid && (
            <button
              onClick={() => handleKill(selectedPid)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <Trash2 size={13} />
              kill -9 {selectedPid}
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="h-10 px-4 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 w-72">
          <Search size={13} className="text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter processes by name or PID..."
            className="w-full text-xs bg-transparent border-none outline-none text-slate-800 placeholder-slate-400"
          />
        </div>
        <span className="text-[11px] text-slate-500">
          Click any row to select PID
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-sans font-medium text-[11px] select-none sticky top-0">
              <th className="py-2 px-3">PID</th>
              <th className="py-2 px-3">PPID</th>
              <th className="py-2 px-3 font-semibold">NAME</th>
              <th className="py-2 px-3">USER</th>
              <th className="py-2 px-3">STATE</th>
              <th className="py-2 px-3 text-right">CPU %</th>
              <th className="py-2 px-3 text-right">MEM</th>
              <th className="py-2 px-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((proc) => {
              const isSelected = selectedPid === proc.pid;
              return (
                <tr
                  key={proc.pid}
                  onClick={() => setSelectedPid(proc.pid)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50/80" : "hover:bg-slate-50"
                  }`}
                >
                  <td className="py-2 px-3 font-semibold text-slate-900">{proc.pid}</td>
                  <td className="py-2 px-3 text-slate-500">{proc.ppid}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{proc.name}</td>
                  <td className="py-2 px-3 text-slate-600">{proc.user}</td>
                  <td className="py-2 px-3 font-sans">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        proc.state === "RUNNING"
                          ? "bg-emerald-100 text-emerald-800"
                          : proc.state === "SLEEPING"
                          ? "bg-blue-100 text-blue-800"
                          : proc.state === "ZOMBIE"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {proc.state}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700">{proc.cpu}%</td>
                  <td className="py-2 px-3 text-right text-slate-700">{proc.memoryMb} MB</td>
                  <td className="py-2 px-3 text-center">
                    {proc.pid !== 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleKill(proc.pid);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Kill process"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
