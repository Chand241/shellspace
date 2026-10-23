"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Bell,
  LogOut,
  User,
  ChevronDown,
  Monitor,
} from "lucide-react";
import { getInitials, getRoleBadgeClass } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface TopBarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    desktop: "Virtual Desktop",
    terminal: "Linux Terminal",
    "bash-studio": "Bash Studio",
    files: "File Manager",
    labs: "OS Lab",
    assignments: "Assignments",
    submissions: "My Submissions",
    grades: "Grades & Feedback",
    settings: "Settings",
    help: "Help & Documentation",
  };
  return titles[last] ?? "ShellSpace";
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const title = getPageTitle(pathname);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Desktop shortcut */}
        <Link
          href="/student/desktop"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Monitor size={15} />
          <span className="hidden sm:block">Desktop</span>
        </Link>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-gray-500" />
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-none">{user.name.split(" ")[0]}</p>
              <span className={`text-xs badge mt-0.5 ${getRoleBadgeClass(user.role)}`}>
                {user.role}
              </span>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50 animate-scale-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <Link
                href="/student/settings"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <User size={15} className="text-gray-400" />
                Profile & Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
