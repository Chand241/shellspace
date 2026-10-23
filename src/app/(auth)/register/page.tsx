"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { registerSchema } from "@/lib/validations";
import { Monitor, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Monitor className="text-white" size={20} />
            </div>
            <span className="font-bold text-2xl text-gray-900">ShellSpace</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the virtual Linux lab platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Success */}
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              Account created! Redirecting to sign in…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                className={`form-input ${errors.name ? "border-red-400" : ""}`}
                placeholder="Your full name"
                {...register("name")}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                className={`form-input ${errors.email ? "border-red-400" : ""}`}
                placeholder="you@university.edu"
                {...register("email")}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            {/* Student ID + Department (optional) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label" htmlFor="reg-student-id">Student ID <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  id="reg-student-id"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2021CS001"
                  {...register("studentId")}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="reg-dept">Department <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  id="reg-dept"
                  type="text"
                  className="form-input"
                  placeholder="e.g. CSE"
                  {...register("department")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`form-input pr-11 ${errors.password ? "border-red-400" : ""}`}
                  placeholder="Min. 8 chars, upper, lower, number"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`form-input pr-11 ${errors.confirmPassword ? "border-red-400" : ""}`}
                  placeholder="Repeat your password"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting || success}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-4 py-3 rounded-xl transition-colors shadow-sm text-sm mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            By registering you agree to our terms. Your account will have Student access.
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
