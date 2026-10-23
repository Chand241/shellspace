import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";
import { apiError, apiSuccess } from "@/lib/utils";

// Called from client after successful login to record the LOGIN event
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    await logActivity({
      userId: session.user.id,
      type: "LOGIN",
      title: "Logged In",
      description: `Signed in as ${session.user.name}`,
      metadata: { email: session.user.email, role: session.user.role },
    });

    return apiSuccess({ logged: true });
  } catch (error) {
    console.error("[LOG-LOGIN]", error);
    return apiError("Failed to log login", 500);
  }
}
