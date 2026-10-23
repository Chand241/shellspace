"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Terminal as TerminalIcon, Sparkles, RefreshCw } from "lucide-react";

interface FSNode {
  name: string;
  type: "file" | "dir";
  content?: string;
  size?: number;
  permissions?: string;
  owner?: string;
  group?: string;
  children?: Record<string, FSNode>;
}

// Initial virtual Linux filesystem
function createInitialFS(): FSNode {
  return {
    name: "/",
    type: "dir",
    children: {
      home: {
        name: "home",
        type: "dir",
        children: {
          student: {
            name: "student",
            type: "dir",
            children: {
              workspace: {
                name: "workspace",
                type: "dir",
                children: {
                  "welcome.sh": {
                    name: "welcome.sh",
                    type: "file",
                    permissions: "-rwxr-xr-x",
                    owner: "student",
                    group: "student",
                    size: 324,
                    content: `#!/usr/bin/env bash\n# Welcome to ShellSpace Linux Laboratory\necho "========================================"\necho " Welcome to ShellSpace Virtual Linux Lab! "\necho "========================================"\necho "System: Linux ShellSpace 6.8.0-shellspace x86_64"\necho "Student: $(whoami)"\necho "Date: $(date)"\necho "Ready for OS concepts and Bash practice."\n`,
                  },
                  "notes.txt": {
                    name: "notes.txt",
                    type: "file",
                    permissions: "-rw-r--r--",
                    owner: "student",
                    group: "student",
                    size: 412,
                    content: `Operating Systems Concepts Summary:\n1. Process Management: Process States (New, Ready, Running, Waiting, Terminated)\n2. CPU Scheduling: FCFS, SJF, SRTF, Priority, Round Robin\n3. Synchronization: Semaphores, Mutex, Deadlocks (Coffman conditions)\n4. Memory Management: Paging, Segmentation, Page Faults, LRU/FIFO\n5. File Systems: Inodes, Allocation methods (Contiguous, Linked, Indexed)\n`,
                  },
                  samples: {
                    name: "samples",
                    type: "dir",
                    children: {
                      "fibonacci.sh": {
                        name: "fibonacci.sh",
                        type: "file",
                        permissions: "-rwxr-xr-x",
                        owner: "student",
                        group: "student",
                        size: 260,
                        content: `#!/bin/bash\n# Fibonacci sequence in Bash\necho "First 8 Fibonacci numbers:"\na=0\nb=1\nfor ((i=0; i<8; i++)); do\n  echo -n "$a "\n  fn=$((a + b))\n  a=$b\n  b=$fn\ndone\necho ""\n`,
                      },
                      "process_fork.sh": {
                        name: "process_fork.sh",
                        type: "file",
                        permissions: "-rwxr-xr-x",
                        owner: "student",
                        group: "student",
                        size: 215,
                        content: `#!/bin/bash\necho "Parent PID: $$"\nsleep 1 & \nchild_pid=$!\necho "Spawned background child PID: $child_pid"\nwait $child_pid\necho "Child completed."\n`,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      etc: {
        name: "etc",
        type: "dir",
        children: {
          hostname: {
            name: "hostname",
            type: "file",
            permissions: "-rw-r--r--",
            size: 19,
            content: "shellspace-lab-node\n",
          },
          "os-release": {
            name: "os-release",
            type: "file",
            permissions: "-rw-r--r--",
            size: 130,
            content: `NAME="ShellSpace Linux"\nVERSION="2026.1 LTS"\nID=shellspace\nID_LIKE=debian\nPRETTY_NAME="ShellSpace Linux 2026.1 LTS (Educational Lab)"\n`,
          },
        },
      },
      bin: {
        name: "bin",
        type: "dir",
        children: {
          bash: { name: "bash", type: "file", permissions: "-rwxr-xr-x", size: 1245000 },
          sh: { name: "sh", type: "file", permissions: "-rwxr-xr-x", size: 145000 },
          ls: { name: "ls", type: "file", permissions: "-rwxr-xr-x", size: 142000 },
          cat: { name: "cat", type: "file", permissions: "-rwxr-xr-x", size: 45000 },
          echo: { name: "echo", type: "file", permissions: "-rwxr-xr-x", size: 38000 },
        },
      },
    },
  };
}

interface HistoryItem {
  id: string;
  command: string;
  output: React.ReactNode;
  cwd: string;
}

export function TerminalApp() {
  const [fs, setFs] = useState<FSNode>(createInitialFS);
  const [currentPath, setCurrentPath] = useState<string[]>([
    "home",
    "student",
    "workspace",
  ]);
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: "init",
      command: "",
      cwd: "~/workspace",
      output: (
        <div className="space-y-1 mb-2">
          <div className="text-emerald-600 font-semibold">
            ShellSpace Bash Laboratory — Interactive Virtual Shell v2026.1
          </div>
          <div className="text-slate-500 text-xs">
            Type <span className="text-blue-600 font-mono font-medium">help</span> to
            see available commands. Press <span className="text-blue-600 font-mono font-medium">Tab</span> for auto-completion.
          </div>
        </div>
      ),
    },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const resolvePathNode = useCallback(
    (pathArray: string[]): FSNode | null => {
      let current: FSNode = fs;
      for (const segment of pathArray) {
        if (!current.children || !current.children[segment]) {
          return null;
        }
        current = current.children[segment];
      }
      return current;
    },
    [fs]
  );

  const getPathString = (parts: string[]) => {
    if (
      parts.length >= 3 &&
      parts[0] === "home" &&
      parts[1] === "student" &&
      parts[2] === "workspace"
    ) {
      const rest = parts.slice(3).join("/");
      return rest ? `~/workspace/${rest}` : "~/workspace";
    }
    return "/" + parts.join("/");
  };

  const executeCommand = (fullCmd: string) => {
    const trimmed = fullCmd.trim();
    if (!trimmed) {
      setHistory((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          command: "",
          cwd: getPathString(currentPath),
          output: null,
        },
      ]);
      return;
    }

    setCmdHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const parts = trimmed.split(" ").filter(Boolean);
    const cmd = parts[0];
    const args = parts.slice(1);

    let outputNode: React.ReactNode = null;
    let newPath = [...currentPath];

    switch (cmd) {
      case "help":
        outputNode = (
          <div className="space-y-1.5 text-xs text-slate-700 py-1">
            <div className="font-semibold text-slate-900 border-b border-slate-200 pb-1">
              Available Linux Commands:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 font-mono">
              <div><span className="text-blue-600 font-medium">ls [-l, -a]</span>: list files</div>
              <div><span className="text-blue-600 font-medium">cd &lt;dir&gt;</span>: change directory</div>
              <div><span className="text-blue-600 font-medium">pwd</span>: print working dir</div>
              <div><span className="text-blue-600 font-medium">cat &lt;file&gt;</span>: print file content</div>
              <div><span className="text-blue-600 font-medium">echo &lt;text&gt;</span>: display text</div>
              <div><span className="text-blue-600 font-medium">touch &lt;file&gt;</span>: create file</div>
              <div><span className="text-blue-600 font-medium">mkdir &lt;dir&gt;</span>: make directory</div>
              <div><span className="text-blue-600 font-medium">rm [-r] &lt;path&gt;</span>: remove file/dir</div>
              <div><span className="text-blue-600 font-medium">bash &lt;file.sh&gt;</span>: run bash script</div>
              <div><span className="text-blue-600 font-medium">ps [aux]</span>: show processes</div>
              <div><span className="text-blue-600 font-medium">top</span>: monitor resources</div>
              <div><span className="text-blue-600 font-medium">whoami / id</span>: user identity</div>
              <div><span className="text-blue-600 font-medium">uname -a</span>: kernel info</div>
              <div><span className="text-blue-600 font-medium">date</span>: current date/time</div>
              <div><span className="text-blue-600 font-medium">clear</span>: clear screen</div>
              <div><span className="text-blue-600 font-medium">history</span>: command log</div>
            </div>
          </div>
        );
        break;

      case "clear":
        setHistory([]);
        return;

      case "pwd":
        outputNode = <div className="text-xs">{"/" + currentPath.join("/")}</div>;
        break;

      case "whoami":
        outputNode = <div className="text-xs text-slate-800">student</div>;
        break;

      case "id":
        outputNode = (
          <div className="text-xs font-mono text-slate-800">
            uid=1001(student) gid=1001(student) groups=1001(student),27(sudo),100(users)
          </div>
        );
        break;

      case "uname":
        if (args.includes("-a")) {
          outputNode = (
            <div className="text-xs font-mono text-slate-800">
              Linux shellspace-lab 6.8.0-shellspace-generic #42-SMP PREEMPT x86_64 GNU/Linux
            </div>
          );
        } else {
          outputNode = <div className="text-xs">Linux</div>;
        }
        break;

      case "date":
        outputNode = <div className="text-xs">{new Date().toUTCString()}</div>;
        break;

      case "history":
        outputNode = (
          <div className="text-xs font-mono space-y-0.5">
            {cmdHistory
              .slice()
              .reverse()
              .map((h, i) => (
                <div key={i} className="text-slate-600">
                  <span className="inline-block w-8 text-slate-400">{i + 1}</span>
                  {h}
                </div>
              ))}
          </div>
        );
        break;

      case "ls": {
        const targetNode = resolvePathNode(currentPath);
        if (!targetNode || targetNode.type !== "dir" || !targetNode.children) {
          outputNode = <div className="text-xs text-rose-500">ls: cannot access directory</div>;
        } else {
          const isLong = args.includes("-l") || args.includes("-la") || args.includes("-al");
          const items = Object.values(targetNode.children);

          if (isLong) {
            outputNode = (
              <div className="text-xs font-mono space-y-1">
                <div className="text-slate-400">total {items.length * 4}</div>
                {items.map((it) => (
                  <div key={it.name} className="flex gap-4">
                    <span className="text-slate-500 w-24">
                      {it.permissions || (it.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--")}
                    </span>
                    <span className="text-slate-500 w-16">student student</span>
                    <span className="text-slate-500 w-12 text-right">
                      {it.size || 4096}
                    </span>
                    <span className="text-slate-400">Oct 23 11:30</span>
                    <span
                      className={`font-semibold ${
                        it.type === "dir"
                          ? "text-blue-600"
                          : it.name.endsWith(".sh")
                          ? "text-emerald-600"
                          : "text-slate-800"
                      }`}
                    >
                      {it.name}{it.type === "dir" ? "/" : ""}
                    </span>
                  </div>
                ))}
              </div>
            );
          } else {
            outputNode = (
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-mono">
                {items.map((it) => (
                  <span
                    key={it.name}
                    className={`font-semibold ${
                      it.type === "dir"
                        ? "text-blue-600"
                        : it.name.endsWith(".sh")
                        ? "text-emerald-600"
                        : "text-slate-800"
                    }`}
                  >
                    {it.name}{it.type === "dir" ? "/" : ""}
                  </span>
                ))}
              </div>
            );
          }
        }
        break;
      }

      case "cd": {
        const target = args[0];
        if (!target || target === "~") {
          newPath = ["home", "student", "workspace"];
        } else if (target === "/") {
          newPath = [];
        } else if (target === "..") {
          if (newPath.length > 0) newPath.pop();
        } else {
          const testPath = target.startsWith("/")
            ? target.split("/").filter(Boolean)
            : [...newPath, ...target.split("/").filter(Boolean)];

          const node = resolvePathNode(testPath);
          if (node && node.type === "dir") {
            newPath = testPath;
          } else {
            outputNode = (
              <div className="text-xs text-rose-500">
                cd: {target}: No such file or directory
              </div>
            );
          }
        }
        setCurrentPath(newPath);
        break;
      }

      case "cat": {
        const file = args[0];
        if (!file) {
          outputNode = <div className="text-xs text-rose-500">cat: missing operand</div>;
        } else {
          const targetNode = resolvePathNode([...currentPath, file]);
          if (!targetNode) {
            outputNode = <div className="text-xs text-rose-500">cat: {file}: No such file</div>;
          } else if (targetNode.type === "dir") {
            outputNode = <div className="text-xs text-rose-500">cat: {file}: Is a directory</div>;
          } else {
            outputNode = (
              <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                {targetNode.content || ""}
              </pre>
            );
          }
        }
        break;
      }

      case "echo": {
        const text = args.join(" ").replace(/^["']|["']$/g, "");
        outputNode = <div className="text-xs font-mono">{text}</div>;
        break;
      }

      case "touch": {
        const fileName = args[0];
        if (!fileName) {
          outputNode = <div className="text-xs text-rose-500">touch: missing file operand</div>;
        } else {
          const parentNode = resolvePathNode(currentPath);
          if (parentNode && parentNode.children) {
            parentNode.children[fileName] = {
              name: fileName,
              type: "file",
              permissions: "-rw-r--r--",
              owner: "student",
              group: "student",
              size: 0,
              content: "",
            };
            setFs({ ...fs });
          }
        }
        break;
      }

      case "mkdir": {
        const dirName = args[0];
        if (!dirName) {
          outputNode = <div className="text-xs text-rose-500">mkdir: missing operand</div>;
        } else {
          const parentNode = resolvePathNode(currentPath);
          if (parentNode && parentNode.children) {
            parentNode.children[dirName] = {
              name: dirName,
              type: "dir",
              permissions: "drwxr-xr-x",
              children: {},
            };
            setFs({ ...fs });
          }
        }
        break;
      }

      case "ps":
        outputNode = (
          <div className="text-xs font-mono space-y-0.5">
            <div className="text-slate-400 font-semibold">PID  TTY          TIME CMD</div>
            <div> 101 pts/0    00:00:00 bash</div>
            <div> 142 pts/0    00:00:00 ps</div>
            <div> 204 ?        00:00:01 shellspace-daemon</div>
          </div>
        );
        break;

      case "top":
        outputNode = (
          <div className="text-xs font-mono space-y-1 border border-slate-200 rounded p-2 bg-slate-50">
            <div className="text-blue-700 font-semibold">
              top - 11:35:00 up 2:14, 1 user, load average: 0.08, 0.03, 0.01
            </div>
            <div className="text-slate-600">
              Tasks: 3 total, 1 running, 2 sleeping, 0 stopped, 0 zombie
            </div>
            <div className="text-slate-600">
              %Cpu(s): 1.8 us, 0.9 sy, 0.0 ni, 97.2 id, 0.1 wa
            </div>
            <div className="text-slate-600">
              MiB Mem : 4096.0 total, 2780.4 free, 942.1 used, 373.5 buff/cache
            </div>
            <div className="text-slate-700 font-semibold mt-2">
              PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
            </div>
            <div> 101 student   20   0   14.2m   4.8m   3.2m S   0.0   0.1   0:00.12 bash</div>
            <div> 204 student   20   0  128.5m  32.1m  16.4m S   1.2   0.8   0:01.40 shellspace-daemon</div>
          </div>
        );
        break;

      case "bash": {
        const scriptName = args[0];
        if (!scriptName) {
          outputNode = <div className="text-xs text-rose-500">bash: script name required</div>;
        } else {
          const fileNode = resolvePathNode([...currentPath, scriptName]);
          if (!fileNode || fileNode.type !== "file") {
            outputNode = (
              <div className="text-xs text-rose-500">bash: {scriptName}: No such file</div>
            );
          } else {
            // Emulate running script output
            if (scriptName === "welcome.sh") {
              outputNode = (
                <div className="text-xs font-mono space-y-0.5 text-emerald-800">
                  <div>========================================</div>
                  <div> Welcome to ShellSpace Virtual Linux Lab! </div>
                  <div>========================================</div>
                  <div>System: Linux ShellSpace 6.8.0-shellspace x86_64</div>
                  <div>Student: student</div>
                  <div>Date: {new Date().toUTCString()}</div>
                  <div>Ready for OS concepts and Bash practice.</div>
                </div>
              );
            } else if (scriptName === "fibonacci.sh") {
              outputNode = (
                <div className="text-xs font-mono text-slate-800">
                  <div>First 8 Fibonacci numbers:</div>
                  <div className="text-blue-600 font-bold">0 1 1 2 3 5 8 13</div>
                </div>
              );
            } else if (scriptName === "process_fork.sh") {
              outputNode = (
                <div className="text-xs font-mono space-y-0.5 text-slate-800">
                  <div>Parent PID: 101</div>
                  <div className="text-slate-500">Spawned background child PID: 184</div>
                  <div className="text-emerald-600">Child completed.</div>
                </div>
              );
            } else {
              outputNode = (
                <div className="text-xs font-mono text-emerald-700">
                  [Script executed successfully with exit code 0]
                </div>
              );
            }
          }
        }
        break;
      }

      default:
        outputNode = (
          <div className="text-xs text-rose-500 font-mono">
            shellspace-sh: {cmd}: command not found. Type <span className="font-semibold underline">help</span> for assistance.
          </div>
        );
    }

    setHistory((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        command: fullCmd,
        cwd: getPathString(currentPath),
        output: outputNode,
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(inputVal);
      setInputVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyIndex < cmdHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Auto-complete
      const targetNode = resolvePathNode(currentPath);
      if (targetNode?.children) {
        const keys = Object.keys(targetNode.children);
        const match = keys.find((k) => k.startsWith(inputVal.trim()));
        if (match) {
          setInputVal(match);
        }
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex-1 bg-white text-slate-900 font-mono p-4 overflow-y-auto flex flex-col justify-start select-text cursor-text border-t border-slate-100"
    >
      {/* History Items */}
      {history.map((item) => (
        <div key={item.id} className="mb-2">
          {item.command !== "" && (
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="text-emerald-700 font-semibold">student@shellspace</span>
              <span className="text-slate-400">:</span>
              <span className="text-blue-700 font-medium">{item.cwd}</span>
              <span className="text-slate-400">$</span>
              <span className="text-slate-900 font-semibold">{item.command}</span>
            </div>
          )}
          {item.output && <div className="mt-0.5">{item.output}</div>}
        </div>
      ))}

      {/* Active Prompt Line */}
      <div className="flex items-center gap-2 text-xs flex-shrink-0">
        <span className="text-emerald-700 font-semibold">student@shellspace</span>
        <span className="text-slate-400">:</span>
        <span className="text-blue-700 font-medium">{getPathString(currentPath)}</span>
        <span className="text-slate-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent text-slate-900 font-mono text-xs focus:outline-none border-none p-0"
        />
      </div>
      <div ref={terminalEndRef} />
    </div>
  );
}
