"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  RotateCcw,
  Save,
  Code2,
  Terminal,
  Clock,
} from "lucide-react";
import { executeBashScriptInteractive, type InteractiveYield } from "@/lib/bash-interpreter";
import { useVFSStore } from "@/lib/stores/vfs-store";

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
  if (( current_time < arrival_times[i] )); then
    current_time=\${arrival_times[i]}
  fi

  current_time=\$((current_time + burst_times[i]))
  completion_times[i]=\$current_time
  tat=\$((completion_times[i] - arrival_times[i]))
  turn_around_times[i]=\$tat
  total_tat=\$((total_tat + tat))
  wt=\$((tat - burst_times[i]))
  waiting_times[i]=\$wt
  total_wt=\$((total_wt + wt))
  printf "P%-4d %-9d %-7d %-12d %-12d %-7d\n" \
    \$((i+1)) \${arrival_times[i]} \${burst_times[i]} \${completion_times[i]} \$tat \$wt
done

echo "------------------------------------------------------------"
echo "Average Turnaround Time: \$total_tat ms"
echo "Average Waiting Time   : \$total_wt ms"
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

echo "Simulation starting with Time Quantum = \$quantum ms"
echo "Gantt Chart timeline:"

while (( completed < n )); do
  for ((i=0; i<n; i++)); do
    if (( remaining[i] > 0 )); then
      if (( remaining[i] > quantum )); then
        current_time=\$((current_time + quantum))
        remaining[i]=\$((remaining[i] - quantum))
        echo "  [Time \$current_time ms] Process P\$((i+1)) ran \$quantum ms (Remaining: \${remaining[i]})"
      else
        current_time=\$((current_time + remaining[i]))
        echo "  [Time \$current_time ms] Process P\$((i+1)) FINISHED!"
        remaining[i]=0
        completed=\$((completed + 1))
      fi
    fi
  done
done

echo "All processes completed execution at \$current_time ms."
`,
  },
  bankers: {
    name: "Banker's Deadlock Avoidance",
    description: "Safety Algorithm for Deadlock Avoidance",
    code: `#!/bin/bash
# ============================================================
# Banker's Algorithm - Deadlock Avoidance Safety Check
# ============================================================

echo "Checking system state safety..."
echo "Available Resources: [A: 3, B: 3, C: 2]"
echo "Allocated Matrix: 5 processes x 3 resources"
echo "Computing safe sequence..."

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

echo "Buffer capacity: \$BUFFER_SIZE items"

