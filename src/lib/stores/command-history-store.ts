import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CommandLogEntry {
  id: string;
  command: string;
  cwd: string;
  dateStr: string; // e.g. "Oct 23, 2026"
  timeStr: string; // e.g. "05:25:30 PM"
  timestamp: number;
}

export function formatDateLabel(timestamp: number): string {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatted = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

  if (isToday) return `Today — ${formatted}`;
  if (isYesterday) return `Yesterday — ${formatted}`;
  return formatted;
}

interface CommandHistoryState {
  commands: CommandLogEntry[];
  addCommand: (command: string, cwd: string) => void;
  getGroupedByDay: () => Record<string, CommandLogEntry[]>;
}

export const useCommandHistoryStore = create<CommandHistoryState>()(
  persist(
    (set, get) => ({
      commands: [],

      addCommand: (command: string, cwd: string) => {
        const trimmed = command.trim();
        if (!trimmed) return;

        const now = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        const entry: CommandLogEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          command: trimmed,
          cwd,
          dateStr,
          timeStr,
          timestamp: Date.now(),
        };

        set((state) => ({
          commands: [...state.commands, entry],
        }));
      },

      getGroupedByDay: () => {
        const list = get().commands;
        const groups: Record<string, CommandLogEntry[]> = {};

        for (const item of list) {
          const label = formatDateLabel(item.timestamp);
          if (!groups[label]) {
            groups[label] = [];
          }
          groups[label].push(item);
        }

        return groups;
      },
    }),
    {
      name: "shellspace-command-logs-v1",
    }
  )
);
