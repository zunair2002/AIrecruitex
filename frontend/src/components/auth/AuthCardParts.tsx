import type { ReactNode } from "react";
import Link from "next/link";

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

export function LoginForm() {
  return (
    <form className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input type="email" placeholder="you@company.com" className={authInputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input type="password" placeholder="Your password" className={authInputClass} />
      </div>
      <button
        type="submit"
        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
      >
        Login
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
}: {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  registerForm: ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 p-8 sm:p-10">
        <AuthBrand />
        <AuthTabs activeTab={activeTab} onChange={onTabChange} />
        {activeTab === "login" ? <LoginForm /> : registerForm}
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
