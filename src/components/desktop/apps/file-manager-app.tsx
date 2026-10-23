"use client";

import React, { useState } from "react";
import {
  Folder,
  FileText,
  FileCode,
  Plus,
  Trash2,
  ChevronRight,
  HardDrive,
  Download,
  Eye,
} from "lucide-react";

interface VirtualFile {
  name: string;
  type: "file" | "dir";
  size: string;
  modified: string;
  permissions: string;
  content?: string;
}

const SAMPLE_FILES: Record<string, VirtualFile[]> = {
  workspace: [
    {
      name: "welcome.sh",
      type: "file",
      size: "324 B",
      modified: "Oct 23, 11:30 AM",
      permissions: "-rwxr-xr-x",
      content: `#!/usr/bin/env bash\n# Welcome to ShellSpace Linux Laboratory\necho "========================================"\necho "  Welcome to ShellSpace Virtual Linux Lab!  "\necho "========================================"\necho "System: Linux ShellSpace 6.8.0-shellspace x86_64"\necho "Student: $(whoami)"\necho "Date: $(date)"\necho "Ready for OS concepts and Bash practice."\n`,
    },
    {
      name: "notes.txt",
      type: "file",
      size: "412 B",
      modified: "Oct 23, 11:25 AM",
      permissions: "-rw-r--r--",
      content: `Operating Systems Concepts Summary:\n1. Process Management: Process States (New, Ready, Running, Waiting, Terminated)\n2. CPU Scheduling: FCFS, SJF, SRTF, Priority, Round Robin\n3. Synchronization: Semaphores, Mutex, Deadlocks (Coffman conditions)\n4. Memory Management: Paging, Segmentation, Page Faults, LRU/FIFO\n5. File Systems: Inodes, Allocation methods (Contiguous, Linked, Indexed)\n`,
    },
    {
      name: "samples",
      type: "dir",
      size: "4.0 KB",
      modified: "Oct 23, 11:15 AM",
      permissions: "drwxr-xr-x",
    },
  ],
  samples: [
    {
      name: "cpu_fcfs.sh",
      type: "file",
      size: "680 B",
      modified: "Oct 23, 11:10 AM",
      permissions: "-rwxr-xr-x",
      content: `#!/bin/bash\n# FCFS Algorithm in Bash\necho "Computing FCFS..."\n`,
    },
    {
      name: "fibonacci.sh",
      type: "file",
      size: "260 B",
      modified: "Oct 23, 11:05 AM",
      permissions: "-rwxr-xr-x",
      content: `#!/bin/bash\n# Fibonacci in Bash\necho "Fibonacci demo"\n`,
    },
  ],
};

export function FileManagerApp() {
  const [currentFolder, setCurrentFolder] = useState<string>("workspace");
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);

  const files = SAMPLE_FILES[currentFolder] || [];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 font-sans overflow-hidden">
      {/* Breadcrumb Header */}
      <div className="h-10 px-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <HardDrive size={13} className="text-blue-600" />
          <span
            onClick={() => setCurrentFolder("workspace")}
            className="cursor-pointer hover:text-blue-600 font-medium"
          >
            workspace
          </span>
          {currentFolder !== "workspace" && (
            <>
              <ChevronRight size={12} className="text-slate-400" />
              <span className="font-semibold text-slate-800">{currentFolder}</span>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          {files.length} items
        </div>
      </div>

      {/* Main Content: Files List & Preview Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-[11px] sticky top-0">
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Size</th>
                <th className="py-2.5 px-4">Permissions</th>
                <th className="py-2.5 px-4">Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map((file) => {
                const isSelected = selectedFile?.name === file.name;
                const isDir = file.type === "dir";

                return (
                  <tr
                    key={file.name}
                    onClick={() => {
                      if (isDir) {
                        setCurrentFolder(file.name);
                        setSelectedFile(null);
                      } else {
                        setSelectedFile(file);
                      }
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50/80" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-2.5 px-4 flex items-center gap-2 font-medium text-slate-800">
                      {isDir ? (
                        <Folder size={16} className="text-amber-500 fill-amber-100" />
                      ) : file.name.endsWith(".sh") ? (
                        <FileCode size={16} className="text-emerald-600" />
                      ) : (
                        <FileText size={16} className="text-blue-600" />
                      )}
                      <span>{file.name}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{file.size}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{file.permissions}</td>
                    <td className="py-2.5 px-4 text-slate-500">{file.modified}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Preview Panel */}
        {selectedFile && selectedFile.content && (
          <div className="w-72 bg-slate-50 border-l border-slate-200 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-slate-800 truncate">
                {selectedFile.name}
              </span>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 font-mono text-[11px] leading-relaxed text-slate-800 overflow-auto whitespace-pre-wrap">
              {selectedFile.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
