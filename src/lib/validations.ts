import { z } from "zod";

// ─── AUTH SCHEMAS ─────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    studentId: z.string().optional(),
    department: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  studentId: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  year: z.number().int().min(1).max(6).optional(),
  phone: z.string().max(20).optional(),
});

// ─── FILE SCHEMAS ─────────────────────────────────────────────────────────────

export const createFileSchema = z.object({
  name: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name too long")
    .regex(
      /^[a-zA-Z0-9._\-\s]+$/,
      "File name contains invalid characters"
    ),
  type: z.enum(["FILE", "DIRECTORY"]),
  parentId: z.string().uuid().nullable().optional(),
  content: z.string().optional(),
});

export const updateFileSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9._\-\s]+$/)
    .optional(),
  content: z.string().optional(),
});

// ─── ASSIGNMENT SCHEMAS ───────────────────────────────────────────────────────

export const createAssignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().uuid("Invalid category"),
  courseId: z.string().uuid("Invalid course").optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  objectives: z.array(z.string()).min(1, "At least one objective required"),
  instructions: z.string().min(10, "Instructions must be at least 10 characters"),
  exampleInput: z.string().optional(),
  exampleOutput: z.string().optional(),
  maxMarks: z.number().int().min(1).max(1000),
  passingMarks: z.number().int().min(0),
  deadline: z.string().datetime().optional(),
  startTime: z.string().datetime().optional(),
  maxAttempts: z.number().int().min(1).max(10),
  lateSubmissionPolicy: z.string().optional(),
  executionTimeout: z.number().int().min(1).max(60),
  memoryLimitMb: z.number().int().min(32).max(512),
  autoGrade: z.boolean(),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

// ─── SUBMISSION SCHEMAS ───────────────────────────────────────────────────────

export const createSubmissionSchema = z.object({
  assignmentId: z.string().uuid(),
  scriptContent: z.string().min(1, "Script content is required"),
  answers: z.record(z.string()).optional(),
});

// ─── EXECUTION SCHEMAS ────────────────────────────────────────────────────────

export const executeScriptSchema = z.object({
  script: z
    .string()
    .min(1, "Script cannot be empty")
    .max(100000, "Script exceeds maximum size"),
  stdin: z.string().max(10000).optional(),
  workspaceFileId: z.string().uuid().optional(),
  submissionId: z.string().uuid().optional(),
});

// ─── GRADING SCHEMAS ─────────────────────────────────────────────────────────

export const gradeSubmissionSchema = z.object({
  teacherScore: z.number().min(0),
  feedbackComment: z.string().min(1, "Feedback is required").max(5000),
  status: z.enum(["GRADED", "RETURNED"]),
});

// ─── COURSE SCHEMAS ───────────────────────────────────────────────────────────

export const createCourseSchema = z.object({
  code: z
    .string()
    .min(2, "Course code required")
    .max(20)
    .regex(/^[A-Z0-9\-]+$/, "Course code must be uppercase letters and numbers"),
  name: z.string().min(3, "Course name required").max(200),
  description: z.string().max(1000).optional(),
});
