"use client";

import React, { useState, useRef } from "react";
import {
  Folder,
  FolderPlus,
  FilePlus,
  FileText,
  FileCode,
  Trash2,
  Edit3,
  Save,
  Download,
  Upload,
  ChevronRight,
  HardDrive,
  ArrowUp,
  RotateCcw,
  Check,
  X,
  Search,
  Eye,
  Terminal,
  Play,
  FileSpreadsheet,
} from "lucide-react";
import {
  useVFSStore,
  VFSNode,
  formatSize,
  formatPathDisplay,
  normalizePathParts,
} from "@/lib/stores/vfs-store";
import { useDesktopStore } from "@/lib/stores/desktop-store";

export function FileManagerApp() {
  const {
    root,
    getNode,
    mkdir,
    touch,
    writeFile,
    deleteNode,
    renameNode,
    resetFS,
  } = useVFSStore();

  const { openWindow } = useDesktopStore();

  const [currentPath, setCurrentPath] = useState<string[]>([
    "home",
    "student",
    "workspace",
  ]);

  const [selectedItem, setSelectedItem] = useState<VFSNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialogs & Inline state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const [editingFile, setEditingFile] = useState<{
    name: string;
    content: string;
  } | null>(null);

  const [renamingItem, setRenamingItem] = useState<{
    oldName: string;
    newName: string;
  } | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Resolve current folder node
  const currentNode = getNode(currentPath);
  const items: VFSNode[] = currentNode?.children
    ? Object.values(currentNode.children).sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
    : [];

  const filteredItems = searchQuery
    ? items.filter((it) =>
        it.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  // Folder navigation
  const navigateTo = (pathParts: string[]) => {
    setCurrentPath(pathParts);
    setSelectedItem(null);
    setEditingFile(null);
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
  };

  const navigateUp = () => {
    if (currentPath.length > 0) {
      navigateTo(currentPath.slice(0, -1));
    }
  };

  // Actions
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    const res = mkdir(trimmed, currentPath, { recursive: true });
    if (res.success) {
      showStatus(`Created folder "${trimmed}"`);
      setNewFolderName("");
      setIsCreatingFolder(false);
    } else {
      showStatus(res.error || "Failed to create folder", true);
    }
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFileName.trim();
    if (!trimmed) return;

    let defaultContent = "";
    if (trimmed.endsWith(".c")) {
      defaultContent = `#include <stdio.h>\n\nint main() {\n    printf("Hello from OS Lab!\\\\n");\n    return 0;\n}\n`;
    } else if (trimmed.endsWith(".sh")) {
      defaultContent = `#!/bin/bash\necho "Running script: ${trimmed}"\n`;
    }

    const res = touch(trimmed, currentPath, defaultContent);
    if (res.success) {
      showStatus(`Created file "${trimmed}"`);
      setNewFileName("");
      setIsCreatingFile(false);
      // Auto open for editing
      setEditingFile({ name: trimmed, content: defaultContent });
    } else {
      showStatus(res.error || "Failed to create file", true);
    }
  };

  const handleSaveFile = () => {
    if (!editingFile) return;
    const res = writeFile(
      editingFile.name,
      currentPath,
      editingFile.content,
      false
    );
    if (res.success) {
      showStatus(`Saved "${editingFile.name}" successfully!`);
      // Update selected item
      const updated = getNode([...currentPath, editingFile.name]);
      if (updated) setSelectedItem(updated);
    } else {
      showStatus(res.error || "Failed to save file", true);
    }
  };

  const handleDelete = (item: VFSNode) => {
    if (
      confirm(
        `Are you sure you want to delete ${
          item.type === "dir" ? "folder and its contents" : "file"
        } "${item.name}"?`
      )
    ) {
      const res = deleteNode(item.name, currentPath, true);
      if (res.success) {
        showStatus(`Deleted "${item.name}"`);
        if (selectedItem?.name === item.name) setSelectedItem(null);
        if (editingFile?.name === item.name) setEditingFile(null);
      } else {
        showStatus(res.error || "Failed to delete", true);
      }
    }
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingItem) return;
    const trimmed = renamingItem.newName.trim();
    if (!trimmed || trimmed === renamingItem.oldName) {
      setRenamingItem(null);
      return;
    }

    const res = renameNode(renamingItem.oldName, trimmed, currentPath);
    if (res.success) {
      showStatus(`Renamed to "${trimmed}"`);
      setRenamingItem(null);
    } else {
      showStatus(res.error || "Failed to rename", true);
    }
  };

  const handleDownload = (item: VFSNode) => {
    if (item.type === "dir") {
      showStatus("Downloading directory not supported directly", true);
      return;
    }
    const blob = new Blob([item.content || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = writeFile(file.name, currentPath, content || "", false);
      if (res.success) {
        showStatus(`Uploaded "${file.name}"`);
      } else {
        showStatus(res.error || "Upload failed", true);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".c") || fileName.endsWith(".cpp") || fileName.endsWith(".h")) {
      return <FileCode size={16} className="text-blue-500" />;
    }
    if (fileName.endsWith(".sh") || fileName.endsWith(".bash")) {
      return <FileCode size={16} className="text-emerald-500" />;
    }
    if (fileName.endsWith(".csv") || fileName.endsWith(".json")) {
      return <FileSpreadsheet size={16} className="text-amber-500" />;
    }
    return <FileText size={16} className="text-slate-500" />;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 font-sans overflow-hidden select-none">
      {/* Hidden file upload input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Toolbar */}
      <div className="h-12 px-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shadow-xs">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center gap-1.5 overflow-hidden flex-1">
          <button
            onClick={navigateUp}
            disabled={currentPath.length === 0}
            title="Go to parent folder (cd ..)"
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors"
          >
            <ArrowUp size={15} />
          </button>

          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 max-w-md overflow-x-auto whitespace-nowrap">
            <HardDrive size={13} className="text-blue-600 shrink-0" />
            <button
              onClick={() => navigateTo([])}
              className="hover:text-blue-600 font-semibold"
            >
              /
            </button>
            {currentPath.map((segment, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={11} className="text-slate-400 shrink-0" />
                <button
                  onClick={() => navigateTo(currentPath.slice(0, idx + 1))}
                  className={`hover:text-blue-600 ${
                    idx === currentPath.length - 1
                      ? "font-bold text-slate-900"
                      : "text-slate-600"
                  }`}
                >
                  {segment}
                </button>
              </React.Fragment>
            ))}
          </div>

          {statusMessage && (
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium truncate max-w-xs ${
                statusMessage.isError
                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              }`}
            >
              {statusMessage.text}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              setIsCreatingFolder(true);
              setIsCreatingFile(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Create a new folder in this directory"
          >
            <FolderPlus size={14} className="text-amber-500" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => {
              setIsCreatingFile(true);
              setIsCreatingFolder(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Create a new file in this directory"
          >
            <FilePlus size={14} className="text-blue-600" />
            <span>New File</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Upload file from your computer"
          >
            <Upload size={14} className="text-indigo-600" />
            <span>Upload</span>
          </button>

          <button
            onClick={() => openWindow("terminal")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Open Linux Terminal here"
          >
            <Terminal size={14} className="text-emerald-400" />
            <span>Terminal</span>
          </button>

          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2 py-1 text-xs bg-slate-100 rounded-lg border border-transparent focus:border-blue-400 focus:bg-white focus:outline-none w-28 md:w-36"
            />
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Quick Navigation Sidebar */}
        <div className="w-48 bg-slate-100/70 border-r border-slate-200 p-2.5 flex flex-col justify-between shrink-0">
          <div className="space-y-1 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Favorites
            </div>
            <button
              onClick={() => navigateTo(["home", "student", "workspace"])}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors font-medium ${
                currentPath.join("/") === "home/student/workspace"
                  ? "bg-blue-100/70 text-blue-800"
                  : "text-slate-700 hover:bg-slate-200/60"
              }`}
            >
              <Folder size={14} className="text-amber-500 fill-amber-100" />
              <span>Workspace</span>
            </button>

            <button
              onClick={() =>
                navigateTo(["home", "student", "workspace", "os_labs"])
              }
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors font-medium ${
                currentPath.join("/").includes("os_labs")
                  ? "bg-blue-100/70 text-blue-800"
                  : "text-slate-700 hover:bg-slate-200/60"
              }`}
            >
              <Folder size={14} className="text-emerald-600 fill-emerald-100" />
              <span>OS Labs</span>
            </button>

            <button
              onClick={() => navigateTo(["home", "student", "Desktop"])}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors font-medium ${
                currentPath.join("/") === "home/student/Desktop"
                  ? "bg-blue-100/70 text-blue-800"
                  : "text-slate-700 hover:bg-slate-200/60"
              }`}
            >
              <Folder size={14} className="text-indigo-500 fill-indigo-100" />
              <span>Desktop</span>
            </button>

            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-3 pb-1">
              System
            </div>
            <button
              onClick={() => navigateTo([])}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors font-medium ${
                currentPath.length === 0
                  ? "bg-blue-100/70 text-blue-800"
                  : "text-slate-700 hover:bg-slate-200/60"
              }`}
            >
              <HardDrive size={14} className="text-slate-500" />
              <span>Root (/)</span>
            </button>

            <button
              onClick={() => navigateTo(["tmp"])}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors font-medium ${
                currentPath.join("/") === "tmp"
                  ? "bg-blue-100/70 text-blue-800"
                  : "text-slate-700 hover:bg-slate-200/60"
              }`}
            >
              <Folder size={14} className="text-slate-500" />
              <span>/tmp</span>
            </button>
          </div>
        </div>

        {/* Center: File List / Grid Table */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Creation prompts */}
          {isCreatingFolder && (
            <form
              onSubmit={handleCreateFolder}
              className="bg-amber-50/70 border-b border-amber-200 p-2.5 flex items-center gap-2 text-xs"
            >
              <FolderPlus size={16} className="text-amber-600" />
              <span className="font-semibold text-slate-800">
                New Folder Name:
              </span>
              <input
                type="text"
                autoFocus
                placeholder="e.g. lab_task_1 or nested/sub/folder"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="px-2 py-1 bg-white border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 flex-1 max-w-xs font-mono"
              />
              <button
                type="submit"
                className="p-1 bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
              >
                <X size={14} />
              </button>
            </form>
          )}

          {isCreatingFile && (
            <form
              onSubmit={handleCreateFile}
              className="bg-blue-50/70 border-b border-blue-200 p-2.5 flex items-center gap-2 text-xs"
            >
              <FilePlus size={16} className="text-blue-600" />
              <span className="font-semibold text-slate-800">
                New File Name:
              </span>
              <input
                type="text"
                autoFocus
                placeholder="e.g. process.c or script.sh"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="px-2 py-1 bg-white border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 max-w-xs font-mono"
              />
              <button
                type="submit"
                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingFile(false)}
                className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
              >
                <X size={14} />
              </button>
            </form>
          )}

          {/* Items Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] sticky top-0 z-10">
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3">Permissions</th>
                  <th className="py-2 px-3">Modified</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400 text-xs italic"
                    >
                      Empty folder. Click &ldquo;New Folder&rdquo; or &ldquo;New File&rdquo; to add items.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedItem?.name === item.name;
                    const isDir = item.type === "dir";

                    return (
                      <tr
                        key={item.name}
                        onClick={() => setSelectedItem(item)}
                        onDoubleClick={() => {
                          if (isDir) {
                            navigateTo([...currentPath, item.name]);
                          } else {
                            setEditingFile({
                              name: item.name,
                              content: item.content || "",
                            });
                          }
                        }}
                        className={`cursor-pointer group transition-colors ${
                          isSelected
                            ? "bg-blue-50/80"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="py-2.5 px-4 flex items-center gap-2.5 font-medium text-slate-800">
                          {isDir ? (
                            <Folder
                              size={17}
                              className="text-amber-500 fill-amber-100 shrink-0"
                            />
                          ) : (
                            getFileIcon(item.name)
                          )}

                          {renamingItem?.oldName === item.name ? (
                            <form
                              onSubmit={handleRename}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1"
                            >
                              <input
                                type="text"
                                autoFocus
                                value={renamingItem.newName}
                                onChange={(e) =>
                                  setRenamingItem({
                                    ...renamingItem,
                                    newName: e.target.value,
                                  })
                                }
                                className="px-1.5 py-0.5 border border-blue-400 rounded text-xs font-mono"
                              />
                              <button
                                type="submit"
                                className="p-0.5 text-emerald-600"
                              >
                                <Check size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRenamingItem(null)}
                                className="p-0.5 text-rose-500"
                              >
                                <X size={13} />
                              </button>
                            </form>
                          ) : (
                            <span className="truncate">{item.name}</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {isDir ? "-" : formatSize(item.size)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                          {item.permissions || (isDir ? "drwxr-xr-x" : "-rw-r--r--")}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {item.modified}
                        </td>

                        <td
                          className="py-2.5 px-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isDir && (
                              <button
                                onClick={() =>
                                  setEditingFile({
                                    name: item.name,
                                    content: item.content || "",
                                  })
                                }
                                title="Edit file code"
                                className="p-1 hover:bg-slate-200 rounded text-slate-600"
                              >
                                <Edit3 size={13} />
                              </button>
                            )}

                            {!isDir && (
                              <button
                                onClick={() => handleDownload(item)}
                                title="Download to PC"
                                className="p-1 hover:bg-slate-200 rounded text-slate-600"
                              >
                                <Download size={13} />
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setRenamingItem({
                                  oldName: item.name,
                                  newName: item.name,
                                })
                              }
                              title="Rename"
                              className="p-1 hover:bg-slate-200 rounded text-slate-600"
                            >
                              <span className="text-[10px] font-bold">R</span>
                            </button>

                            <button
                              onClick={() => handleDelete(item)}
                              title="Delete"
                              className="p-1 hover:bg-rose-100 rounded text-rose-600"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Status bar */}
          <div className="h-7 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              {selectedItem ? ` • Selected: ${selectedItem.name}` : ""}
            </div>
            <div className="font-mono text-slate-400">
              Path: {formatPathDisplay(currentPath)}
            </div>
          </div>
        </div>

        {/* Right Pane: Code / Text Editor or Preview */}
        {editingFile ? (
          <div className="w-80 md:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0">
            {/* Editor Header */}
            <div className="h-10 px-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                <FileCode size={14} className="text-blue-600" />
                <span className="truncate">{editingFile.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSaveFile}
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <Save size={12} />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setEditingFile(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Editor Textarea */}
            <div className="flex-1 p-2 bg-slate-900 overflow-hidden flex flex-col">
              <textarea
                value={editingFile.content}
                onChange={(e) =>
                  setEditingFile({ ...editingFile, content: e.target.value })
                }
                spellCheck={false}
                className="w-full flex-1 bg-transparent text-emerald-400 font-mono text-xs leading-relaxed resize-none focus:outline-none p-1"
                placeholder="Type code or text here..."
              />
            </div>

            <div className="p-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Lines: {editingFile.content.split("\n").length}</span>
              <span>Bytes: {editingFile.content.length}</span>
            </div>
          </div>
        ) : selectedItem && selectedItem.type === "file" && selectedItem.content ? (
          <div className="w-72 bg-slate-50 border-l border-slate-200 p-3 flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                <Eye size={13} className="text-blue-600" />
                <span className="truncate">{selectedItem.name}</span>
              </div>
              <button
                onClick={() =>
                  setEditingFile({
                    name: selectedItem.name,
                    content: selectedItem.content || "",
                  })
                }
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Edit
              </button>
            </div>
            <pre className="flex-1 bg-white border border-slate-200 rounded-lg p-2.5 font-mono text-[11px] leading-relaxed text-slate-800 overflow-auto whitespace-pre-wrap">
              {selectedItem.content}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
