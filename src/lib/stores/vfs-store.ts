import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VFSNode {
  name: string;
  type: "file" | "dir";
  content?: string;
  size?: number;
  modified: string;
  permissions?: string;
  owner?: string;
  group?: string;
  children?: Record<string, VFSNode>;
}

export function formatTimeNow(): string {
  const d = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = months[d.getMonth()];
  const day = d.getDate();
  let hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${m} ${day}, ${hours}:${mins} ${ampm}`;
}

export function formatSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function createDefaultFS(): VFSNode {
  const mod = formatTimeNow();

  return {
    name: "/",
    type: "dir",
    modified: mod,
    permissions: "drwxr-xr-x",
    owner: "root",
    group: "root",
    children: {
      home: {
        name: "home",
        type: "dir",
        modified: mod,
        permissions: "drwxr-xr-x",
        owner: "root",
        group: "root",
        children: {
          student: {
            name: "student",
            type: "dir",
            modified: mod,
            permissions: "drwxr-xr-x",
            owner: "student",
            group: "student",
            children: {
              Desktop: {
                name: "Desktop",
                type: "dir",
                modified: mod,
                permissions: "drwxr-xr-x",
                owner: "student",
                group: "student",
                children: {},
              },
              workspace: {
                name: "workspace",
                type: "dir",
                modified: mod,
                permissions: "drwxr-xr-x",
                owner: "student",
                group: "student",
                children: {
                  "welcome.sh": {
                    name: "welcome.sh",
                    type: "file",
                    modified: mod,
                    permissions: "-rwxr-xr-x",
                    owner: "student",
                    group: "student",
                    size: 380,
                    content: `#!/usr/bin/env bash
# ShellSpace Linux Lab - Welcome Script
echo "=================================================="
echo "  Welcome to ShellSpace Virtual Linux & OS Lab!   "
echo "=================================================="
echo "Kernel: Linux 6.8.0-shellspace x86_64"
echo "User  : $(whoami) [student]"
echo "Host  : shellspace-lab"
echo "Status: Full Virtual Filesystem Active"
echo "Tip   : Try 'mkdir mylab', 'touch test.c', or 'tree'"
echo "=================================================="
`,
                  },
                  "notes.txt": {
                    name: "notes.txt",
                    type: "file",
                    modified: mod,
                    permissions: "-rw-r--r--",
                    owner: "student",
                    group: "student",
                    size: 495,
                    content: `Operating Systems Laboratory Concepts:
1. Process Management:
   - fork(), exec(), wait(), exit(), getpid(), getppid()
   - Zombie & Orphan processes
2. CPU Scheduling Algorithms:
   - First-Come, First-Served (FCFS)
   - Shortest Job First (SJF) & SRTF
   - Priority Scheduling & Round Robin (RR)
3. Inter-Process Communication (IPC):
   - Unix Pipes (pipe()), Named Pipes (FIFOs), Shared Memory
4. Concurrency & Synchronization:
   - Semaphores, Mutex Locks, Producer-Consumer, Deadlocks
5. Memory Management:
   - Page Replacement: FIFO, LRU, Optimal
`,
                  },
                  os_labs: {
                    name: "os_labs",
                    type: "dir",
                    modified: mod,
                    permissions: "drwxr-xr-x",
                    owner: "student",
                    group: "student",
                    children: {
                      lab1_process_creation: {
                        name: "lab1_process_creation",
                        type: "dir",
                        modified: mod,
                        permissions: "drwxr-xr-x",
                        owner: "student",
                        group: "student",
                        children: {
                          "fork_demo.c": {
                            name: "fork_demo.c",
                            type: "file",
                            modified: mod,
                            permissions: "-rw-r--r--",
                            owner: "student",
                            group: "student",
                            size: 610,
                            content: `#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main() {
    printf("Starting Process ID: %d\\n", getpid());
    pid_t pid = fork();

    if (pid < 0) {
        perror("Fork failed");
        return 1;
    } else if (pid == 0) {
        printf("[CHILD] PID = %d, Parent PID = %d\\n", getpid(), getppid());
    } else {
        printf("[PARENT] PID = %d, Created Child PID = %d\\n", getpid(), pid);
    }
    return 0;
}
`,
                          },
                          "zombie_orphan.c": {
                            name: "zombie_orphan.c",
                            type: "file",
                            modified: mod,
                            permissions: "-rw-r--r--",
                            owner: "student",
                            group: "student",
                            size: 520,
                            content: `#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main() {
    pid_t pid = fork();
    if (pid > 0) {
        printf("[PARENT] Sleeping for 10s. Child will terminate and become Zombie...\\n");
        sleep(10);
    } else if (pid == 0) {
        printf("[CHILD] Terminating immediately. Status is Zombie until parent waits.\\n");
        exit(0);
    }
    return 0;
}
`,
                          },
                        },
                      },
                      lab2_cpu_scheduling: {
                        name: "lab2_cpu_scheduling",
                        type: "dir",
                        modified: mod,
                        permissions: "drwxr-xr-x",
                        owner: "student",
                        group: "student",
                        children: {
                          "fcfs.c": {
                            name: "fcfs.c",
                            type: "file",
                            modified: mod,
                            permissions: "-rw-r--r--",
                            owner: "student",
                            group: "student",
                            size: 680,
                            content: `// FCFS Scheduling Algorithm
