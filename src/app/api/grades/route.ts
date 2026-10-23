import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Teacher role required" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";
    let submissionId = "";
    let finalScoreStr = "";
    let comments = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      submissionId = body.submissionId;
      finalScoreStr = String(body.finalScore);
      comments = body.comments || "";
    } else {
      const formData = await req.formData();
      submissionId = (formData.get("submissionId") as string) || "";
      finalScoreStr = (formData.get("finalScore") as string) || "";
      comments = (formData.get("comments") as string) || "";
    }

    if (!submissionId || !finalScoreStr) {
      return NextResponse.json(
        { error: "submissionId and finalScore are required" },
        { status: 400 }
      );
    }

    const finalScore = parseFloat(finalScoreStr);

    const submission = await prisma.labSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Update submission status and grade
      await tx.labSubmission.update({
        where: { id: submissionId },
        data: {
          finalScore,
          teacherScore: finalScore,
          status: "GRADED",
          gradedById: session.user.id,
          gradedAt: new Date(),
        },
      });

      // Save feedback if comments provided
      if (comments.trim()) {
        await tx.teacherFeedback.create({
          data: {
            submissionId,
            teacherId: session.user.id,
            comment: comments.trim(),
          },
        });
      }
    });

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(
        new URL("/teacher/submissions?graded=true", req.url)
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Grading API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