produce() {
  item=\$1
  if (( \${#buffer[@]} >= BUFFER_SIZE )); then
    echo "[PRODUCER] Buffer FULL! Producer waiting..."
  else
    buffer+=("\$item")
    echo "[PRODUCER] Produced item '\$item'. Buffer count: \${#buffer[@]}"
  fi
}

consume() {
  if (( \${#buffer[@]} == 0 )); then
    echo "[CONSUMER] Buffer EMPTY! Consumer waiting..."
  else
    item=\${buffer[0]}
    buffer=("\${buffer[@]:1}")
    echo "[CONSUMER] Consumed item '\$item'. Buffer count: \${#buffer[@]}"
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

// Console line types
type ConsoleLine =
  | { kind: "output"; text: string }
  | { kind: "prompt"; text: string }
  | { kind: "userInput"; text: string }
  | { kind: "error"; text: string }
  | { kind: "info"; text: string };

// Execution phases
type Phase = "idle" | "waiting_input" | "executing" | "done";

export function BashStudioApp() {
  const { writeFile } = useVFSStore();
  const [selectedTemplate, setSelectedTemplate] = useState("fcfs");
  const [code, setCode] = useState(TEMPLATES.fcfs.code);
  const [customArgs, setCustomArgs] = useState("");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Execution state
  const [phase, setPhase] = useState<Phase>("idle");
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [execDuration, setExecDuration] = useState<number | null>(null);

  // Interactive input state
  const [currentTyping, setCurrentTyping] = useState("");

  // Generator ref — holds the running script generator between renders
  const genRef = useRef<Generator<InteractiveYield, void, string> | null>(null);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLines, phase]);

  // Focus input when waiting
  useEffect(() => {
    if (phase === "waiting_input") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [phase, currentReadIdx]);

  const resetConsole = () => {
    setConsoleLines([]);
    setExitCode(null);
    setExecDuration(null);
    setCurrentTyping("");
    genRef.current = null;
  };

  const handleTemplateChange = (key: string) => {
    setSelectedTemplate(key);
    if (TEMPLATES[key]) {
      setCode(TEMPLATES[key].code);
      resetConsole();
      setPhase("idle");
    }
  };

  /**
   * Advance the generator until it hits a `read` (needs user input) or finishes.
   * Pass `inputValue` when resuming after a read.
   */
  const advanceGenerator = (inputValue?: string) => {
    const gen = genRef.current;
    if (!gen) return;

    const newLines: ConsoleLine[] = [];

    let result = inputValue !== undefined ? gen.next(inputValue) : gen.next();

    while (!result.done) {
      const yld = result.value;

      if (yld.type === "output") {
        newLines.push({ kind: "output", text: yld.line });
        result = gen.next();
        continue;
      }

      if (yld.type === "stderr") {
        newLines.push({ kind: "error", text: yld.line });
        result = gen.next();
        continue;
      }

      if (yld.type === "read") {
        // Flush collected output first, then pause for input
        if (yld.prompt) newLines.push({ kind: "prompt", text: yld.prompt });
        setConsoleLines((prev) => [...prev, ...newLines]);
        setPhase("waiting_input");
        return;  // stop — wait for user to type
      }

      if (yld.type === "done") {
        newLines.push({ kind: "info", text: "-----------------------------------------" });
        newLines.push({ kind: "info", text: `Process exited with code ${yld.exitCode}  [${yld.durationMs}ms]` });
        setConsoleLines((prev) => [...prev, ...newLines]);
        setExitCode(yld.exitCode);
        setExecDuration(yld.durationMs);
        setPhase("done");
        return;
      }

      result = gen.next();
    }

    // Generator exhausted
    if (newLines.length) setConsoleLines((prev) => [...prev, ...newLines]);
    setPhase("done");
  };

  const handleRunScript = () => {
    resetConsole();
    setPhase("executing");

    // Create generator and store in ref
    genRef.current = executeBashScriptInteractive(code, customArgs);

    setConsoleLines([
      { kind: "info", text: "ShellSpace Linux  -  script.sh" },
      { kind: "info", text: "-----------------------------------------" },
    ]);

    // Start advancing after short delay for UI to paint
    setTimeout(() => advanceGenerator(), 100);
  };

  const handleConsoleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const value = currentTyping;
    setCurrentTyping("");
    setPhase("executing");

    // Echo what user typed in console
    setConsoleLines((prev) => [...prev, { kind: "userInput", text: value }]);

    // Resume generator with user's input
    setTimeout(() => advanceGenerator(value), 50);
  };

  const handleSaveToWorkspace = () => {
    const res = writeFile("script.sh", ["home", "student", "workspace"], code, false);
    setSaveNotice(res.success ? "Saved to ~/workspace/script.sh" : "Failed to save");
    setTimeout(() => setSaveNotice(null), 2500);
  };

  const renderLine = (line: ConsoleLine, i: number) => {
    switch (line.kind) {
      case "output":
        return <div key={i} className="text-emerald-300 leading-snug whitespace-pre-wrap">{line.text || "\u00a0"}</div>;
      case "prompt":
        return (
          <div key={i} className="text-amber-300 font-semibold leading-snug flex items-start gap-1 mt-0.5">
            <span className="text-amber-500 mt-px shrink-0">?</span>
            <span>{line.text}</span>
          </div>
        );
      case "userInput":
        return (
          <div key={i} className="text-sky-300 leading-snug flex items-center gap-1">
            <span className="text-sky-500 select-none shrink-0">›</span>
            <span>{line.text || <span className="text-slate-600 italic">(empty)</span>}</span>
          </div>
        );
      case "error":
        return <div key={i} className="text-rose-400 leading-snug">{line.text}</div>;
      case "info":
        return <div key={i} className="text-slate-500 leading-snug">{line.text}</div>;
    }
  };

  const isRunning = phase === "executing" || phase === "waiting_input";

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Top Toolbar */}
      <div className="h-12 px-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium text-slate-700">Algorithm:</span>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="text-xs bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="fcfs">FCFS Scheduling</option>
              <option value="round_robin">Round Robin (RR)</option>
              <option value="bankers">Banker&apos;s Algorithm</option>
              <option value="producer_consumer">Producer-Consumer IPC</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200" />

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

        <div className="flex items-center gap-2">
          {saveNotice && (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {saveNotice}
            </span>
          )}

          <button
            onClick={handleSaveToWorkspace}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
            title="Save script to ~/workspace/script.sh"
          >
            <Save size={13} className="text-blue-600" />
            <span>Save to Workspace</span>
          </button>

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
            {phase === "waiting_input" ? "Waiting for input..." : isRunning ? "Executing..." : "Run Script"}
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
        <div className="w-full md:w-[45%] flex flex-col bg-[#0d1117] overflow-hidden">
          {/* Console Header */}
          <div className="h-8 px-3 bg-[#010409] border-b border-slate-800 flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
              <Terminal size={13} className="text-emerald-400" />
              <span>Execution Console</span>
              {phase === "waiting_input" && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  INPUT
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {exitCode !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                  exitCode === 0
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}>
                  Exit: {exitCode}
                </span>
              )}
              {execDuration != null && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock size={10} />
                  {execDuration}ms
                </span>
              )}
              <button
                onClick={() => { resetConsole(); setPhase("idle"); }}
                title="Clear console"
                className="text-slate-500 hover:text-white transition-colors"
              >
                <RotateCcw size={11} />
              </button>
            </div>
          </div>

          {/* Console Body */}
          <div
            className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed"
            onClick={() => { if (phase === "waiting_input") inputRef.current?.focus(); }}
          >
            {consoleLines.length === 0 && phase === "idle" ? (
              <div className="text-slate-600 italic text-xs">
                Click &quot;Run Script&quot; to execute.{" "}
                <span className="text-amber-500/80">If your script uses <code className="font-bold">read</code>, you will be prompted here interactively — just like a real terminal.</span>
              </div>
            ) : (
              <>
                {consoleLines.map((line, i) => renderLine(line, i))}

                {/* Inline interactive input */}
                {phase === "waiting_input" && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-sky-500 select-none shrink-0">›</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentTyping}
                      onChange={(e) => setCurrentTyping(e.target.value)}
                      onKeyDown={handleConsoleSubmit}
                      autoFocus
                      spellCheck={false}
                      className="flex-1 bg-transparent border-none outline-none text-sky-300 font-mono text-xs caret-sky-400 placeholder:text-slate-700"
                      placeholder="type here and press Enter..."
                    />
                    <span className="animate-pulse text-sky-400 select-none ml-0.5">█</span>
                  </div>
                )}
              </>
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
