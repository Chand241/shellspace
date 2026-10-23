import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Terminal,
  Monitor,
  BookOpen,
  Code2,
  Cpu,
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  BarChart3,
  Zap,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "TEACHER") redirect("/teacher");
    redirect("/student/desktop");
  }

  return (
    <main className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Monitor className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="font-bold text-xl text-gray-900">ShellSpace</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#labs" className="hover:text-gray-900 transition-colors">OS Labs</a>
            <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <Zap size={14} />
            Real Bash Execution · PostgreSQL Backend · Role-Based Access
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            ShellSpace: <span className="text-blue-600">Virtual OS & Linux Bash Laboratory</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            A Web-Based Virtual Operating System and Linux Bash Laboratory with Automated Practical Evaluation,
            interactive desktop interface, live script simulator, and complete OS lab management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-base shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
            >
              Start Learning Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-800 font-semibold px-8 py-4 rounded-xl text-base shadow-sm transition-all hover:-translate-y-0.5"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Mock desktop preview */}
        <div className="max-w-5xl mx-auto mt-16 px-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            {/* Titlebar */}
            <div className="h-10 bg-gray-100 flex items-center px-4 gap-2 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 text-center text-xs text-gray-400 font-medium">ShellSpace — Virtual Desktop</div>
            </div>
            {/* Desktop mockup */}
            <div className="h-72 bg-gradient-to-br from-blue-800 to-blue-600 p-4 relative">
              {/* Floating terminal window */}
              <div className="absolute top-4 left-4 w-80 bg-gray-900 rounded-lg overflow-hidden shadow-xl border border-gray-700">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-400 ml-1 font-mono">Terminal</span>
                </div>
                <div className="p-3 font-mono text-xs text-green-400 space-y-1">
                  <div><span className="text-blue-400">student@shellspace</span><span className="text-white">:</span><span className="text-blue-300">~</span><span className="text-white">$ </span>ls -la</div>
                  <div className="text-gray-300">drwxr-xr-x  scripts/</div>
                  <div className="text-gray-300">-rwxr-xr-x  hello.sh</div>
                  <div className="text-gray-300">-rw-r--r--  notes.txt</div>
                  <div><span className="text-blue-400">student@shellspace</span><span className="text-white">:</span><span className="text-blue-300">~</span><span className="text-white">$ </span>bash hello.sh</div>
                  <div className="text-green-300">Hello, World!</div>
                  <div className="text-white animate-pulse">█</div>
                </div>
              </div>
              {/* Floating editor */}
              <div className="absolute top-4 right-4 w-64 bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <Code2 size={12} className="text-blue-500" />
                  <span className="text-xs text-gray-600 font-medium">Bash Studio</span>
                </div>
                <div className="p-3 font-mono text-xs bg-gray-900 text-gray-300 space-y-0.5">
                  <div><span className="text-gray-500">1 </span><span className="text-blue-400">#!/usr/bin/env bash</span></div>
                  <div><span className="text-gray-500">2 </span></div>
                  <div><span className="text-gray-500">3 </span><span className="text-green-400">echo</span><span className="text-yellow-300"> "Hello!"</span></div>
                  <div><span className="text-gray-500">4 </span><span className="text-purple-400">name</span>=<span className="text-yellow-300">"$1"</span></div>
                </div>
              </div>
              {/* Desktop icons */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                {[
                  { icon: Terminal, label: "Terminal" },
                  { icon: Code2, label: "Bash Studio" },
                  { icon: BookOpen, label: "OS Lab" },
                  { icon: Monitor, label: "Desktop" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors border border-white/20">
                      <Icon size={22} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-medium drop-shadow">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything in One Platform</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              From a virtual desktop to real terminal execution and graded assignments.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Monitor,
                color: "bg-blue-50 text-blue-600",
                title: "Virtual Desktop",
                description:
                  "A full OS-like desktop with window management, taskbar, app launcher, and persistent preferences.",
              },
              {
                icon: Terminal,
                color: "bg-emerald-50 text-emerald-600",
                title: "Real Linux Terminal",
                description:
                  "Powered by xterm.js and a secure isolated runner. Real Bash execution — not a simulation.",
              },
              {
                icon: Code2,
                color: "bg-violet-50 text-violet-600",
                title: "Bash Studio",
                description:
                  "Monaco Editor with Bash syntax highlighting, file explorer, execution history, and lab submission.",
              },
              {
                icon: Cpu,
                color: "bg-orange-50 text-orange-600",
                title: "OS Algorithm Simulators",
                description:
                  "Interactive visualizations for CPU scheduling, page replacement, Banker's algorithm, and disk scheduling.",
              },
              {
                icon: BookOpen,
                color: "bg-pink-50 text-pink-600",
                title: "Lab Assignment System",
                description:
                  "Teachers create assignments with test cases, deadlines, and auto-grading. Students submit and get feedback.",
              },
              {
                icon: Shield,
                color: "bg-gray-50 text-gray-600",
                title: "Secure & Isolated",
                description:
                  "Student scripts run in sandboxed containers with CPU, memory, and timeout limits. No host access.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}>
                  <feat.icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Every Role</h2>
            <p className="text-lg text-gray-500">Students, teachers, and administrators each get a tailored experience.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: "Student",
                icon: Users,
                color: "text-blue-600 bg-blue-50",
                items: [
                  "Virtual desktop & personal workspace",
                  "Real Linux terminal (isolated)",
                  "Bash Script editor with execution",
                  "OS Lab assignments & submissions",
                  "Grades & teacher feedback",
                  "Learning progress tracker",
                ],
              },
              {
                role: "Teacher",
                icon: BookOpen,
                color: "text-violet-600 bg-violet-50",
                items: [
                  "Create & publish lab assignments",
                  "Define test cases (public + hidden)",
                  "Review submitted scripts",
                  "Auto & manual grading",
                  "Provide written feedback",
                  "Class performance reports",
                ],
              },
              {
                role: "Administrator",
                icon: BarChart3,
                color: "text-emerald-600 bg-emerald-50",
                items: [
                  "User & role management",
                  "Course & class administration",
                  "Execution job monitoring",
                  "Security audit logs",
                  "Platform configuration",
                  "Resource quota management",
                ],
              },
            ].map((r) => (
              <div key={r.role} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${r.color}`}>
                  <r.icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-5">{r.role}</h3>
                <ul className="space-y-3">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Create your free account and open a real Linux terminal in under 30 seconds.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-700 font-bold px-8 py-4 rounded-xl text-base shadow-lg transition-all hover:-translate-y-0.5"
          >
            Get Started for Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <Monitor size={15} className="text-white" />
            </div>
            <span className="font-semibold text-white">ShellSpace</span>
          </div>
          <p className="text-sm">© 2026 ShellSpace — A Web-Based Virtual Operating System and Linux Bash Laboratory with Automated Practical Evaluation.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
