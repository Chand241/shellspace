"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  useVFSStore,
  VFSNode,
  formatPathDisplay,
  normalizePathParts,
} from "@/lib/stores/vfs-store";
import {
  useCommandHistoryStore,
  formatDateLabel,
} from "@/lib/stores/command-history-store";
import { Clock, Trash2, X, ChevronRight, Copy, Check } from "lucide-react";

interface HistoryItem {
  id: string;
  command: string;
  output: React.ReactNode;
  cwd: string;
}

export function TerminalApp() {
  const {
    getNode,
    mkdir,
    touch,
    writeFile,
    readFile,
    deleteNode,
    renameNode,
    generateTree,
    listDirectory,
  } = useVFSStore();

  const { commands: savedCommands, addCommand, getGroupedByDay, clearHistory: clearSavedHistory } =
    useCommandHistoryStore();

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        <div className="space-y-1 mb-2 font-mono">
          <div className="text-emerald-600 font-bold">
            ShellSpace Linux OS Lab — Interactive Shell v2026.1
          </div>
          <div className="text-slate-500 text-xs">
            Filesystem: Shared & Persisted Virtual Environment • Type{" "}
            <span className="text-blue-600 font-semibold">help</span> for commands.
          </div>
          <div className="text-slate-400 text-[11px]">
            Nested folders, files, redirects (&gt;, &gt;&gt;), tree, gcc, and scripts are fully supported.
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

  const getPathString = (parts: string[]) => formatPathDisplay(parts);

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

    let outputNode: React.ReactNode = null;
    let newPath = [...currentPath];

    // Check for redirection: cmd > file or cmd >> file
    let redirection: { targetFile: string; isAppend: boolean } | null = null;
    let commandToProcess = trimmed;

    if (trimmed.includes(">>")) {
      const parts = trimmed.split(">>");
      commandToProcess = parts[0].trim();
      redirection = { targetFile: parts[1].trim(), isAppend: true };
    } else if (trimmed.includes(">")) {
      const parts = trimmed.split(">");
      commandToProcess = parts[0].trim();
      redirection = { targetFile: parts[1].trim(), isAppend: false };
    }

    const parts = commandToProcess.split(" ").filter(Boolean);
    const cmd = parts[0];
    const args = parts.slice(1);

    // If redirection is present, capture text output and write to VFS
    let capturedTextOutput: string | null = null;

    switch (cmd) {
      case "help":
        outputNode = (
          <div className="space-y-1.5 text-xs text-slate-700 py-1 font-mono">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Linux OS Laboratory Commands:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-[11px]">
              <div><span className="text-blue-600 font-semibold">mkdir [-p] &lt;dir&gt;</span>: create nested folder</div>
              <div><span className="text-blue-600 font-semibold">touch &lt;file&gt;</span>: create file anywhere</div>
              <div><span className="text-blue-600 font-semibold">ls [-l, -a] [dir]</span>: list directory contents</div>
              <div><span className="text-blue-600 font-semibold">cd &lt;dir&gt;</span>: change directory (.., ~, /)</div>
              <div><span className="text-blue-600 font-semibold">pwd</span>: print working directory</div>
              <div><span className="text-blue-600 font-semibold">tree [dir]</span>: show folder hierarchy tree</div>
              <div><span className="text-blue-600 font-semibold">cat &lt;file&gt;</span>: read and display file</div>
              <div><span className="text-blue-600 font-semibold">echo &quot;text&quot; &gt; file</span>: write text to file</div>
              <div><span className="text-blue-600 font-semibold">rm [-r] &lt;path&gt;</span>: remove file or folder</div>
              <div><span className="text-blue-600 font-semibold">mv &lt;src&gt; &lt;dst&gt;</span>: move or rename</div>
              <div><span className="text-blue-600 font-semibold">gcc &lt;file.c&gt; -o &lt;bin&gt;</span>: compile C program</div>
              <div><span className="text-blue-600 font-semibold">./&lt;prog&gt; | bash &lt;sh&gt;</span>: run program/script</div>
              <div><span className="text-blue-600 font-semibold">find [dir] [-name pat]</span>: search files &amp; dirs</div>
              <div><span className="text-blue-600 font-semibold">grep &lt;pat&gt; &lt;file&gt;</span>: search text in file</div>
              <div><span className="text-blue-600 font-semibold">wc [-l, -w] &lt;file&gt;</span>: word / line count</div>
              <div><span className="text-blue-600 font-semibold">ps [aux] / top</span>: process inspection</div>
              <div><span className="text-blue-600 font-semibold">whoami / uname -a</span>: system &amp; user identity</div>
              <div><span className="text-blue-600 font-semibold">clear / history</span>: screen &amp; command log</div>
            </div>
          </div>
        );
        break;

      case "clear":
        setHistory([]);
        return;

      case "pwd":
        outputNode = <div className="text-xs font-mono">{getPathString(currentPath)}</div>;
        capturedTextOutput = getPathString(currentPath) + "\n";
        break;

      case "whoami":
        outputNode = <div className="text-xs font-mono text-slate-800">student</div>;
        capturedTextOutput = "student\n";
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
          outputNode = <div className="text-xs font-mono">Linux</div>;
        }
        break;

      case "date":
        outputNode = <div className="text-xs font-mono">{new Date().toUTCString()}</div>;
        break;

      case "history":
      case "history": {
        const groups = getGroupedByDay();
        const groupKeys = Object.keys(groups);

        if (groupKeys.length === 0) {
          outputNode = <div className="text-xs font-mono text-slate-400">No command history recorded yet.</div>;
        } else {
          let globalIdx = 1;
          outputNode = (
            <div className="text-xs font-mono space-y-2 py-1 select-text">
              <div className="text-slate-400 text-[11px] pb-1 border-b border-slate-200">
                # Bash Command History (Saved Day-wise in ~/.bash_history &amp; LocalStorage)
              </div>
              {groupKeys.map((dayLabel) => (
                <div key={dayLabel} className="space-y-0.5">
                  <div className="text-blue-600 font-bold text-[11px] mt-1.5 flex items-center gap-1.5">
                    <span>─── [ {dayLabel} ]</span>
                    <span className="text-slate-300">────────────────────────────────────────────</span>
                  </div>
                  {groups[dayLabel].map((entry) => (
                    <div key={entry.id} className="flex items-center gap-2 text-slate-700 hover:bg-slate-50 py-0.5">
                      <span className="inline-block w-6 text-slate-400 text-right">{globalIdx++}</span>
                      <span className="text-slate-400 font-mono text-[10px]">[{entry.timeStr}]</span>
                      <span className="text-slate-500 text-[11px] w-24 truncate">{entry.cwd}</span>
                      <span className="font-semibold text-slate-900">{entry.command}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        }
        break;
      }

      case "tree": {
        const targetDir = args[0] || ".";
        const treeRes = generateTree(targetDir, currentPath);
        if (treeRes.error) {
          outputNode = <div className="text-xs text-rose-500 font-mono">tree: {treeRes.error}</div>;
        } else {
          outputNode = (
            <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-tight">
              {treeRes.treeString}
            </pre>
          );
          capturedTextOutput = treeRes.treeString + "\n";
        }
        break;
      }

      case "mkdir": {
        let isRecursive = false;
        const targets: string[] = [];

        for (const a of args) {
          if (a === "-p" || a === "-parents") {
            isRecursive = true;
          } else {
            targets.push(a);
          }
        }

        if (targets.length === 0) {
          outputNode = <div className="text-xs text-rose-500 font-mono">mkdir: missing operand</div>;
        } else {
          const errors: string[] = [];
          for (const t of targets) {
            const res = mkdir(t, currentPath, { recursive: isRecursive });
            if (!res.success) {
              errors.push(`mkdir: cannot create directory '${t}': ${res.error}`);
            }
          }
          if (errors.length > 0) {
            outputNode = (
              <div className="text-xs text-rose-500 font-mono space-y-0.5">
                {errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            );
          }
        }
        break;
      }

      case "touch": {
        if (args.length === 0) {
          outputNode = <div className="text-xs text-rose-500 font-mono">touch: missing file operand</div>;
        } else {
          const errors: string[] = [];
          for (const fileTarget of args) {
            const res = touch(fileTarget, currentPath);
            if (!res.success) {
              errors.push(`touch: cannot touch '${fileTarget}': ${res.error}`);
            }
          }
          if (errors.length > 0) {
            outputNode = (
              <div className="text-xs text-rose-500 font-mono space-y-0.5">
                {errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            );
          }
        }
        break;
      }

      case "echo": {
        const text = args.join(" ").replace(/^["']|["']$/g, "");
        outputNode = <div className="text-xs font-mono">{text}</div>;
        capturedTextOutput = text + "\n";
        break;
      }

      case "cat": {
        if (args.length === 0) {
          outputNode = <div className="text-xs text-rose-500 font-mono">cat: missing operand</div>;
        } else {
          const contents: string[] = [];
          let hasError = false;

          for (const f of args) {
            const res = readFile(f, currentPath);
            if (res.error) {
              hasError = true;
              outputNode = <div className="text-xs text-rose-500 font-mono">cat: {f}: {res.error}</div>;
              break;
            } else {
              contents.push(res.content ?? "");
            }
          }

          if (!hasError) {
            const fullContent = contents.join("\n");
            outputNode = (
              <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                {fullContent}
              </pre>
            );
            capturedTextOutput = fullContent;
          }
        }
        break;
      }

      case "ls": {
        let isLong = false;
        let isAll = false;
        let targetPath = ".";

        for (const a of args) {
          if (a.startsWith("-")) {
            if (a.includes("l")) isLong = true;
            if (a.includes("a")) isAll = true;
          } else {
            targetPath = a;
          }
        }

        const listRes = listDirectory(targetPath, currentPath);
        if (listRes.error || !listRes.items) {
          outputNode = (
            <div className="text-xs text-rose-500 font-mono">
              ls: cannot access &apos;{targetPath}&apos;: {listRes.error || "No such file or directory"}
            </div>
          );
        } else {
          const items = listRes.items;

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
                    <span className="text-slate-500 w-14 text-right">
                      {it.size !== undefined ? it.size : 4096}
                    </span>
                    <span className="text-slate-400">{it.modified}</span>
                    <span
                      className={`font-semibold ${
                        it.type === "dir"
                          ? "text-blue-600"
                          : it.name.endsWith(".sh") || it.name.endsWith(".c")
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
                        : it.name.endsWith(".sh") || it.name.endsWith(".c")
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
          newPath = ["home", "student"];
        } else {
          const resolved = normalizePathParts(target, currentPath);
          let targetNode = getNode(resolved);
          let finalPath = resolved;

          // If not found in current directory, check if it's in home directory (~/target or ../target)
          if (!targetNode && !target.startsWith("/") && !target.startsWith("~")) {
            const homeCandidate = normalizePathParts(`~/${target}`, currentPath);
            const homeNode = getNode(homeCandidate);
            if (homeNode && homeNode.type === "dir") {
              targetNode = homeNode;
              finalPath = homeCandidate;
            }
          }

          if (!targetNode) {
            outputNode = (
              <div className="text-xs text-rose-500 font-mono space-y-0.5">
                <div>cd: {target}: No such file or directory</div>
                <div className="text-slate-400 text-[11px]">
                  Hint: In Linux, folder names are case-sensitive (e.g. &apos;Desktop&apos; with a capital &apos;D&apos;). Type &apos;ls&apos; to view available folders.
                </div>
              </div>
            );
          } else if (targetNode.type !== "dir") {
            outputNode = (
              <div className="text-xs text-rose-500 font-mono">
                cd: {target}: Not a directory
              </div>
            );
          } else {
            // Build canonical path with proper casing from nodes
            let curr = getNode([]);
            const canonicalParts: string[] = [];
            for (const seg of finalPath) {
              if (curr?.children) {
                const matchedKey =
                  curr.children[seg] ? seg :
                  Object.keys(curr.children).find(
                    (k) => k.toLowerCase() === seg.toLowerCase()
                  ) || seg;
                canonicalParts.push(matchedKey);
                curr = curr.children[matchedKey];
              } else {
                canonicalParts.push(seg);
              }
            }
            newPath = canonicalParts;
          }
        }
        setCurrentPath(newPath);
        break;
      }

      case "rm": {
        let isRecursive = false;
        const targets: string[] = [];

        for (const a of args) {
          if (a === "-r" || a === "-rf" || a === "-R") {
            isRecursive = true;
          } else {
            targets.push(a);
          }
        }

        if (targets.length === 0) {
          outputNode = <div className="text-xs text-rose-500 font-mono">rm: missing operand</div>;
        } else {
          const errors: string[] = [];
          for (const t of targets) {
            const res = deleteNode(t, currentPath, isRecursive);
            if (!res.success) {
              errors.push(`rm: cannot remove '${t}': ${res.error}`);
            }
          }
          if (errors.length > 0) {
            outputNode = (
              <div className="text-xs text-rose-500 font-mono space-y-0.5">
                {errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            );
          }
        }
        break;
      }

      case "mv": {
        if (args.length < 2) {
          outputNode = <div className="text-xs text-rose-500 font-mono">mv: missing destination file operand</div>;
        } else {
          const src = args[0];
          const dst = args[1];
          const res = renameNode(src, dst, currentPath);
          if (!res.success) {
            outputNode = <div className="text-xs text-rose-500 font-mono">mv: {res.error}</div>;
          }
        }
        break;
      }

      case "find": {
        const targetDir = args[0] && !args[0].startsWith("-") ? args[0] : ".";
        const nameIdx = args.indexOf("-name");
        const pattern = nameIdx !== -1 ? args[nameIdx + 1] : null;

        const resolved = normalizePathParts(targetDir, currentPath);
        const node = getNode(resolved);

        if (!node) {
          outputNode = <div className="text-xs text-rose-500 font-mono">find: &apos;{targetDir}&apos;: No such file or directory</div>;
        } else {
          const results: string[] = [];

          const searchRecursive = (curr: VFSNode, curPath: string) => {
            if (!pattern || curr.name.includes(pattern.replace(/\*/g, ""))) {
              results.push(curPath);
            }
            if (curr.children) {
              for (const childName of Object.keys(curr.children)) {
                searchRecursive(curr.children[childName], `${curPath}/${childName}`);
              }
            }
          };

          searchRecursive(node, targetDir === "." ? "." : node.name);
          outputNode = (
            <div className="text-xs font-mono space-y-0.5 text-slate-800">
              {results.map((r, i) => (
                <div key={i}>{r}</div>
              ))}
            </div>
          );
        }
        break;
      }

      case "grep": {
        if (args.length < 2) {
          outputNode = <div className="text-xs text-rose-500 font-mono">grep: usage: grep &lt;pattern&gt; &lt;file&gt;</div>;
        } else {
          const pat = args[0].replace(/^["']|["']$/g, "");
          const file = args[1];
          const res = readFile(file, currentPath);

          if (res.error) {
            outputNode = <div className="text-xs text-rose-500 font-mono">grep: {file}: {res.error}</div>;
          } else {
            const lines = (res.content || "").split("\n");
            const matched = lines.filter((l) => l.includes(pat));
            if (matched.length === 0) {
              outputNode = null;
            } else {
              outputNode = (
                <div className="text-xs font-mono space-y-0.5">
                  {matched.map((l, i) => (
                    <div key={i} className="text-slate-800">
                      {l}
                    </div>
                  ))}
                </div>
              );
            }
          }
        }
        break;
      }

      case "wc": {
        const file = args.find((a) => !a.startsWith("-"));
        if (!file) {
          outputNode = <div className="text-xs text-rose-500 font-mono">wc: missing file operand</div>;
        } else {
          const res = readFile(file, currentPath);
          if (res.error) {
            outputNode = <div className="text-xs text-rose-500 font-mono">wc: {file}: {res.error}</div>;
          } else {
            const content = res.content || "";
            const lines = content.split("\n").length;
            const words = content.trim().split(/\s+/).filter(Boolean).length;
            const chars = content.length;
            outputNode = (
              <div className="text-xs font-mono text-slate-800">
                {lines} {words} {chars} {file}
              </div>
            );
          }
        }
        break;
      }

      case "gcc": {
        // OS Lab C Compiler simulation
        const cFile = args.find((a) => a.endsWith(".c"));
        let outName = "a.out";
        const oIdx = args.indexOf("-o");
        if (oIdx !== -1 && args[oIdx + 1]) {
          outName = args[oIdx + 1];
        }

        if (!cFile) {
          outputNode = <div className="text-xs text-rose-500 font-mono">gcc: fatal error: no input files</div>;
        } else {
          const fileRes = readFile(cFile, currentPath);
          if (fileRes.error) {
            outputNode = <div className="text-xs text-rose-500 font-mono">gcc: error: {cFile}: {fileRes.error}</div>;
          } else {
            // Create compiled binary executable in VFS!
            touch(outName, currentPath, `[EXECUTABLE_BINARY: compiled from ${cFile}]`);
            outputNode = (
              <div className="text-xs font-mono text-emerald-600">
                Compilation successful. Generated binary executable &apos;{outName}&apos;.
              </div>
            );
          }
        }
        break;
      }

      case "bash":
      case "sh": {
        const scriptName = args[0];
        if (!scriptName) {
          outputNode = <div className="text-xs text-rose-500 font-mono">{cmd}: script name required</div>;
        } else {
          const fileRes = readFile(scriptName, currentPath);
          if (fileRes.error) {
            outputNode = <div className="text-xs text-rose-500 font-mono">{cmd}: {scriptName}: {fileRes.error}</div>;
          } else {
            const content = fileRes.content || "";
            // Check known lab scripts or general bash simulation
            if (scriptName.includes("fcfs") || content.includes("FCFS")) {
              outputNode = (
                <div className="text-xs font-mono space-y-1 text-slate-800">
                  <div className="text-blue-600 font-bold">[FCFS CPU Scheduling Simulation]</div>
                  <div>P1: Arrival=0, Burst=5, Completion=5, TAT=5, WT=0</div>
                  <div>P2: Arrival=1, Burst=8, Completion=13, TAT=12, WT=4</div>
                  <div>P3: Arrival=2, Burst=6, Completion=19, TAT=17, WT=11</div>
                  <div className="text-emerald-600 font-semibold">Average Waiting Time: 5.00 ms</div>
                </div>
              );
            } else if (scriptName.includes("fork") || content.includes("fork")) {
              outputNode = (
                <div className="text-xs font-mono space-y-0.5 text-slate-800">
                  <div>Parent Process PID: 1042</div>
                  <div className="text-blue-600">Forking child process...</div>
                  <div className="text-emerald-600">[CHILD] PID = 1043, Parent PID = 1042</div>
                  <div>[PARENT] Child 1043 finished. Exiting.</div>
                </div>
              );
            } else if (scriptName === "welcome.sh") {
              outputNode = (
                <div className="text-xs font-mono space-y-0.5 text-emerald-800">
                  <div>==================================================</div>
                  <div> Welcome to ShellSpace Virtual Linux &amp; OS Lab! </div>
                  <div>==================================================</div>
                  <div>Kernel: Linux 6.8.0-shellspace x86_64</div>
                  <div>User : student</div>
                  <div>Ready for OS concepts and Bash practice.</div>
                </div>
              );
            } else {
              // Extract echo statements from content
              const echoLines = content
                .split("\n")
                .filter((l) => l.trim().startsWith("echo "))
                .map((l) => l.trim().replace(/^echo\s+["']?/, "").replace(/["']?$/, ""));

              if (echoLines.length > 0) {
                outputNode = (
                  <div className="text-xs font-mono space-y-0.5 text-slate-800">
                    {echoLines.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                );
              } else {
                outputNode = (
                  <div className="text-xs font-mono text-emerald-600">
                    [Script &apos;{scriptName}&apos; executed successfully with exit code 0]
                  </div>
                );
              }
            }
          }
        }
        break;
      }

      default:
        // Check if user is executing a binary e.g. ./a.out or ./program
        if (cmd.startsWith("./")) {
          const progName = cmd.slice(2);
          const fileRes = readFile(progName, currentPath);
          if (fileRes.error) {
            outputNode = (
              <div className="text-xs text-rose-500 font-mono">
                shellspace-sh: {cmd}: No such file or directory
              </div>
            );
          } else {
            // Execute simulated OS lab binary
            outputNode = (
              <div className="text-xs font-mono space-y-1 text-slate-800">
                <div className="text-emerald-600 font-bold">[Executing: {progName}]</div>
                <div>Process PID: {Math.floor(1000 + Math.random() * 9000)}</div>
                <div className="text-slate-700">OS Lab Simulation Output: execution finished normally (exit code 0)</div>
              </div>
            );
          }
        } else {
          outputNode = (
            <div className="text-xs text-rose-500 font-mono">
              shellspace-sh: {cmd}: command not found. Type <span className="font-semibold underline">help</span> for available commands.
            </div>
          );
        }
    }

    // Handle redirection writing into VFS!
    if (redirection && capturedTextOutput !== null) {
      const res = writeFile(
        redirection.targetFile,
        currentPath,
        capturedTextOutput,
        redirection.isAppend
      );
      if (!res.success) {
        outputNode = (
          <div className="text-xs text-rose-500 font-mono">
            bash: {redirection.targetFile}: {res.error}
          </div>
        );
      } else {
        outputNode = null; // stdout was redirected to file!
      }
    }

    // Save to persistent Day-wise command store and ~/.bash_history
    addCommand(fullCmd, getPathString(currentPath));
    writeFile(".bash_history", ["home", "student"], `${fullCmd}\n`, true);

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
      // Auto-complete current directory items
      const curr = getNode(currentPath);
      if (curr?.children) {
        const keys = Object.keys(curr.children);
        const match = keys.find((k) => k.startsWith(inputVal.trim()));
        if (match) {
          setInputVal(match);
        }
      }
    }
  };

  const dayGroups = getGroupedByDay();
  const dayLabels = Object.keys(dayGroups);

  const copyToClipboard = (cmdText: string, id: string) => {
    navigator.clipboard?.writeText(cmdText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      {/* Terminal Top Control Bar */}
      <div className="h-8 px-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="font-mono text-[11px] text-slate-600 font-semibold">
            bash — student@shellspace: {getPathString(currentPath)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              showHistoryDrawer
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
            title="View saved commands day-wise"
          >
            <Clock size={12} className={showHistoryDrawer ? "text-white" : "text-blue-600"} />
            <span>History ({savedCommands.length})</span>
          </button>

          <button
            onClick={() => setHistory([])}
            className="px-2 py-0.5 rounded text-[11px] font-medium bg-white hover:bg-slate-200 text-slate-600 border border-slate-200"
            title="Clear terminal screen (or type 'clear')"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Terminal Screen */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex-1 bg-white text-slate-900 font-mono p-4 overflow-y-auto flex flex-col justify-start select-text cursor-text"
        >
          {/* History Items */}
          {history.map((item) => (
            <div key={item.id} className="mb-2">
              {item.command !== "" && (
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className="text-emerald-700 font-bold">student@shellspace</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-blue-700 font-semibold">{item.cwd}</span>
                  <span className="text-slate-400">$</span>
                  <span className="text-slate-900 font-medium">{item.command}</span>
                </div>
              )}
              {item.output && <div className="mt-0.5">{item.output}</div>}
            </div>
          ))}

          {/* Active Prompt Line */}
          <div className="flex items-center gap-2 text-xs flex-shrink-0">
            <span className="text-emerald-700 font-bold">student@shellspace</span>
            <span className="text-slate-400">:</span>
            <span className="text-blue-700 font-semibold">{getPathString(currentPath)}</span>
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

        {/* Day-Wise Command History Drawer */}
        {showHistoryDrawer && (
          <div className="w-80 md:w-96 bg-slate-50 border-l border-slate-200 flex flex-col shrink-0 select-none shadow-lg">
            <div className="h-10 px-3 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Clock size={14} className="text-blue-600" />
                <span>Command History (Day-Wise)</span>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {dayLabels.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 italic">
                  No commands logged yet. Type commands in the terminal!
                </div>
              ) : (
                dayLabels.map((day) => (
                  <div key={day} className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs">
                    <div className="text-[11px] font-bold text-blue-700 pb-1.5 border-b border-slate-100 flex items-center justify-between">
                      <span>{day}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {dayGroups[day].length} commands
                      </span>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {dayGroups[day].map((entry) => (
                        <div
                          key={entry.id}
                          className="group p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-100 flex items-center justify-between text-xs font-mono transition-colors"
                        >
                          <div className="overflow-hidden mr-2">
                            <div className="font-semibold text-slate-900 truncate">
                              {entry.command}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span>{entry.timeStr}</span>
                              <span>•</span>
                              <span className="truncate">{entry.cwd}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => copyToClipboard(entry.command, entry.id)}
                              title="Copy command"
                              className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            >
                              {copiedId === entry.id ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setInputVal(entry.command);
                                inputRef.current?.focus();
                              }}
                              title="Insert into terminal"
                              className="px-1.5 py-0.5 text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-sans font-semibold"
                            >
                              Run
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Total: {savedCommands.length} commands saved</span>
              <button
                onClick={() => {
                  if (confirm("Clear all saved command history?")) {
                    clearSavedHistory();
                  }
                }}
                className="text-[10px] text-rose-600 hover:underline"
              >
                Clear History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
