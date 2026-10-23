export type AppId =
  | "terminal"
  | "bash-studio"
  | "file-manager"
  | "text-editor"
  | "labs"
  | "assignments"
  | "process-manager"
  | "system-info"
  | "settings"
  | "calculator"
  | "help";

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowInstance {
  id: string;
  appId: AppId;
  title: string;
  icon?: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: WindowPosition;
  size: WindowSize;
  prevPosition?: WindowPosition;
  prevSize?: WindowSize;
  zIndex: number;
  meta?: Record<string, unknown>;
}

export interface DesktopIconItem {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  defaultPosition?: { row: number; col: number };
}

export interface DesktopState {
  windows: Record<string, WindowInstance>;
  activeWindowId: string | null;
  minimizedWindowIds: string[];
  maxZIndex: number;
  startMenuOpen: boolean;
  theme: "light" | "dark";
  wallpaper: string;
  soundEnabled: boolean;
}
