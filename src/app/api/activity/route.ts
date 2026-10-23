import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { apiError, apiSuccess } from "@/lib/utils";
import { ActivityType } from "@prisma/client";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

// ─── POST /api/activity ───────────────────────────────────────────────────────
// Log a new activity event (called from client components)

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();
    const { type, title, description, metadata } = body;

    if (!type || !title) {
      return apiError("type and title are required", 400);
    }

    // Validate type is a valid ActivityType
    const validTypes = Object.values(ActivityType);
    if (!validTypes.includes(type)) {
      return apiError(`Invalid activity type: ${type}`, 400);
    }

    await logActivity({
      userId: session.user.id,
      type: type as ActivityType,
      title,
      description,
      metadata,
    });

    return apiSuccess({ logged: true }, 201);
  } catch (error) {
    console.error("[ACTIVITY POST]", error);
    return apiError("Failed to log activity", 500);
  }
}

// ─── GET /api/activity ────────────────────────────────────────────────────────
// Fetch history grouped by day
// Query params:
//   ?days=30        (default: 30, max: 90)
//   ?type=LOGIN     (optional filter)
//   ?userId=xxx     (admin only — view another user's history)

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get("days") ?? "30");
    const days = Math.min(Math.max(daysParam, 1), 90);
    const typeFilter = searchParams.get("type") as ActivityType | null;
    const requestedUserId = searchParams.get("userId");

    // Determine target userId — admins can view any user
    let targetUserId = session.user.id;
    if (requestedUserId && session.user.role === "ADMIN") {
      targetUserId = requestedUserId;
    } else if (requestedUserId && requestedUserId !== session.user.id) {
      return apiError("Forbidden", 403);
    }

    const since = subDays(new Date(), days);

    const activities = await prisma.activityLog.findMany({
      where: {
        userId: targetUserId,
        date: { gte: since },
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      orderBy: { date: "desc" },
      take: 500,
    });

    // Group by day (YYYY-MM-DD)
    const grouped: Record<
      string,
      {
        date: string;
        label: string;
        count: number;
        items: typeof activities;
      }
    > = {};

    for (const activity of activities) {
      const dayKey = format(new Date(activity.date), "yyyy-MM-dd");
      const label = format(new Date(activity.date), "EEEE, MMMM d, yyyy");

      if (!grouped[dayKey]) {
        grouped[dayKey] = { date: dayKey, label, count: 0, items: [] };
      }
      grouped[dayKey].count++;
      grouped[dayKey].items.push(activity);
    }

    // Return as sorted array (newest day first)
    const days_grouped = Object.values(grouped).sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    // Summary stats
    const stats = {
      totalActivities: activities.length,
      totalDays: days_grouped.length,
      typeBreakdown: activities.reduce(
        (acc, a) => {
          acc[a.type] = (acc[a.type] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return apiSuccess({ history: days_grouped, stats });
  } catch (error) {
    console.error("[ACTIVITY GET]", error);
    return apiError("Failed to fetch activity history", 500);
  }
}
