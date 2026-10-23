import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppId,
  WindowInstance,
  DesktopState,
  WindowPosition,
  WindowSize,
} from "@/types/desktop";

const DEFAULT_WINDOW_SIZES: Record<AppId, WindowSize> = {
  terminal: { width: 720, height: 460 },
  "bash-studio": { width: 900, height: 560 },
  "file-manager": { width: 780, height: 480 },
  "text-editor": { width: 680, height: 460 },
  labs: { width: 960, height: 600 },
  assignments: { width: 880, height: 560 },
  "process-manager": { width: 640, height: 440 },
  "system-info": { width: 540, height: 420 },
  settings: { width: 600, height: 460 },
  calculator: { width: 320, height: 420 },
  help: { width: 700, height: 500 },
};

const DEFAULT_TITLES: Record<AppId, string> = {
  terminal: "Linux Terminal",
  "bash-studio": "Bash Studio & IDE",
  "file-manager": "File Explorer",
  "text-editor": "Text Editor",
  labs: "OS Lab Experiments",
  assignments: "Lab Assignments",
  "process-manager": "Task Manager (Processes)",
  "system-info": "ShellSpace System Specs",
  settings: "Desktop Settings",
  calculator: "Calculator",
  help: "Documentation & Cheat Sheet",
};

interface DesktopActions {
  openWindow: (
    appId: AppId,
    options?: {
      title?: string;
      meta?: Record<string, unknown>;
      size?: WindowSize;
    }
  ) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize) => void;
  toggleStartMenu: () => void;
  setStartMenuOpen: (open: boolean) => void;
  setWallpaper: (wallpaper: string) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleSound: () => void;
}

export type DesktopStore = DesktopState & DesktopActions;

export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set, get) => ({
      windows: {},
      activeWindowId: null,
      minimizedWindowIds: [],
      maxZIndex: 10,
      startMenuOpen: false,
      theme: "light",
      wallpaper: "wallpaper-mesh",
      soundEnabled: true,

      openWindow: (appId, options = {}) => {
        const state = get();
        // Check if a single-instance window already exists
        const existingWindow = Object.values(state.windows).find(
          (w) => w.appId === appId
        );

        if (existingWindow) {
          // If minimized, restore it and focus
          set((s) => ({
            activeWindowId: existingWindow.id,
            maxZIndex: s.maxZIndex + 1,
            startMenuOpen: false,
            minimizedWindowIds: s.minimizedWindowIds.filter(
              (id) => id !== existingWindow.id
            ),
            windows: {
              ...s.windows,
              [existingWindow.id]: {
                ...existingWindow,
                isMinimized: false,
                zIndex: s.maxZIndex + 1,
              },
            },
          }));
          return existingWindow.id;
        }

        const id = `${appId}-${Date.now()}`;
        const defaultSize = DEFAULT_WINDOW_SIZES[appId] || { width: 640, height: 440 };
        const size = options.size || defaultSize;
        const offset = (Object.keys(state.windows).length % 6) * 28;

        const newWindow: WindowInstance = {
          id,
          appId,
          title: options.title || DEFAULT_TITLES[appId] || appId,
          isMinimized: false,
          isMaximized: false,
          position: {
            x: Math.max(40, 80 + offset),
            y: Math.max(30, 50 + offset),
          },
          size,
          zIndex: state.maxZIndex + 1,
          meta: options.meta,
        };

        set((s) => ({
          windows: { ...s.windows, [id]: newWindow },
          activeWindowId: id,
          maxZIndex: s.maxZIndex + 1,
          startMenuOpen: false,
        }));

        return id;
      },

      closeWindow: (id) => {
        set((state) => {
          const newWindows = { ...state.windows };
          delete newWindows[id];

          const remainingIds = Object.keys(newWindows);
          let nextActiveId: string | null = null;
          if (remainingIds.length > 0) {
            nextActiveId = remainingIds.reduce((prev, curr) =>
              newWindows[curr].zIndex > newWindows[prev].zIndex ? curr : prev
            );
          }

          return {
            windows: newWindows,
            activeWindowId: nextActiveId,
            minimizedWindowIds: state.minimizedWindowIds.filter(
              (wid) => wid !== id
            ),
          };
        });
      },

      minimizeWindow: (id) => {
        set((state) => {
          const target = state.windows[id];
          if (!target) return state;

          const updated = {
            ...state.windows,
            [id]: { ...target, isMinimized: true },
          };

          const remainingVisible = Object.values(updated).filter(
            (w) => !w.isMinimized && w.id !== id
          );

          let nextActiveId: string | null = null;
          if (remainingVisible.length > 0) {
            nextActiveId = remainingVisible.reduce((prev, curr) =>
              curr.zIndex > prev.zIndex ? curr : prev
            ).id;
          }

          return {
            windows: updated,
            activeWindowId: nextActiveId,
            minimizedWindowIds: [...state.minimizedWindowIds, id],
          };
        });
      },

      maximizeWindow: (id) => {
        set((state) => {
          const target = state.windows[id];
          if (!target) return state;

          const isMaximized = !target.isMaximized;

          return {
            windows: {
              ...state.windows,
              [id]: {
                ...target,
                isMaximized,
                prevPosition: !isMaximized ? target.prevPosition : target.position,
                prevSize: !isMaximized ? target.prevSize : target.size,
                position: isMaximized ? { x: 0, y: 0 } : target.prevPosition || { x: 80, y: 50 },
                size: isMaximized
                  ? { width: window.innerWidth, height: window.innerHeight - 48 }
                  : target.prevSize || DEFAULT_WINDOW_SIZES[target.appId],
              },
            },
          };
        });
      },

      focusWindow: (id) => {
        set((state) => {
          const target = state.windows[id];
          if (!target) return state;

          const newZ = state.maxZIndex + 1;
          return {
            activeWindowId: id,
            maxZIndex: newZ,
            startMenuOpen: false,
            minimizedWindowIds: state.minimizedWindowIds.filter(
              (wid) => wid !== id
            ),
            windows: {
              ...state.windows,
              [id]: {
                ...target,
                isMinimized: false,
                zIndex: newZ,
              },
            },
          };
        });
      },

      updateWindowPosition: (id, position) => {
        set((state) => {
          const target = state.windows[id];
          if (!target) return state;
          return {
            windows: {
              ...state.windows,
              [id]: { ...target, position },
            },
          };
        });
      },

      updateWindowSize: (id, size) => {
        set((state) => {
          const target = state.windows[id];
          if (!target) return state;
          return {
            windows: {
              ...state.windows,
              [id]: { ...target, size },
            },
          };
        });
      },

      toggleStartMenu: () => {
        set((state) => ({ startMenuOpen: !state.startMenuOpen }));
      },

      setStartMenuOpen: (open) => {
        set({ startMenuOpen: open });
      },

      setWallpaper: (wallpaper) => {
        set({ wallpaper });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },
    }),
    {
      name: "shellspace-desktop-storage",
      partialize: (state) => ({
        theme: state.theme,
        wallpaper: state.wallpaper,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);
