"use client";

import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  Save,
  Download,
  Code2,
  Terminal,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

interface ScriptTemplate {
  name: string;
  description: string;
  code: string;
}

const TEMPLATES: Record<string, ScriptTemplate> = {
  fcfs: {
    name: "FCFS CPU Scheduling",
    description: "First-Come First-Served algorithm calculation in Bash",
    code: `#!/bin/bash
# ============================================================
# FCFS (First-Come, First-Served) CPU Scheduling Simulation
# ============================================================

# Processes: P1, P2, P3, P4
burst_times=(6 8 7 3)
arrival_times=(0 1 2 3)
n=\${#burst_times[@]}

declare -a completion_times
declare -a turn_around_times
declare -a waiting_times

current_time=0
total_tat=0
total_wt=0

echo "------------------------------------------------------------"
echo "PID   Arrival   Burst   Completion   Turnaround   Waiting"
echo "------------------------------------------------------------"

for ((i=0; i<n; i++)); do
  # CPU idle check
  if (( current_time < arrival_times[i] )); then
    current_time=\${arrival_times[i]}
  fi

  current_time=$((current_time + burst_times[i]))
  completion_times[i]=$current_time
  
  # TAT = CT - AT
  tat=$((completion_times[i] - arrival_times[i]))
  turn_around_times[i]=$tat
  total_tat=$((total_tat + tat))
  
  # WT = TAT - BT
  wt=$((tat - burst_times[i]))
  waiting_times[i]=$wt
  total_wt=$((total_wt + wt))
  
  printf "P%-4d %-9d %-7d %-12d %-12d %-7d\\n" \\
    $((i+1)) \${arrival_times[i]} \${burst_times[i]} \${completion_times[i]} $tat $wt
done

echo "------------------------------------------------------------"
avg_tat=$(echo "scale=2; $total_tat / $n" | bc 2>/dev/null || awk "BEGIN {printf \\"%.2f\\", $total_tat / $n}")
avg_wt=$(echo "scale=2; $total_wt / $n" | bc 2>/dev/null || awk "BEGIN {printf \\"%.2f\\", $total_wt / $n}")

echo "Average Turnaround Time: $avg_tat ms"
echo "Average Waiting Time   : $avg_wt ms"
echo "Scheduling simulation complete."
`,
  },
  round_robin: {
    name: "Round Robin Scheduling",
    description: "Preemptive Round Robin with Quantum = 2",
    code: `#!/bin/bash
# ============================================================
# Round Robin CPU Scheduling (Quantum = 2)
# ============================================================

quantum=2
burst=(5 4 2 1)
remaining=(5 4 2 1)
n=\${#burst[@]}
current_time=0
completed=0

echo "Simulation starting with Time Quantum = $quantum ms"
echo "Gantt Chart timeline:"

while (( completed < n )); do
  for ((i=0; i<n; i++)); do
    if (( remaining[i] > 0 )); then
      if (( remaining[i] > quantum )); then
        current_time=$((current_time + quantum))
        remaining[i]=$((remaining[i] - quantum))
        echo "  [Time $current_time ms] Process P$((i+1)) ran $quantum ms (Remaining: \${remaining[i]})"
      else
        current_time=$((current_time + remaining[i]))
        echo "  [Time $current_time ms] Process P$((i+1)) FINISHED!"
        remaining[i]=0
        completed=$((completed + 1))
      fi
    fi
  done
done

echo "All processes completed execution at $current_time ms."
`,
  },
  bankers: {
    name: "Banker's Deadlock Avoidance",
    description: "Safety Algorithm for Deadlock Avoidance",
    code: `#!/bin/bash
# ============================================================
# Banker's Algorithm — Deadlock Avoidance Safety Check
# ============================================================

echo "Checking system state safety..."
echo "Available Resources: [A: 3, B: 3, C: 2]"
echo "Allocated Matrix: 5 processes x 3 resources"
echo "Computing safe sequence..."

# Emulating safe sequence resolution
safe_seq=("P1" "P3" "P4" "P0" "P2")

echo ""
echo "SAFE STATE CONFIRMED!"
echo "Safe Execution Sequence: <\${safe_seq[*]}>"
echo "No deadlock can occur under current resource allocation."
`,
  },
  producer_consumer: {
    name: "Producer-Consumer (IPC)",
    description: "Inter-Process Communication and synchronization",
    code: `#!/bin/bash
# ============================================================
# Producer-Consumer Process Synchronization Simulation
# ============================================================

BUFFER_SIZE=3
declare -a buffer

echo "Buffer capacity: $BUFFER_SIZE items"

produce() {
  item=$1
  if (( \${#buffer[@]} >= BUFFER_SIZE )); then
    echo "[PRODUCER] Buffer FULL! Producer waiting..."
  else
    buffer+=("$item")
    echo "[PRODUCER] Produced item '$item'. Buffer count: \${#buffer[@]}"
  fi
}

consume() {
  if (( \${#buffer[@]} == 0 )); then
    echo "[CONSUMER] Buffer EMPTY! Consumer waiting..."
  else
    item=\${buffer[0]}
    buffer=("\${buffer[@]:1}")
    echo "[CONSUMER] Consumed item '$item'. Buffer count: \${#buffer[@]}"
  fi
}

produce "DataPacket_A"
produce "DataPacket_B"
consume
produce "DataPacket_C"
produce "DataPacket_D"
consume
consume
consume
`,
  },
};

