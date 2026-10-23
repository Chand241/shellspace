import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { apiError, apiSuccess } from "@/lib/utils";
import { logActivity } from "@/lib/activity-logger";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.errors.map((e) => e.message).join(", "),
        400
      );
    }

    const { name, email, password, studentId, department } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      // Create user — always STUDENT role on registration
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name: name.trim(),
          passwordHash,
          role: "STUDENT",
        },
      });

      // Create profile
      await tx.userProfile.create({
        data: {
          userId: newUser.id,
          studentId: studentId ?? null,
          department: department ?? null,
        },
      });

      // Create workspace
      await tx.workspace.create({
        data: {
          userId: newUser.id,
          name: `${name.trim()}'s Workspace`,
        },
      });

      // Create default desktop preferences
      await tx.desktopPreference.create({
        data: {
          userId: newUser.id,
          theme: "light",
          wallpaper: "gradient-blue",
        },
      });

      return newUser;
    });

    // Log account creation activity
    await logActivity({
      userId: user.id,
      type: "LOGIN",
      title: "Account Created",
      description: `Welcome to ShellSpace, ${user.name}!`,
      metadata: { email: user.email, department: department ?? null },
    });

    return apiSuccess(
      { id: user.id, email: user.email, name: user.name },
      201
    );
  } catch (error) {
    console.error("[REGISTER] Error:", error);
    return apiError("Registration failed. Please try again.", 500);
  }
}
