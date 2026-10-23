"use client";

import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  Plus,
  Trash2,
  BarChart3,
  BookOpen,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";

interface ProcessInput {
  id: string;
  name: string;
  arrival: number;
  burst: number;
  priority?: number;
}

interface ProcessResult {
  id: string;
  name: string;
  arrival: number;
  burst: number;
  completion: number;
  turnaround: number;
  waiting: number;
  color: string;
}

interface GanttSegment {
  processName: string;
  startTime: number;
  endTime: number;
  color: string;
}

const PROCESS_COLORS = [
  "bg-blue-500 text-white",
  "bg-emerald-500 text-white",
  "bg-violet-500 text-white",
  "bg-amber-500 text-white",
  "bg-rose-500 text-white",
  "bg-cyan-500 text-white",
];

const INITIAL_PROCESSES: ProcessInput[] = [
  { id: "1", name: "P1", arrival: 0, burst: 5, priority: 2 },
  { id: "2", name: "P2", arrival: 1, burst: 3, priority: 1 },
  { id: "3", name: "P3", arrival: 2, burst: 8, priority: 3 },
  { id: "4", name: "P4", arrival: 3, burst: 4, priority: 2 },
];

export function OSLabsApp() {
  const [algorithm, setAlgorithm] = useState<"FCFS" | "SJF" | "RR" | "Priority">("FCFS");
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [processes, setProcesses] = useState<ProcessInput[]>(INITIAL_PROCESSES);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [gantt, setGantt] = useState<GanttSegment[]>([]);
  const [hasSimulated, setHasSimulated] = useState<boolean>(false);

  const handleAddProcess = () => {
    const nextIdx = processes.length + 1;
    setProcesses((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: `P${nextIdx}`,
        arrival: Math.max(...prev.map((p) => p.arrival), 0) + 1,
        burst: Math.floor(Math.random() * 6) + 2,
        priority: Math.floor(Math.random() * 3) + 1,
      },
    ]);
  };

  const handleRemoveProcess = (id: string) => {
    if (processes.length <= 1) return;
    setProcesses((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRunSimulation = () => {
    let currentTime = 0;
    const ganttChart: GanttSegment[] = [];
    const computedResults: ProcessResult[] = [];

    if (algorithm === "FCFS") {
      // Sort by arrival
      const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);

      sorted.forEach((p, index) => {
        const start = Math.max(currentTime, p.arrival);
        const end = start + p.burst;
        const color = PROCESS_COLORS[index % PROCESS_COLORS.length];

        ganttChart.push({
          processName: p.name,
          startTime: start,
          endTime: end,
          color,
        });

        const ct = end;
        const tat = ct - p.arrival;
        const wt = tat - p.burst;

        computedResults.push({
          ...p,
          completion: ct,
          turnaround: tat,
          waiting: wt,
          color,
        });

        currentTime = end;
      });
    } else if (algorithm === "SJF") {
      // Non-preemptive Shortest Job First
      const pool = [...processes].map((p, idx) => ({
        ...p,
        color: PROCESS_COLORS[idx % PROCESS_COLORS.length],
      }));
      const completed: ProcessResult[] = [];

      while (pool.length > 0) {
        // Available processes that have arrived
        const available = pool.filter((p) => p.arrival <= currentTime);

        if (available.length === 0) {
          // Advance time to next arrival
          currentTime = Math.min(...pool.map((p) => p.arrival));
          continue;
        }

        // Pick shortest burst
        available.sort((a, b) => a.burst - b.burst);
        const nextProc = available[0];

        const start = currentTime;
        const end = start + nextProc.burst;
        currentTime = end;

        ganttChart.push({
          processName: nextProc.name,
          startTime: start,
          endTime: end,
          color: nextProc.color,
        });

        const ct = end;
        const tat = ct - nextProc.arrival;
        const wt = tat - nextProc.burst;

        completed.push({
          ...nextProc,
          completion: ct,
          turnaround: tat,
          waiting: wt,
        });

        const removeIdx = pool.findIndex((p) => p.id === nextProc.id);
        pool.splice(removeIdx, 1);
      }

      computedResults.push(...completed);
    } else if (algorithm === "RR") {
      // Round Robin
      const queue = [...processes].map((p, idx) => ({
        ...p,
        remaining: p.burst,
        color: PROCESS_COLORS[idx % PROCESS_COLORS.length],
      }));

      const completionMap: Record<string, number> = {};
      let cur = 0;
      let iterations = 0;

      while (queue.some((p) => p.remaining > 0) && iterations < 100) {
        iterations++;
        let worked = false;

        for (const p of queue) {
          if (p.remaining > 0 && p.arrival <= cur) {
            worked = true;
            const slice = Math.min(p.remaining, timeQuantum);
            ganttChart.push({
              processName: p.name,
              startTime: cur,
              endTime: cur + slice,
              color: p.color,
            });
            cur += slice;
            p.remaining -= slice;
            if (p.remaining === 0) {
              completionMap[p.id] = cur;
            }
          }
        }

        if (!worked) {
          cur++;
        }
      }

      processes.forEach((p, idx) => {
        const ct = completionMap[p.id] || cur;
        const tat = ct - p.arrival;
        const wt = tat - p.burst;
        computedResults.push({
          ...p,
          completion: ct,
          turnaround: tat,
          waiting: wt,
          color: PROCESS_COLORS[idx % PROCESS_COLORS.length],
        });
      });
    } else {
      // Priority (Lower number = Higher priority)
      const sorted = [...processes].sort((a, b) => (a.priority || 0) - (b.priority || 0));
      sorted.forEach((p, idx) => {
        const start = Math.max(currentTime, p.arrival);
        const end = start + p.burst;
        const color = PROCESS_COLORS[idx % PROCESS_COLORS.length];

        ganttChart.push({
          processName: p.name,
          startTime: start,
          endTime: end,
          color,
        });

        const ct = end;
        const tat = ct - p.arrival;
        const wt = tat - p.burst;

        computedResults.push({
          ...p,
          completion: ct,
          turnaround: tat,
          waiting: wt,
          color,
        });

        currentTime = end;
      });
    }

    setGantt(ganttChart);
    setResults(computedResults);
    setHasSimulated(true);
  };

  const avgTat =
    results.length > 0
      ? (results.reduce((acc, r) => acc + r.turnaround, 0) / results.length).toFixed(2)
      : "0";

  const avgWt =
    results.length > 0
      ? (results.reduce((acc, r) => acc + r.waiting, 0) / results.length).toFixed(2)
      : "0";

  return (
    <div className="flex-1 flex flex-col bg-slate-50 font-sans overflow-y-auto">
      {/* Header Toolbar */}
      <div className="h-12 px-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <span>Algorithm:</span>
            <select
              value={algorithm}
              onChange={(e) => {
                setAlgorithm(e.target.value as any);
                setHasSimulated(false);
              }}
              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="FCFS">FCFS (First-Come First-Served)</option>
              <option value="SJF">SJF (Shortest Job First)</option>
              <option value="RR">Round Robin (Preemptive)</option>
              <option value="Priority">Priority Scheduling</option>
            </select>
          </div>

          {algorithm === "RR" && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Time Quantum (q):</span>
              <input
                type="number"
                min={1}
                max={10}
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Number(e.target.value))}
                className="w-14 text-xs px-2 py-0.5 border border-slate-200 rounded bg-slate-50 text-slate-800 text-center font-bold"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddProcess}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Plus size={13} />
            Add Process
          </button>
          <button
            onClick={handleRunSimulation}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Play size={13} fill="currentColor" />
            Simulate Scheduling
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Input Process Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
            <span>Process Queue Inputs</span>
            <span className="text-[11px] text-slate-400 font-normal lowercase">
              edit values directly in the table
            </span>
          </div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold text-[11px]">
                <th className="py-2 px-4">Process</th>
                <th className="py-2 px-4">Arrival Time (ms)</th>
                <th className="py-2 px-4">Burst Time (ms)</th>
                {algorithm === "Priority" && <th className="py-2 px-4">Priority</th>}
                <th className="py-2 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processes.map((p, index) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="py-2 px-4 font-bold text-slate-800">{p.name}</td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      min={0}
                      value={p.arrival}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setProcesses((prev) =>
                          prev.map((item) => (item.id === p.id ? { ...item, arrival: val } : item))
                        );
                      }}
                      className="w-20 px-2 py-0.5 border border-slate-200 rounded text-xs font-mono"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      min={1}
                      value={p.burst}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setProcesses((prev) =>
                          prev.map((item) => (item.id === p.id ? { ...item, burst: val } : item))
                        );
                      }}
                      className="w-20 px-2 py-0.5 border border-slate-200 rounded text-xs font-mono"
                    />
                  </td>
                  {algorithm === "Priority" && (
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        min={1}
                        value={p.priority}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setProcesses((prev) =>
                            prev.map((item) => (item.id === p.id ? { ...item, priority: val } : item))
                          );
                        }}
                        className="w-20 px-2 py-0.5 border border-slate-200 rounded text-xs font-mono"
                      />
                    </td>
                  )}
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => handleRemoveProcess(p.id)}
                      disabled={processes.length <= 1}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual Gantt Chart */}
        {hasSimulated && gantt.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={15} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Visual Gantt Chart Timeline
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Total Execution Time: {gantt[gantt.length - 1]?.endTime} ms
              </span>
            </div>

            {/* Timeline Bars */}
            <div className="flex w-full h-10 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
              {gantt.map((seg, idx) => {
                const totalSpan = gantt[gantt.length - 1]?.endTime || 1;
                const duration = seg.endTime - seg.startTime;
                const widthPercent = (duration / totalSpan) * 100;

                return (
                  <div
                    key={idx}
                    style={{ width: `${widthPercent}%` }}
                    className={`${seg.color} h-full flex items-center justify-center font-bold text-xs border-r border-white/20 truncate px-1 transition-all hover:brightness-110`}
                    title={`${seg.processName} (${seg.startTime}ms → ${seg.endTime}ms)`}
                  >
                    {seg.processName}
                  </div>
                );
              })}
            </div>

            {/* Time labels below chart */}
            <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
              <span>0 ms</span>
              {gantt.map((seg, idx) => (
                <span key={idx}>{seg.endTime} ms</span>
              ))}
            </div>
          </div>
        )}

        {/* Simulation Output Metrics */}
        {hasSimulated && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Results Table */}
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Calculated Process Metrics
              </div>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2 px-3">PID</th>
                    <th className="py-2 px-3">AT</th>
                    <th className="py-2 px-3">BT</th>
                    <th className="py-2 px-3 font-semibold text-blue-700">CT</th>
                    <th className="py-2 px-3 font-semibold text-emerald-700">TAT</th>
                    <th className="py-2 px-3 font-semibold text-purple-700">WT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-bold text-slate-800">{r.name}</td>
                      <td className="py-2 px-3 font-mono">{r.arrival}</td>
                      <td className="py-2 px-3 font-mono">{r.burst}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{r.completion}</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">{r.turnaround}</td>
                      <td className="py-2 px-3 font-mono font-bold text-purple-700">{r.waiting}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Average Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  <Clock size={15} className="text-blue-600" />
                  <span>Performance Averages</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="text-[11px] text-emerald-700 font-medium">Average Turnaround Time</div>
                    <div className="text-xl font-bold text-emerald-900">{avgTat} ms</div>
                    <div className="text-[10px] text-emerald-600 mt-0.5">Formula: Σ(CT - AT) / N</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-[11px] text-purple-700 font-medium">Average Waiting Time</div>
                    <div className="text-xl font-bold text-purple-900">{avgWt} ms</div>
                    <div className="text-[10px] text-purple-600 mt-0.5">Formula: Σ(TAT - BT) / N</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
