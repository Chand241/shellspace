import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NexaOS database...");

  // ── Lab Categories ──────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.labCategory.upsert({
      where: { slug: "linux-basics" },
      update: {},
      create: {
        name: "Linux Basics",
        slug: "linux-basics",
        description: "Introduction to Linux commands and filesystem",
        icon: "terminal",
        order: 1,
      },
    }),
    prisma.labCategory.upsert({
      where: { slug: "bash-scripting" },
      update: {},
      create: {
        name: "Bash Scripting",
        slug: "bash-scripting",
        description: "Shell scripting with variables, loops, functions",
        icon: "code-2",
        order: 2,
      },
    }),
    prisma.labCategory.upsert({
      where: { slug: "os-algorithms" },
      update: {},
      create: {
        name: "OS Algorithms",
        slug: "os-algorithms",
        description: "CPU scheduling, memory management, disk scheduling",
        icon: "cpu",
        order: 3,
      },
    }),
    prisma.labCategory.upsert({
      where: { slug: "advanced-labs" },
      update: {},
      create: {
        name: "Advanced Labs",
        slug: "advanced-labs",
        description: "Shell automation, process management, IPC",
        icon: "layers",
        order: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} lab categories`);

  // ── Admin User ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nexaos.edu" },
    update: {},
    create: {
      email: "admin@nexaos.edu",
      name: "NexaOS Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      department: "Platform Administration",
    },
  });

  console.log(`✅ Admin user: admin@nexaos.edu / Admin@1234!`);

  // ── Teacher User ────────────────────────────────────────────────────────
  const teacherPassword = await bcrypt.hash("Teacher@1234!", 12);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@nexaos.edu" },
    update: {},
    create: {
      email: "teacher@nexaos.edu",
      name: "Dr. Sarah Johnson",
      passwordHash: teacherPassword,
      role: "TEACHER",
      isActive: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: teacher.id },
    update: {},
    create: {
      userId: teacher.id,
      department: "Computer Science",
    },
  });

  console.log(`✅ Teacher user: teacher@nexaos.edu / Teacher@1234!`);

  // ── Demo Student ─────────────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash("Student@1234!", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@nexaos.edu" },
    update: {},
    create: {
      email: "student@nexaos.edu",
      name: "Alex Kumar",
      passwordHash: studentPassword,
      role: "STUDENT",
      isActive: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      studentId: "2021CS001",
      department: "Computer Science Engineering",
      year: 3,
    },
  });

  // Create student workspace
  await prisma.workspace.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      name: "Alex's Workspace",
    },
  });

  // Create desktop prefs
  await prisma.desktopPreference.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      theme: "light",
      wallpaper: "gradient-blue",
    },
  });

  console.log(`✅ Student user: student@nexaos.edu / Student@1234!`);

  // ── Course ───────────────────────────────────────────────────────────────
  const course = await prisma.course.upsert({
    where: { code: "CS301" },
    update: {},
    create: {
      code: "CS301",
      name: "Operating Systems",
      description: "Fundamental concepts of operating systems including process management, memory management, and file systems.",
      isActive: true,
    },
  });

  // Link teacher to course
  await prisma.courseTeacher.upsert({
    where: { courseId_userId: { courseId: course.id, userId: teacher.id } },
    update: {},
    create: { courseId: course.id, userId: teacher.id },
  });

  // Enroll student
  await prisma.enrollment.upsert({
    where: { courseId_userId: { courseId: course.id, userId: student.id } },
    update: {},
    create: { courseId: course.id, userId: student.id },
  });

  console.log(`✅ Course: ${course.code} - ${course.name}`);

  // ── Sample Lab Assignment ─────────────────────────────────────────────────
  const bashCat = categories.find((c) => c.slug === "bash-scripting")!;

  const assignment = await prisma.labAssignment.upsert({
    where: { id: "seed-assignment-001" },
    update: {},
    create: {
      id: "seed-assignment-001",
      title: "Bash Scripting Basics: Variables and I/O",
      description: "Write a Bash script that demonstrates variable usage, user input, and output formatting.",
      categoryId: bashCat.id,
      courseId: course.id,
      createdById: teacher.id,
      status: "PUBLISHED",
      difficulty: "BEGINNER",
      objectives: JSON.stringify([
        "Declare and use shell variables",
        "Read command-line arguments",
        "Use echo and printf for formatted output",
        "Apply string operations",
        "Handle basic arithmetic",
      ]),
      instructions: `## Assignment Instructions

Write a Bash script named \`greet.sh\` that:

1. Accepts a name as the first argument (\`$1\`)
2. If no argument is provided, default to "World"
3. Prints a greeting with the name
4. Prints the current date
5. Prints the length of the name

### Example:
\`\`\`bash
$ bash greet.sh Alice
Hello, Alice!
Today is: Mon Oct 23 2026
Name length: 5
\`\`\``,
      exampleInput: "Alice",
      exampleOutput: "Hello, Alice!\nToday is: Mon Oct 23 2026\nName length: 5",
      maxMarks: 100,
      passingMarks: 50,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      maxAttempts: 3,
      executionTimeout: 5,
      memoryLimitMb: 128,
      autoGrade: true,
    },
  });

  // Starter file
  await prisma.labStarterFile.upsert({
    where: { id: "seed-starter-001" },
    update: {},
    create: {
      id: "seed-starter-001",
      assignmentId: assignment.id,
      name: "greet.sh",
      content: `#!/usr/bin/env bash

# NexaOS Bash Lab — Starter Script
# Assignment: Variables and I/O

# TODO: Get name from first argument, default to "World"
name="\${1:-World}"

# TODO: Print greeting
echo "Hello, \$name!"

# TODO: Print current date
echo "Today is: \$(date '+%a %b %d %Y')"

# TODO: Print name length
echo "Name length: \${#name}"
`,
      isRequired: false,
    },
  });

  console.log(`✅ Sample assignment created`);

  // ── Application Settings ──────────────────────────────────────────────────
  const settings = [
    { key: "exec.timeout_sec", value: 5 },
    { key: "exec.memory_limit_mb", value: 128 },
    { key: "exec.max_output_bytes", value: 1048576 },
    { key: "exec.max_concurrent_per_user", value: 2 },
    { key: "storage.max_workspace_mb", value: 500 },
    { key: "platform.maintenance_mode", value: false },
    { key: "platform.registration_enabled", value: true },
  ];

  for (const setting of settings) {
    await prisma.applicationSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value },
    });
  }

  console.log(`✅ Application settings initialized`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\nDemo accounts:");
  console.log("  Admin:   admin@nexaos.edu   / Admin@1234!");
  console.log("  Teacher: teacher@nexaos.edu / Teacher@1234!");
  console.log("  Student: student@nexaos.edu / Student@1234!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
