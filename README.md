# ShellSpace 🖥️

**A Web-Based Virtual Operating System and Linux Bash Laboratory with Automated Practical Evaluation**

ShellSpace is a full-stack educational platform that provides students with a virtual Linux environment directly in their browser — enabling hands-on OS and Bash scripting practice with automated grading.

---

## ✨ Features

### 👨‍🎓 Student
- **Virtual Desktop** — drag-and-drop window manager in the browser
- **Linux Terminal** — fully functional bash terminal emulator
- **Bash Studio** — script editor with syntax highlighting
- **File Manager** — workspace file system (create, edit, delete files)
- **Assignments** — view and submit lab assignments
- **Activity History** — day-wise log of all activity (logins, commands, submissions)
- **Grades & Feedback** — view teacher grades and comments

### 👨‍🏫 Teacher
- **Create Assignments** — rich assignment editor with test cases and rubrics
- **Grade Submissions** — view student scripts and provide feedback
- **Course Management** — organize assignments by course

### 🛡️ Admin
- **User Management** — manage students, teachers, roles
- **Audit Logs** — full system activity trail
- **Execution Monitoring** — track sandbox job status

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | NextAuth.js (JWT) |
| State | Zustand |
| Validation | Zod |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Chand241/shellspace.git
cd shellspace

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL, keys, and AUTH_SECRET

# 4. Push database schema
npx prisma db push

# 5. Seed initial data (optional)
npx prisma db seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Schema

Key models:
- `User` / `UserProfile` — authentication and student info
- `LabAssignment` / `LabTestCase` — assignments with automated test cases
- `LabSubmission` / `ExecutionJob` — student submissions and sandbox execution
- `ActivityLog` — day-wise user activity history
- `Workspace` / `WorkspaceFile` — per-user virtual file system

---

## 📁 Project Structure

```
shellspace/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Initial data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login & Register pages
│   │   ├── (student)/      # Student dashboard routes
│   │   ├── teacher/        # Teacher dashboard routes
│   │   ├── admin/          # Admin panel routes
│   │   ├── api/            # REST API routes
│   │   └── desktop/        # Virtual desktop
│   ├── components/
│   │   ├── desktop/        # Window manager, taskbar, apps
│   │   ├── student/        # Student sidebar
│   │   ├── teacher/        # Teacher sidebar
│   │   └── admin/          # Admin sidebar
│   └── lib/
│       ├── auth.ts          # NextAuth config
│       ├── prisma.ts        # Prisma client singleton
│       ├── activity-logger.ts # User activity tracking
│       └── validations.ts   # Zod schemas
```

---

## 🔐 Environment Variables

See [`.env.example`](.env.example) for all required variables.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*ShellSpace — Built for academic Linux lab automation*
