import type { ReactNode } from "react";
import Link from "next/link";

type LoginPageShellProps = {
  title: string;
  subtitle: string;
  accent: "indigo" | "purple";
  submitLabel: string;
  footer?: ReactNode;
  asideTitle: string;
  asideText: string;
};

const accentStyles = {
  indigo: {
    ring: "focus:ring-indigo-500",
    button: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
    gradient: "from-indigo-500 to-purple-600",
    text: "text-indigo-600 hover:text-indigo-500",
  },
  purple: {
    ring: "focus:ring-purple-500",
    button: "bg-purple-600 hover:bg-purple-700 shadow-purple-200",
    gradient: "from-purple-600 to-indigo-700",
    text: "text-purple-600 hover:text-purple-500",
  },
};

export function LoginPageShell({
  title,
  subtitle,
  accent,
  submitLabel,
  footer,
  asideTitle,
  asideText,
}: LoginPageShellProps) {
  const styles = accentStyles[accent];
  const inputClass = `w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 ${styles.ring} transition-all`;

  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] m-4">
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12">
            <div className="max-w-md w-full mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-500 mb-8">{subtitle}</p>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" placeholder="Enter your email" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input type="password" placeholder="••••••••" className={inputClass} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input type="checkbox" id="remember" className="w-4 h-4 text-indigo-600 border-gray-300 rounded" />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Remember me</label>
                  </div>
                  <a href="#" className={`text-sm font-medium ${styles.text}`}>Forgot password?</a>
                </div>
                <button type="submit" className={`w-full py-3 px-4 text-white font-semibold rounded-xl transition-colors shadow-lg ${styles.button}`}>
                  {submitLabel}
                </button>
              </form>

              {footer && <div className="mt-8 text-center">{footer}</div>}
            </div>
          </div>

          <div className={`hidden lg:flex w-1/2 items-center justify-center relative p-12 overflow-hidden bg-gradient-to-br ${styles.gradient}`}>
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl" />
            <div className="relative z-10 text-white max-w-lg">
              <h3 className="text-4xl font-bold mb-6">{asideTitle}</h3>
              <p className="text-white/80 text-lg leading-relaxed">{asideText}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
