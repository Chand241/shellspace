"use client";

import React from "react";
import { useDesktopStore } from "@/lib/stores/desktop-store";
import { Image, Volume2, Moon, Sun, Check, Sparkles } from "lucide-react";

const WALLPAPERS = [
  {
    id: "wallpaper-mesh",
    name: "Aura Mesh (Light)",
    preview: "bg-gradient-to-tr from-blue-100 via-sky-50 to-indigo-100",
  },
  {
    id: "wallpaper-slate",
    name: "Clean Slate",
    preview: "bg-gradient-to-br from-slate-100 via-zinc-100 to-slate-200",
  },
  {
    id: "wallpaper-emerald",
    name: "Mint Linux",
    preview: "bg-gradient-to-tr from-emerald-100 via-teal-50 to-cyan-100",
  },
  {
    id: "wallpaper-sunset",
    name: "Amber Sunset",
    preview: "bg-gradient-to-tr from-amber-100 via-orange-50 to-rose-100",
  },
  {
    id: "wallpaper-dark",
    name: "Obsidian Night",
    preview: "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950",
  },
];

export function DesktopSettingsApp() {
  const { wallpaper, setWallpaper, soundEnabled, toggleSound } = useDesktopStore();

  return (
    <div className="flex-1 p-6 bg-slate-50 font-sans overflow-y-auto">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Wallpapers section */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Image size={16} className="text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Desktop Wallpaper
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {WALLPAPERS.map((wp) => {
              const isSelected = wallpaper === wp.id;
              return (
                <button
                  key={wp.id}
                  onClick={() => setWallpaper(wp.id)}
                  className={`group relative rounded-xl border-2 p-2 flex flex-col items-center gap-2 transition-all ${
                    isSelected
                      ? "border-blue-600 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-full h-16 rounded-lg ${wp.preview} flex items-center justify-center relative overflow-hidden`}
                  >
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-700 truncate w-full text-center">
                    {wp.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio / System Preferences */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 size={16} className="text-violet-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Sound & Experience
            </h3>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <div className="text-xs font-semibold text-slate-800">
                System Sound Effects
              </div>
              <div className="text-[11px] text-slate-400">
                Play click and terminal bell alerts
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                soundEnabled ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