#include <stdio.h>

int main() {
    int n = 3;
    int bt[] = {5, 9, 6};
    int wt[3] = {0}, tat[3] = {0};

    wt[0] = 0;
    for (int i = 1; i < n; i++) {
        wt[i] = wt[i - 1] + bt[i - 1];
    }
    for (int i = 0; i < n; i++) {
        tat[i] = wt[i] + bt[i];
        printf("P%d: BT=%d, WT=%d, TAT=%d\\n", i + 1, bt[i], wt[i], tat[i]);
    }
    return 0;
}
`,
                          },
                          "round_robin.sh": {
                            name: "round_robin.sh",
                            type: "file",
                            modified: mod,
                            permissions: "-rwxr-xr-x",
                            owner: "student",
                            group: "student",
                            size: 420,
                            content: `#!/bin/bash
# Round Robin Quantum Demo
echo "Round Robin CPU Scheduling Simulation (Quantum = 2ms)"
bursts=(5 4 2 1)
echo "Processes: P1(5), P2(4), P3(2), P4(1)"
echo "Executing time slices..."
`,
                          },
                        },
                      },
                      lab3_synchronization: {
                        name: "lab3_synchronization",
                        type: "dir",
                        modified: mod,
                        permissions: "drwxr-xr-x",
                        owner: "student",
                        group: "student",
                        children: {
                          "producer_consumer.c": {
                            name: "producer_consumer.c",
                            type: "file",
                            modified: mod,
                            permissions: "-rw-r--r--",
                            owner: "student",
                            group: "student",
                            size: 750,
                            content: `#include <stdio.h>
#include <semaphore.h>
#include <pthread.h>

#define BUFFER_SIZE 5
int buffer[BUFFER_SIZE];
int in = 0, out = 0;

int main() {
    printf("Bounded Buffer Producer-Consumer with Semaphores\\n");
    printf("Buffer Capacity: %d\\n", BUFFER_SIZE);
    return 0;
}
`,
                          },
                        },
                      },
                    },
                  },
                  samples: {
                    name: "samples",
                    type: "dir",
                    modified: mod,
                    permissions: "drwxr-xr-x",
                    owner: "student",
                    group: "student",
                    children: {
                      "fibonacci.sh": {
                        name: "fibonacci.sh",
                        type: "file",
                        modified: mod,
                        permissions: "-rwxr-xr-x",
                        owner: "student",
                        group: "student",
                        size: 260,
                        content: `#!/bin/bash
# Fibonacci sequence in Bash
echo "First 8 Fibonacci numbers:"
a=0
b=1
for ((i=0; i<8; i++)); do
  echo -n "$a "
  fn=$((a + b))
  a=$b
  b=$fn
