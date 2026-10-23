import Link from "next/link";
import { Monitor, Terminal, Code2, Lock } from "lucide-react";

export const metadata = {
  title: "Unauthorized Access",
};

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          You don&apos;t have permission to access this page. Please sign in with an account that has the required role.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            Sign In With Another Account
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
