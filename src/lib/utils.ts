import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date as relative time ("2 hours ago")
 */
export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Format a date as readable string
 */
export function formatDate(date: Date | string, fmt = "MMM d, yyyy"): string {
  return format(new Date(date), fmt);
}

/**
 * Format a date + time
 */
export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format duration in milliseconds
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Truncate string to max length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

/**
 * Generate a safe file path segment
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._\-\s]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 255);
}

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(deadline: Date | string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

/**
 * Calculate time remaining until deadline
 */
export function timeUntilDeadline(deadline: Date | string | null): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (d < new Date()) return "Expired";
  return formatDistanceToNow(d, { addSuffix: false });
}

/**
 * Build API error response
 */
export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * Build API success response
 */
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ data }, { status });
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Role badge colors
 */
export function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-800 border-red-200";
    case "TEACHER":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "STUDENT":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/**
 * Submission status colors
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    QUEUED: "bg-yellow-100 text-yellow-700",
    RUNNING: "bg-orange-100 text-orange-700",
    ACCEPTED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    UNDER_REVIEW: "bg-purple-100 text-purple-700",
    GRADED: "bg-emerald-100 text-emerald-700",
    RETURNED: "bg-amber-100 text-amber-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}