done
echo ""
`,
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
        modified: mod,
        permissions: "drwxr-xr-x",
        owner: "root",
        group: "root",
        children: {
          hostname: {
            name: "hostname",
            type: "file",
            modified: mod,
            permissions: "-rw-r--r--",
            size: 19,
            content: "shellspace-lab\n",
          },
          "os-release": {
            name: "os-release",
            type: "file",
            modified: mod,
            permissions: "-rw-r--r--",
            size: 130,
            content: `NAME="ShellSpace Linux"\nVERSION="2026.1 LTS"\nID=shellspace\nPRETTY_NAME="ShellSpace Linux Lab 2026.1 LTS"\n`,
          },
        },
      },
      bin: {
        name: "bin",
        type: "dir",
        modified: mod,
        permissions: "drwxr-xr-x",
        owner: "root",
        group: "root",
        children: {
          bash: { name: "bash", type: "file", modified: mod, permissions: "-rwxr-xr-x", size: 1245000 },
          sh: { name: "sh", type: "file", modified: mod, permissions: "-rwxr-xr-x", size: 145000 },
          ls: { name: "ls", type: "file", modified: mod, permissions: "-rwxr-xr-x", size: 142000 },
          mkdir: { name: "mkdir", type: "file", modified: mod, permissions: "-rwxr-xr-x", size: 75000 },
          touch: { name: "touch", type: "file", modified: mod, permissions: "-rwxr-xr-x", size: 55000 },
          cat: { name: "cat", type: "file", modified: mod, permissions: "-rwxr-xr-x", size: 45000 },
          echo: { name: "echo", type: "file", modified: mod, permissions: "-rwxr-xr-x", size: 38000 },
          gcc: { name: "gcc", type: "file", modified: mod, permissions: "-rwxr-xr-x", size: 950000 },
        },
      },
      tmp: {
        name: "tmp",
        type: "dir",
        modified: mod,
        permissions: "drwxrwxrwt",
        owner: "root",
        group: "root",
        children: {},
      },
    },
  };
}

export function normalizePathParts(rawPath: string, cwdParts: string[]): string[] {
  let clean = rawPath.trim();
  if (!clean) return [...cwdParts];

  let isAbsolute = false;
  let parts: string[] = [];

  if (clean === "~" || clean.startsWith("~/")) {
    parts = ["home", "student", "workspace"];
    clean = clean.replace(/^~\/?/, "");
  } else if (clean.startsWith("/")) {
    isAbsolute = true;
    clean = clean.replace(/^\/+/, "");
  } else {
    parts = [...cwdParts];
  }

  if (clean) {
    const segments = clean.split("/").filter(Boolean);
    for (const seg of segments) {
      if (seg === ".") continue;
      if (seg === "..") {
        if (parts.length > 0) parts.pop();
      } else {
        parts.push(seg);
      }
    }
  }

  return parts;
}

export function formatPathDisplay(parts: string[]): string {
  if (parts.length === 0) return "/";
  if (
    parts.length >= 3 &&
    parts[0] === "home" &&
    parts[1] === "student" &&
    parts[2] === "workspace"
  ) {
    const sub = parts.slice(3).join("/");
    return sub ? `~/workspace/${sub}` : "~/workspace";
  }
  return "/" + parts.join("/");
}

interface VFSState {
  root: VFSNode;
  getNode: (pathParts: string[]) => VFSNode | null;
  mkdir: (
    rawPath: string,
    cwdParts: string[],
    options?: { recursive?: boolean }
  ) => { success: boolean; error?: string };
  touch: (
    rawPath: string,
    cwdParts: string[],
    initialContent?: string
  ) => { success: boolean; error?: string };
  writeFile: (
    rawPath: string,
    cwdParts: string[],
    content: string,
    append?: boolean
  ) => { success: boolean; error?: string };
  readFile: (
    rawPath: string,
    cwdParts: string[]
  ) => { content: string | null; error?: string };
  deleteNode: (
    rawPath: string,
    cwdParts: string[],
    recursive?: boolean
  ) => { success: boolean; error?: string };
  renameNode: (
    rawPath: string,
    newName: string,
    cwdParts: string[]
  ) => { success: boolean; error?: string };
  listDirectory: (
    rawPath: string,
    cwdParts: string[]
  ) => { items: VFSNode[] | null; error?: string };
  generateTree: (
    rawPath: string,
    cwdParts: string[]
  ) => { treeString: string; error?: string };
  resetFS: () => void;
}

function cloneNode(node: VFSNode): VFSNode {
  return JSON.parse(JSON.stringify(node));
}

export const useVFSStore = create<VFSState>()(
  persist(
    (set, get) => ({
      root: createDefaultFS(),

      getNode: (pathParts: string[]): VFSNode | null => {
        let current: VFSNode = get().root;
        for (const segment of pathParts) {
          if (!current.children || !current.children[segment]) {
            return null;
          }
          current = current.children[segment];
        }
        return current;
      },

      mkdir: (rawPath: string, cwdParts: string[], options = { recursive: false }) => {
        const fullParts = normalizePathParts(rawPath, cwdParts);
        if (fullParts.length === 0) {
          return { success: false, error: "Cannot create root directory" };
        }

        const rootCopy = cloneNode(get().root);
        let current = rootCopy;

        for (let i = 0; i < fullParts.length; i++) {
          const seg = fullParts[i];
          const isLast = i === fullParts.length - 1;

          if (!current.children) {
            current.children = {};
          }

          if (current.children[seg]) {
            if (isLast) {
              return { success: false, error: `Directory '${seg}' already exists` };
            }
            if (current.children[seg].type !== "dir") {
              return { success: false, error: `'${seg}' is not a directory` };
            }
            current = current.children[seg];
          } else {
            if (!isLast && !options.recursive) {
              return {
                success: false,
                error: `No such file or directory. Use -p for nested creation.`,
              };
            }

            const newDir: VFSNode = {
              name: seg,
              type: "dir",
              modified: formatTimeNow(),
              permissions: "drwxr-xr-x",
              owner: "student",
              group: "student",
              children: {},
            };
            current.children[seg] = newDir;
            current = newDir;
          }
        }

        set({ root: rootCopy });
        return { success: true };
      },

      touch: (rawPath: string, cwdParts: string[], initialContent = "") => {
        const fullParts = normalizePathParts(rawPath, cwdParts);
        if (fullParts.length === 0) {
          return { success: false, error: "Invalid path" };
        }

        const fileName = fullParts[fullParts.length - 1];
        const dirParts = fullParts.slice(0, -1);

        const rootCopy = cloneNode(get().root);
        let current = rootCopy;

        for (const seg of dirParts) {
          if (!current.children || !current.children[seg]) {
            return {
              success: false,
              error: `Parent directory '${seg}' does not exist`,
            };
          }
          current = current.children[seg];
        }

        if (!current.children) {
          current.children = {};
        }

        if (current.children[fileName]) {
          // If already exists, update modified timestamp
          current.children[fileName].modified = formatTimeNow();
        } else {
          current.children[fileName] = {
            name: fileName,
            type: "file",
            modified: formatTimeNow(),
            permissions: fileName.endsWith(".sh") ? "-rwxr-xr-x" : "-rw-r--r--",
            owner: "student",
            group: "student",
            size: initialContent.length,
            content: initialContent,
          };
        }

        set({ root: rootCopy });
        return { success: true };
      },

      writeFile: (rawPath: string, cwdParts: string[], content: string, append = false) => {
        const fullParts = normalizePathParts(rawPath, cwdParts);
        if (fullParts.length === 0) {
          return { success: false, error: "Invalid path" };
        }

        const fileName = fullParts[fullParts.length - 1];
        const dirParts = fullParts.slice(0, -1);

        const rootCopy = cloneNode(get().root);
        let current = rootCopy;

        for (const seg of dirParts) {
          if (!current.children || !current.children[seg]) {
            return { success: false, error: `Directory not found` };
          }
          current = current.children[seg];
        }

        if (!current.children) {
          current.children = {};
        }

        const existing = current.children[fileName];
        let newContent = content;

        if (existing && existing.type === "dir") {
          return { success: false, error: `'${fileName}' is a directory` };
        }

        if (existing && append) {
          newContent = (existing.content || "") + content;
        }

        current.children[fileName] = {
          name: fileName,
          type: "file",
          modified: formatTimeNow(),
          permissions: existing?.permissions || (fileName.endsWith(".sh") ? "-rwxr-xr-x" : "-rw-r--r--"),
          owner: "student",
          group: "student",
          size: newContent.length,
          content: newContent,
        };

        set({ root: rootCopy });
        return { success: true };
      },

      readFile: (rawPath: string, cwdParts: string[]) => {
        const fullParts = normalizePathParts(rawPath, cwdParts);
        const node = get().getNode(fullParts);

        if (!node) {
          return { content: null, error: "No such file or directory" };
        }
        if (node.type === "dir") {
          return { content: null, error: `'${node.name}' is a directory` };
        }

        return { content: node.content ?? "" };
      },

      deleteNode: (rawPath: string, cwdParts: string[], recursive = false) => {
        const fullParts = normalizePathParts(rawPath, cwdParts);
        if (fullParts.length === 0) {
          return { success: false, error: "Cannot delete root directory" };
        }

        const targetName = fullParts[fullParts.length - 1];
        const parentParts = fullParts.slice(0, -1);

        const rootCopy = cloneNode(get().root);
        let current = rootCopy;

        for (const seg of parentParts) {
          if (!current.children || !current.children[seg]) {
            return { success: false, error: `Path not found` };
          }
          current = current.children[seg];
        }

        if (!current.children || !current.children[targetName]) {
          return { success: false, error: `No such file or directory` };
        }

        const target = current.children[targetName];
        if (target.type === "dir" && !recursive) {
          const hasChildren = target.children && Object.keys(target.children).length > 0;
          if (hasChildren) {
            return { success: false, error: `Directory not empty (use -r / -rf)` };
          }
        }

        delete current.children[targetName];
        set({ root: rootCopy });
        return { success: true };
      },

      renameNode: (rawPath: string, newName: string, cwdParts: string[]) => {
        const fullParts = normalizePathParts(rawPath, cwdParts);
        if (fullParts.length === 0) {
          return { success: false, error: "Cannot rename root directory" };
        }

        const oldName = fullParts[fullParts.length - 1];
        const parentParts = fullParts.slice(0, -1);

        const rootCopy = cloneNode(get().root);
        let current = rootCopy;

        for (const seg of parentParts) {
          if (!current.children || !current.children[seg]) {
            return { success: false, error: `Path not found` };
          }
          current = current.children[seg];
        }

        if (!current.children || !current.children[oldName]) {
          return { success: false, error: `No such file or directory` };
        }

        if (current.children[newName]) {
          return { success: false, error: `'${newName}' already exists` };
        }

        const node = current.children[oldName];
        delete current.children[oldName];
        node.name = newName;
        node.modified = formatTimeNow();
        current.children[newName] = node;

        set({ root: rootCopy });
        return { success: true };
      },

      listDirectory: (rawPath: string, cwdParts: string[]) => {
        const fullParts = normalizePathParts(rawPath, cwdParts);
        const node = get().getNode(fullParts);

        if (!node) {
          return { items: null, error: "No such file or directory" };
        }
        if (node.type !== "dir") {
          return { items: null, error: `'${node.name}' is not a directory` };
        }

        const children = node.children ? Object.values(node.children) : [];
        // Sort: directories first, then files alphabetically
        children.sort((a, b) => {
          if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

        return { items: children };
      },

      generateTree: (rawPath: string, cwdParts: string[]) => {
        const fullParts = normalizePathParts(rawPath, cwdParts);
        const node = get().getNode(fullParts);

        if (!node) {
          return { treeString: "", error: "No such file or directory" };
        }

        let dirCount = 0;
        let fileCount = 0;

        function buildLines(curr: VFSNode, prefix: string): string[] {
          if (!curr.children) return [];
          const keys = Object.keys(curr.children).sort((a, b) => {
            const nodeA = curr.children![a];
            const nodeB = curr.children![b];
            if (nodeA.type !== nodeB.type) return nodeA.type === "dir" ? -1 : 1;
            return a.localeCompare(b);
          });

          const lines: string[] = [];
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const child = curr.children[key];
            const isLast = i === keys.length - 1;
            const branch = isLast ? "└── " : "├── ";
            const nextPrefix = prefix + (isLast ? "    " : "│   ");

            if (child.type === "dir") {
              dirCount++;
              lines.push(`${prefix}${branch}${child.name}/`);
              lines.push(...buildLines(child, nextPrefix));
            } else {
              fileCount++;
              lines.push(`${prefix}${branch}${child.name}`);
            }
          }
          return lines;
        }

        const lines = [node.name === "/" ? "/" : node.name, ...buildLines(node, "")];
        lines.push(`\n${dirCount} directories, ${fileCount} files`);
        return { treeString: lines.join("\n") };
      },

      resetFS: () => {
        set({ root: createDefaultFS() });
      },
    }),
    {
      name: "shellspace-vfs-storage-v1",
      partialize: (state) => ({ root: state.root }),
    }
  )
);