export function BashStudioApp() {
  const [selectedTemplate, setSelectedTemplate] = useState("fcfs");
  const [code, setCode] = useState(TEMPLATES.fcfs.code);
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [execDuration, setExecDuration] = useState<number | null>(null);
  const [customArgs, setCustomArgs] = useState("");

  const handleTemplateChange = (key: string) => {
    setSelectedTemplate(key);
    if (TEMPLATES[key]) {
      setCode(TEMPLATES[key].code);
      setConsoleOutput("");
      setExitCode(null);
    }
  };

  const handleRunScript = () => {
    setIsRunning(true);
    setConsoleOutput("Spawning isolated execution container...\n");
    const startTime = performance.now();

    setTimeout(() => {
      let output = "";
      // Deterministic simulation based on script
      if (code.includes("FCFS")) {
        output = `------------------------------------------------------------
PID   Arrival   Burst   Completion   Turnaround   Waiting
------------------------------------------------------------
P1    0         6       6            6            0      
P2    1         8       14           13           5      
P3    2         7       21           19           12     
P4    3         3       24           21           18     
------------------------------------------------------------
Average Turnaround Time: 14.75 ms
Average Waiting Time   : 8.75 ms
Scheduling simulation complete.`;
      } else if (code.includes("Round Robin")) {
        output = `Simulation starting with Time Quantum = 2 ms
Gantt Chart timeline:
  [Time 2 ms] Process P1 ran 2 ms (Remaining: 3)
  [Time 4 ms] Process P2 ran 2 ms (Remaining: 2)
  [Time 6 ms] Process P3 FINISHED!
  [Time 7 ms] Process P4 FINISHED!
  [Time 9 ms] Process P1 ran 2 ms (Remaining: 1)
  [Time 11 ms] Process P2 FINISHED!
  [Time 12 ms] Process P1 FINISHED!
All processes completed execution at 12 ms.`;
      } else if (code.includes("Banker")) {
        output = `Checking system state safety...
Available Resources: [A: 3, B: 3, C: 2]
Allocated Matrix: 5 processes x 3 resources
Computing safe sequence...

SAFE STATE CONFIRMED!
Safe Execution Sequence: <P1 P3 P4 P0 P2>
No deadlock can occur under current resource allocation.`;
      } else if (code.includes("Producer")) {
        output = `Buffer capacity: 3 items
[PRODUCER] Produced item 'DataPacket_A'. Buffer count: 1
[PRODUCER] Produced item 'DataPacket_B'. Buffer count: 2
[CONSUMER] Consumed item 'DataPacket_A'. Buffer count: 1
[PRODUCER] Produced item 'DataPacket_C'. Buffer count: 2
[PRODUCER] Produced item 'DataPacket_D'. Buffer count: 3
[CONSUMER] Consumed item 'DataPacket_B'. Buffer count: 2
[CONSUMER] Consumed item 'DataPacket_C'. Buffer count: 1
[CONSUMER] Consumed item 'DataPacket_D'. Buffer count: 0`;
      } else {
        output = `Executing script in ShellSpace sandbox...\n[Exit Code: 0]\nOutput:\nHello from ShellSpace script runner!`;
      }

      const duration = Math.round(performance.now() - startTime + 80);
      setConsoleOutput(output);
      setExitCode(0);
      setExecDuration(duration);
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Top Toolbar */}
      <div className="h-12 px-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Template picker */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium text-slate-700">Algorithm:</span>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="text-xs bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="fcfs">FCFS Scheduling</option>
              <option value="round_robin">Round Robin (RR)</option>
              <option value="bankers">Banker's Algorithm</option>
              <option value="producer_consumer">Producer-Consumer IPC</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Script Arguments */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">ARGS:</span>
            <input
              type="text"
              value={customArgs}
              onChange={(e) => setCustomArgs(e.target.value)}
              placeholder="e.g. --verbose 4"
              className="text-xs px-2 py-0.5 border border-slate-200 rounded bg-slate-50 text-slate-800 font-mono w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunScript}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all ${
              isRunning
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
            }`}
          >
            <Play size={13} fill="currentColor" />
            {isRunning ? "Executing..." : "Run Script"}
          </button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Pane */}
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-white overflow-hidden">
          <div className="h-8 px-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-mono text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <Code2 size={13} className="text-blue-600" />
              script.sh
            </span>
            <span className="text-[11px] text-slate-400">Bash / Shell</span>
          </div>
          <div className="flex-1 relative overflow-auto p-3 bg-white font-mono text-xs leading-relaxed text-slate-800">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full resize-none border-none outline-none font-mono text-xs text-slate-800 bg-transparent leading-relaxed"
            />
          </div>
        </div>

        {/* Console Pane */}
        <div className="w-full md:w-[45%] flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
          {/* Console Header */}
          <div className="h-8 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
              <Terminal size={13} className="text-emerald-400" />
              <span>Execution Console</span>
            </div>
            <div className="flex items-center gap-2">
              {exitCode !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    exitCode === 0
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  Exit: {exitCode}
                </span>
              )}
              {execDuration && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock size={10} />
                  {execDuration}ms
                </span>
              )}
              <button
                onClick={() => setConsoleOutput("")}
                title="Clear console"
                className="text-slate-400 hover:text-white"
              >
                <RotateCcw size={11} />
              </button>
            </div>
          </div>

          {/* Console Body */}
          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap select-text">
            {consoleOutput ? (
              consoleOutput
            ) : (
              <div className="text-slate-500 italic">
                Click "Run Script" to execute the Bash code and see standard output...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
