"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Monitor,
  Terminal,
  Code2,
  BookOpen,
  FolderOpen,
  FileText,
  Star,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Clock,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/student/desktop", icon: Monitor, label: "Virtual Desktop" },
  { href: "/student/terminal", icon: Terminal, label: "Linux Terminal" },
  { href: "/student/bash-studio", icon: Code2, label: "Bash Studio" },
  { href: "/student/files", icon: FolderOpen, label: "File Manager" },
  { divider: true, label: "Learning" },
  { href: "/student/labs", icon: BookOpen, label: "OS Lab" },
  { href: "/student/assignments", icon: FileText, label: "Assignments" },
  { href: "/student/submissions", icon: Star, label: "My Submissions" },
  { href: "/student/grades", icon: BarChart3, label: "Grades & Feedback" },
  { divider: true, label: "Account" },
  { href: "/student/history", icon: Clock, label: "Activity History" },
  { href: "/student/settings", icon: Settings, label: "Settings" },
  { href: "/student/help", icon: HelpCircle, label: "Help & Docs" },
];

interface StudentSidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function StudentSidebar({ user }: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-gray-900 flex flex-col flex-shrink-0 border-r border-gray-800">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-800 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Monitor size={16} className="text-white" />
        </div>
        <span className="font-bold text-white text-lg">ShellSpace</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {navItems.map((item, i) => {
          if ("divider" in item && item.divider) {
            return (
              <div key={i} className="px-2 pt-4 pb-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            );
          }

          if (!("href" in item) || !item.href) return null;

          const href = item.href as string;
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.icon && (
                <item.icon
                  size={16}
                  className={isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"}
                />
              )}
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={12} className="text-blue-200" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-800 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.role}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700"
            aria-label="Sign out"
          >
            <LogOut size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}
