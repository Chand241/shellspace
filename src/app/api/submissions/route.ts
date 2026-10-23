import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-logger";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let assignmentId = "";
    let scriptContent = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      assignmentId = body.assignmentId;
      scriptContent = body.scriptContent;
    } else {
      const formData = await req.formData();
      assignmentId = (formData.get("assignmentId") as string) || "";
      scriptContent = (formData.get("scriptContent") as string) || "";
    }

    if (!assignmentId || !scriptContent) {
      return NextResponse.json(
        { error: "assignmentId and scriptContent are required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.labAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Determine attempt number
    const previousAttempts = await prisma.labSubmission.count({
      where: {
        studentId: session.user.id,
        assignmentId,
      },
    });

    const submission = await prisma.labSubmission.create({
      data: {
        studentId: session.user.id,
        assignmentId,
        attemptNumber: previousAttempts + 1,
        status: "SUBMITTED",
        scriptSnapshot: scriptContent,
        submittedAt: new Date(),
      },
    });

    // Log assignment submission activity
    await logActivity({
      userId: session.user.id,
      type: "ASSIGNMENT_SUBMIT",
      title: `Submitted: ${assignment.title}`,
      description: `Attempt #${previousAttempts + 1}`,
      metadata: {
        assignmentId,
        assignmentTitle: assignment.title,
        attemptNumber: previousAttempts + 1,
        submissionId: submission.id,
      },
    });

    // If submitted via standard HTML form, redirect back
    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(
        new URL(`/student/assignments/${assignmentId}?submitted=true`, req.url)
      );
    }

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
