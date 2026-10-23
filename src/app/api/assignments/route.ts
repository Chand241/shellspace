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
    let title = "";
    let description = "";
    let instructions = "";
    let categoryId = "";
    let courseId = "";
    let difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" = "BEGINNER";
    let maxMarks = 100;
    let starterCode = "";
    let testInput = "";
    let testExpectedOutput = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      title = body.title;
      description = body.description;
      instructions = body.instructions;
      categoryId = body.categoryId;
      courseId = body.courseId;
      difficulty = body.difficulty || "BEGINNER";
      maxMarks = parseInt(body.maxMarks) || 100;
      starterCode = body.starterCode || "";
      testInput = body.testInput || "";
      testExpectedOutput = body.testExpectedOutput || "";
    } else {
      const formData = await req.formData();
      title = (formData.get("title") as string) || "";
      description = (formData.get("description") as string) || "";
      instructions = (formData.get("instructions") as string) || "";
      categoryId = (formData.get("categoryId") as string) || "";
      courseId = (formData.get("courseId") as string) || "";
      difficulty = (formData.get("difficulty") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED") || "BEGINNER";
      maxMarks = parseInt(formData.get("maxMarks") as string) || 100;
      starterCode = (formData.get("starterCode") as string) || "";
      testInput = (formData.get("testInput") as string) || "";
      testExpectedOutput = (formData.get("testExpectedOutput") as string) || "";
    }

    if (!title || !description || !categoryId) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.labAssignment.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        instructions: (instructions || description).trim(),
        categoryId,
        courseId: courseId || null,
        createdById: session.user.id,
        difficulty,
        maxMarks,
        passingMarks: Math.round(maxMarks * 0.5),
        status: "PUBLISHED",
        starterFiles: starterCode.trim()
          ? {
              create: [
                {
                  name: "solution.sh",
                  content: starterCode.trim(),
                  isRequired: true,
                },
              ],
            }
          : undefined,
        testCases: testExpectedOutput.trim()
          ? {
              create: [
                {
                  title: "Sample Test Case 1",
                  input: testInput.trim(),
                  expectedOutput: testExpectedOutput.trim(),
                  marks: Math.round(maxMarks * 0.25),
                  isHidden: false,
                },
              ],
            }
          : undefined,
      },
    });

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL("/teacher/assignments", req.url));
    }

    return NextResponse.json({ success: true, assignment }, { status: 201 });
  } catch (error) {
    console.error("Assignment creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
