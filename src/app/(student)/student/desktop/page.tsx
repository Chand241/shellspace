import { requireRole } from "@/lib/auth-helpers";
import { DesktopContainer } from "@/components/desktop/desktop-container";
import Link from "next/link";
import { Maximize2, Monitor } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtual Desktop",
};

export default async function StudentDesktopPage() {
  const session = await requireRole(["STUDENT", "ADMIN"]);

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] -m-6 relative rounded-none overflow-hidden">
      <div className="absolute top-3 right-4 z-50">
        <Link
          href="/desktop"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white shadow-sm border border-slate-200 transition-all hover:scale-105"
        >
          <Maximize2 size={13} />
          <span>Launch Fullscreen OS</span>
        </Link>
      </div>
      <DesktopContainer user={session.user} />
    </div>
  );
}
