"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, homePathForRole } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";

export function AuthBrand() {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <Link
        href="/"
        className="flex items-center gap-2 mb-2 group transition-opacity hover:opacity-80"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 6C15 6 9 6 9 10C9 12 12 12 12 12C12 12 15 12 15 14C15 18 9 18 9 18"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-2xl font-bold text-indigo-600">Skreena</span>
      </Link>
      <p className="text-sm text-gray-500">AI-Powered Recruiting</p>
    </div>
  );
}

export const authInputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

export const authSubmitClass =
  "w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors";

export type AuthTab = "login" | "register";

export function AuthTabs({
  activeTab,
  onChange,
}: {
  activeTab: AuthTab;
  onChange: (tab: AuthTab) => void;
}) {
  return (
    <div className="flex p-1 mb-8 bg-gray-100 rounded-full">
      <button
        type="button"
        onClick={() => onChange("login")}
        className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
          activeTab === "login" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => onChange("register")}
        className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
          activeTab === "register" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Register
      </button>
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </p>
  );
}

export { toErrorMessage } from "@/lib/api";

/**
 * The registration form for every portal. POST /api/auth/signup takes exactly
 * four fields — name, email, password (min 6) and role — so that is exactly
 * what is collected here; `role` is fixed per portal rather than chosen.
 */
export function RegisterForm({
  role,
  emailLabel = "Email",
  emailPlaceholder = "you@example.com",
  submitLabel = "Register",
}: {
  role: UserRole;
  emailLabel?: string;
  emailPlaceholder?: string;
  submitLabel?: string;
}) {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    // The backend rejects anything shorter, so catch it before the round trip.
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.replace(homePathForRole(user.role));
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <AuthError message={error} />
      <div>
        <label
          htmlFor={`${role}-name`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Full name
        </label>
        <input
          id={`${role}-name`}
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Jane Doe"
          className={authInputClass}
        />
      </div>
      <div>
        <label
          htmlFor={`${role}-email`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {emailLabel}
        </label>
        <input
          id={`${role}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={emailPlaceholder}
          className={authInputClass}
        />
      </div>
      <div>
        <label
          htmlFor={`${role}-password`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          id={`${role}-password`}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          className={authInputClass}
        />
      </div>
      <button type="submit" disabled={isSubmitting} className={authSubmitClass}>
        {isSubmitting ? "Creating account…" : submitLabel}
      </button>
    </form>
  );
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      router.replace(homePathForRole(user.role));
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <AuthError message={error} />
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className={authInputClass}
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
          className={authInputClass}
        />
      </div>
      <button type="submit" disabled={isSubmitting} className={authSubmitClass}>
        {isSubmitting ? "Signing in…" : "Login"}
      </button>
      <div className="text-center">
        <a href="#" className="text-sm font-medium text-indigo-500 hover:text-indigo-600">
          Forgot password?
        </a>
      </div>
    </form>
  );
}

export function AuthCardLayout({
  activeTab,
  onTabChange,
  registerForm,
  googleButton,
}: {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  registerForm: ReactNode;
  /** Rendered under whichever form is showing; omitted when unconfigured. */
  googleButton?: ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 p-8 sm:p-10">
        <AuthBrand />
        <AuthTabs activeTab={activeTab} onChange={onTabChange} />
        {activeTab === "login" ? <LoginForm /> : registerForm}
        {googleButton && <div className="mt-6">{googleButton}</div>}
        {activeTab === "register" && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onTabChange("login")}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </main>
  );
}
