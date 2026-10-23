"use client";

import { useEffect, useState } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivityType =
  | "LOGIN"
  | "LOGOUT"
  | "TERMINAL_COMMAND"
  | "ASSIGNMENT_OPEN"
  | "ASSIGNMENT_SUBMIT"
  | "ASSIGNMENT_VIEW"
  | "FILE_CREATE"
  | "FILE_EDIT"
  | "FILE_DELETE"
  | "PROFILE_UPDATE"
  | "SUBMISSION_GRADED";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  date: string;
  createdAt: string;
}

interface DayGroup {
  date: string;
  label: string;
  count: number;
  items: ActivityItem[];
}

interface Stats {
  totalActivities: number;
  totalDays: number;
  typeBreakdown: Record<string, number>;
}

// ─── Activity Config ──────────────────────────────────────────────────────────

const activityConfig: Record<
  ActivityType,
  { icon: string; color: string; bg: string; label: string }
> = {
  LOGIN: {
    icon: "🔑",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    label: "Login",
  },
  LOGOUT: {
    icon: "🚪",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
    label: "Logout",
  },
  TERMINAL_COMMAND: {
    icon: "💻",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    label: "Terminal",
  },
  ASSIGNMENT_OPEN: {
    icon: "📂",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    label: "Opened",
  },
  ASSIGNMENT_SUBMIT: {
    icon: "✅",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    label: "Submitted",
  },
  ASSIGNMENT_VIEW: {
    icon: "👁️",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    label: "Viewed",
  },
  FILE_CREATE: {
    icon: "📄",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    label: "File Created",
  },
  FILE_EDIT: {
    icon: "✏️",
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    label: "File Edited",
  },
  FILE_DELETE: {
    icon: "🗑️",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    label: "File Deleted",
  },
  PROFILE_UPDATE: {
    icon: "👤",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.1)",
    label: "Profile Updated",
  },
  SUBMISSION_GRADED: {
    icon: "🎯",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.1)",
    label: "Graded",
  },
};

// ─── Day label helper ─────────────────────────────────────────────────────────

function getDayLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d, yyyy");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [history, setHistory] = useState<DayGroup[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set(["today"])
  );

  useEffect(() => {
    fetchHistory();
  }, [days, typeFilter]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ days: String(days) });
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      const res = await fetch(`/api/activity?${params}`);
      if (!res.ok) throw new Error("Failed");
      const { data } = await res.json();
      setHistory(data.history ?? []);
      setStats(data.stats ?? null);
      // Auto-expand today and yesterday
      const todayKey = format(new Date(), "yyyy-MM-dd");
      const yesterdayKey = format(
        new Date(Date.now() - 86400000),
        "yyyy-MM-dd"
      );
      setExpandedDays(new Set([todayKey, yesterdayKey]));
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleDay(dateKey: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1a1a2e 100%)", padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>📋</span>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#fff" }}>Activity History</h1>
          </div>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>All your activity, organized day by day</p>

          {/* Stats row */}
          {stats && (
            <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
              {[
                { label: "Total Events", value: stats.totalActivities, icon: "⚡" },
                { label: "Active Days", value: stats.totalDays, icon: "📅" },
                { label: "Terminal Runs", value: stats.typeBreakdown["TERMINAL_COMMAND"] ?? 0, icon: "💻" },
                { label: "Submissions", value: stats.typeBreakdown["ASSIGNMENT_SUBMIT"] ?? 0, icon: "✅" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 18px", minWidth: 120, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#a78bfa" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#151823", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>FILTER:</span>

          {/* Days filter */}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ background: "#1e2235", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ background: "#1e2235", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}
          >
            <option value="ALL">All Types</option>
            {Object.entries(activityConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⏳</div>
            <p>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🕳️</div>
            <p style={{ fontSize: 16 }}>No activity found</p>
            <p style={{ fontSize: 13 }}>Try a different filter or date range</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {history.map((day) => {
              const isExpanded = expandedDays.has(day.date);
              return (
                <div key={day.date} style={{ background: "#151823", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  {/* Day header */}
                  <button
                    onClick={() => toggleDay(day.date)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", color: "#e2e8f0" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa" }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, textAlign: "left" }}>{getDayLabel(day.date)}</div>
                        <div style={{ fontSize: 12, color: "#64748b", textAlign: "left" }}>{format(parseISO(day.date), "MMMM d, yyyy")}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                        {day.count} events
                      </span>
                      <span style={{ color: "#64748b", fontSize: 16, transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                    </div>
                  </button>

                  {/* Activity items */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      {day.items.map((item, idx) => {
                        const cfg = activityConfig[item.type] ?? activityConfig.LOGIN;
                        return (
                          <div
                            key={item.id}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 14,
                              padding: "14px 20px",
                              borderBottom: idx < day.items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            {/* Timeline line */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                                {cfg.icon}
                              </div>
                              {idx < day.items.length - 1 && (
                                <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.04)", marginTop: 6, minHeight: 16 }} />
                              )}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{item.title}</span>
                                <span style={{ fontSize: 11, color: cfg.color, background: cfg.bg, borderRadius: 6, padding: "2px 8px", fontWeight: 600 }}>
                                  {cfg.label}
                                </span>
                              </div>
                              {item.description && (
                                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>{item.description}</p>
                              )}
                              {/* Show command for terminal */}
                              {item.type === "TERMINAL_COMMAND" && item.metadata?.command != null && (
                                <code style={{ display: "inline-block", marginTop: 6, fontSize: 12, background: "rgba(0,0,0,0.4)", color: "#a78bfa", padding: "3px 8px", borderRadius: 6, fontFamily: "monospace" }}>
                                  $ {String(item.metadata.command as string)}
                                </code>
                              )}
                            </div>

                            {/* Time */}
                            <div style={{ fontSize: 11, color: "#475569", flexShrink: 0, paddingTop: 4, whiteSpace: "nowrap" }}>
                              {format(new Date(item.date), "h:mm a")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
