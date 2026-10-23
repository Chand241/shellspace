import { prisma } from "@/lib/prisma";
import { ActivityType, Prisma } from "@prisma/client";
import { headers } from "next/headers";

export type { ActivityType };

interface LogActivityOptions {
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Prisma.InputJsonObject;
}

/**
 * Server-side activity logger — saves a user activity event to the DB.
 * Call this from API routes or server actions.
 */
export async function logActivity(opts: LogActivityOptions): Promise<void> {
  try {
    let ipAddress: string | undefined;

    try {
      const headersList = await headers();
      ipAddress =
        headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
        headersList.get("x-real-ip") ??
        undefined;
    } catch {
      // headers() may not be available in all contexts
    }

    await prisma.activityLog.create({
      data: {
        userId: opts.userId,
        type: opts.type,
        title: opts.title,
        description: opts.description ?? null,
        // Prisma Json field: spread only if metadata provided
        ...(opts.metadata !== undefined ? { metadata: opts.metadata } : {}),
        ipAddress: ipAddress ?? null,
        date: new Date(),
      },
    });
  } catch (error) {
    // Never let logging break the main flow
    console.warn("[ActivityLogger] Failed to log activity:", error);
  }
}

/**
 * Lightweight client-side helper — calls the /api/activity POST endpoint.
 * Use this from client components.
 */
export async function logActivityClient(
  opts: Omit<LogActivityOptions, "userId">
): Promise<void> {
  try {
    await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
  } catch {
    // Never let logging break the main flow
  }
}
