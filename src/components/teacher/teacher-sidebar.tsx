"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Monitor,
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Settings,
  Plus,
  ClipboardList,
  ChevronRight,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/teacher/dashboard", icon: Monitor, label: "Overview" },
  { href: "/teacher/assignments", icon: BookOpen, label: "Assignments" },
  { href: "/teacher/create-assignment", icon: Plus, label: "New Assignment" },
  { href: "/teacher/submissions", icon: ClipboardList, label: "Submission Queue" },
  { href: "/teacher/students", icon: Users, label: "Students" },
  { href: "/teacher/courses", icon: GraduationCap, label: "My Courses" },
  { href: "/teacher/grades", icon: FileText, label: "Grades" },
  { href: "/teacher/reports", icon: BarChart3, label: "Reports" },
  { href: "/teacher/settings", icon: Settings, label: "Settings" },
];

interface TeacherSidebarProps {
  user: { id: string; name: string; email: string; role: string };
}

export function TeacherSidebar({ user }: TeacherSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-gray-900 flex flex-col flex-shrink-0 border-r border-gray-800">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <GraduationCap size={16} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-sm">ShellSpace</span>
          <p className="text-xs text-gray-500">Teacher Portal</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                isActive ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon size={16} className={isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={12} className="text-violet-200" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500">Teacher</p>
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
