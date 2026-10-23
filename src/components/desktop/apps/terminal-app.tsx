"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  useVFSStore,
  VFSNode,
  formatPathDisplay,
  normalizePathParts,
} from "@/lib/stores/vfs-store";

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

    // Save to VFS ~/.bash_history
    writeFile(".bash_history", ["home", "student"], `${fullCmd}\n`, true);

    // Permanently log to Account Activity History (/student/history) - cannot be deleted
    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "TERMINAL_COMMAND",
        title: fullCmd,
        description: `Executed in ${getPathString(currentPath)}`,
        metadata: {
          command: fullCmd,
          cwd: getPathString(currentPath),
        },
      }),
    }).catch(() => {});

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
  );
}
