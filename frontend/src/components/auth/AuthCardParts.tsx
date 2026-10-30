"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, homePathForRole } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";
import { VerifyEmailForm } from "./VerifyEmailForm";
import { BrandWordmark } from "@/components/layout/Logo";

export function AuthBrand() {
  return (
    <div className="mb-8">
      <Link href="/" className="inline-block transition-opacity hover:opacity-80">
        <BrandWordmark className="text-[1.85rem]" />
      </Link>
      <p className="mt-2.5 text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">
        Screen with evidence
      </p>
    </div>
  );
}

export const authInputClass =
  "w-full rounded-sm border border-[#e0d6ea] bg-[#f6f3f9] px-4 py-3.5 text-ink placeholder:text-zinc-400 transition-colors focus:border-brand focus:bg-white focus:outline-none";

export const authSubmitClass =
  "w-full rounded-sm bg-brand px-4 py-3.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50";

export type AuthTab = "login" | "register";

export function AuthTabs({
  activeTab,
  onChange,
}: {
  activeTab: AuthTab;
  onChange: (tab: AuthTab) => void;
}) {
  return (
    <div className="mb-8 grid grid-cols-2 bg-[#f6f3f9] p-1">
      <button
        type="button"
        onClick={() => onChange("login")}
        className={`py-2.5 text-sm font-semibold transition-colors ${
          activeTab === "login"
            ? "bg-brand text-white"
            : "text-[#6b5f7a] hover:text-ink"
        }`}
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => onChange("register")}
        className={`py-2.5 text-sm font-semibold transition-colors ${
          activeTab === "register"
            ? "bg-brand text-white"
            : "text-[#6b5f7a] hover:text-ink"
        }`}
      >
        Create account
      </button>
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-sm border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set once signup succeeds; swaps this form for the OTP step.
  const [pending, setPending] = useState<{
    email: string;
    devOtp?: string;
  } | null>(null);

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
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      setPending({ email: result.email, devOtp: result.devOtp });
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  // Signing up no longer logs you in — the account must confirm the emailed
  // code first, and that is what issues the session.
  if (pending) {
    return <VerifyEmailForm email={pending.email} devOtp={pending.devOtp} />;
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <AuthError message={error} />
      <div>
        <label
          htmlFor={`${role}-name`}
          className="mb-2 block text-sm font-medium text-ink"
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
          className="mb-2 block text-sm font-medium text-ink"
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
          className="mb-2 block text-sm font-medium text-ink"
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
      <p className="text-center text-xs text-gray-400">
        We&apos;ll email you a 6-digit code to confirm your address.
      </p>
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
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-medium text-ink"
        >
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
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-medium text-ink"
        >
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
        <a href="#" className="text-sm font-medium text-brand hover:text-brand">
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
  portalLabel,
  tagline,
  support,
}: {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  registerForm: ReactNode;
  /** Rendered under whichever form is showing; omitted when unconfigured. */
  googleButton?: ReactNode;
  portalLabel: string;
  tagline: string;
  support: string;
}) {
  return (
    <main className="min-h-screen bg-[#f6f3f9]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <aside className="hidden flex-col justify-between border-r-4 border-brand bg-navy px-12 py-14 text-white lg:flex">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <BrandWordmark className="text-[2rem]" tone="dark" />
          </Link>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#d4b8f0] uppercase">
              {portalLabel}
            </p>
            <h1 className="font-display mt-5 max-w-sm text-4xl leading-[1.15]">
              {tagline}
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#9aa6c2]">
              {support}
            </p>
          </div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-[#9aa6c2] uppercase">
            Screen with evidence
          </p>
        </aside>

        <section className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md border border-[#e0d6ea] bg-white p-8 sm:p-10">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="inline-block">
                <BrandWordmark className="text-[1.7rem]" />
              </Link>
              <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">
                {portalLabel}
              </p>
            </div>
            <h2 className="font-display mb-1 text-2xl text-ink">
              {activeTab === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mb-7 text-sm text-[#6b5f7a]">
              {activeTab === "login"
                ? "Sign in to continue screening."
                : "A short form. Then a code in your inbox."}
            </p>
            <AuthTabs activeTab={activeTab} onChange={onTabChange} />
            {activeTab === "login" ? <LoginForm /> : registerForm}
            {googleButton && <div className="mt-6">{googleButton}</div>}
            {activeTab === "register" && (
              <p className="mt-6 text-center text-sm text-[#6b5f7a]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => onTabChange("login")}
                  className="font-semibold text-brand hover:text-brand-dark"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
