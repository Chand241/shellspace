import { requireRole } from "@/lib/auth-helpers";
import { HelpCircle, Terminal, BookOpen, Cpu, ShieldCheck, ExternalLink, Code2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Learning Documentation",
};

const COMMANDS_REFERENCE = [
  { cmd: "ls -la", desc: "List all directory contents including hidden files with details" },
  { cmd: "pwd", desc: "Print current working directory" },
  { cmd: "mkdir -p path/to/dir", desc: "Create parent directories as needed without error" },
  { cmd: "cat /etc/os-release", desc: "Show Linux operating system release distribution information" },
  { cmd: "ps aux", desc: "Display running processes snapshot with PID, CPU%, MEM%" },
  { cmd: "grep -rn 'pattern' .", desc: "Search recursively for regex pattern in current directory" },
  { cmd: "chmod +x script.sh", desc: "Add executable permission to bash script" },
  { cmd: "bash script.sh", desc: "Execute bash script directly in bash interpreter" },
  { cmd: "top / htop", desc: "Real-time process activity and CPU/memory utilization monitor" },
  { cmd: "kill -9 <PID>", desc: "Force terminate process by process ID" },
];

const OS_CONCEPTS = [
  {
    topic: "Process Scheduling",
    summary: "Algorithms determining process execution order on CPU: FCFS, SJF, Priority, and Round Robin.",
  },
  {
    topic: "Deadlock Handling",
    summary: "Deadlock prevention and detection using Banker's Algorithm and Coffman conditions check.",
  },
  {
    topic: "Inter-Process Communication",
    summary: "Sharing data between threads and processes using Pipes, Shared Memory, and Semaphores (Producer-Consumer).",
  },
  {
    topic: "Virtual Memory & Paging",
    summary: "Translation of logical addresses to physical frames; page replacement algorithms like FIFO and LRU.",
  },
];

export default async function StudentHelpPage() {
  await requireRole(["STUDENT", "ADMIN"]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle size={22} className="text-blue-600" />
          Help Center & Linux Documentation
        </h1>
        <p className="text-xs text-slate-500">
          Essential Linux commands, Bash scripting handbook, and Operating System lab guidelines
        </p>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/student/terminal"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Terminal size={18} />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Linux Terminal</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Test live Linux command executions in the sandbox emulator.
          </p>
        </Link>

        <Link
          href="/student/bash-studio"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Code2 size={18} />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Bash IDE Studio</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Write and debug scheduling and synchronization scripts.
          </p>
        </Link>

        <Link
          href="/student/assignments"
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <BookOpen size={18} />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Lab Assignments</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            View pending tasks, write solutions, and check marks.
          </p>
        </Link>
      </div>

      {/* Linux Command Quick Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Linux Command Cheat-Sheet
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COMMANDS_REFERENCE.map((c, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
              <code className="text-blue-600 font-bold font-mono">{c.cmd}</code>
              <p className="text-slate-600 text-[11px] mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* OS Concepts */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-purple-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Operating System Concepts Covered
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OS_CONCEPTS.map((concept, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
              <h4 className="font-bold text-slate-800">{concept.topic}</h4>
              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{concept.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
