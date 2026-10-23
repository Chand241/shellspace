import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

/**
 * Get current session - throws redirect if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Require specific role - redirects unauthorized users
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized");
  }
  return session;
}

/**
 * Get current session without redirect (for optional auth)
 */
export async function getSession() {
  return auth();
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

/**
 * Check if user is teacher or admin
 */
export function isTeacherOrAdmin(role: UserRole): boolean {
  return role === "TEACHER" || role === "ADMIN";
}
