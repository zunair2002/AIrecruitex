"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthError, authInputClass, authSubmitClass } from "@/components/auth/AuthCardParts";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { BrandWordmark } from "@/components/layout/Logo";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/format";
import type { UserRole } from "@/lib/types";

/**
 * The public sign-up page. POST /api/auth/signup accepts exactly name, email,
 * password (min 6) and role, so those are the only fields collected — the
 * backend's User schema has nowhere to store anything else at sign-up.
 */
const SELECTABLE_ROLES: UserRole[] = ["hr", "candidate"];

const ROLE_BLURBS: Record<"hr" | "candidate", string> = {
  hr: "Post jobs, review AI-matched applicants and schedule interviews.",
  candidate: "Upload a resume, apply to jobs and take AI interviews.",
};

export default function RegisterPage() {
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>("hr");
  // Signup emails an OTP instead of returning a session; this holds the step.
  const [pending, setPending] = useState<{
    email: string;
    devOtp?: string;
  } | null>(null);
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
      setError(toErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f3f9]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <aside className="hidden flex-col justify-between border-r-4 border-brand bg-navy px-12 py-14 text-white lg:flex">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <BrandWordmark className="text-[2rem]" tone="dark" />
          </Link>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#d4b8f0] uppercase">
              Get started
            </p>
            <h1 className="font-display mt-5 max-w-sm text-4xl leading-[1.15]">
              One account. The whole hiring loop.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#9aa6c2]">
              Recruiters screen overnight. Candidates practice and apply. Same
              platform, same evidence.
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
            </div>
            <h2 className="font-display mb-1 text-2xl text-ink">
              Create an account
            </h2>
            <p className="mb-8 text-sm text-[#6b5f7a]">
              A short form. Then a code in your inbox.
            </p>

              {pending ? (
                <VerifyEmailForm
                  email={pending.email}
                  devOtp={pending.devOtp}
                />
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  <AuthError message={error} />

                  <div>
                    <span className="mb-2 block text-sm font-medium text-ink">
                      I am signing up as
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {SELECTABLE_ROLES.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setRole(option)}
                          className={`border p-4 text-left transition-colors ${
                            role === option
                              ? "border-brand bg-brand-light"
                              : "border-[#e0d6ea] bg-white hover:border-brand"
                          }`}
                        >
                          <span
                            className={`block text-sm font-semibold ${role === option ? "text-brand-dark" : "text-ink"}`}
                          >
                            {ROLE_LABELS[option]}
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            {ROLE_BLURBS[option as "hr" | "candidate"]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-name"
                      className="mb-2 block text-sm font-medium text-ink"
                    >
                      Full name
                    </label>
                    <input
                      id="register-name"
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
                      htmlFor="register-email"
                      className="mb-2 block text-sm font-medium text-ink"
                    >
                      Email
                    </label>
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="jane@acme.com"
                      className={authInputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="register-password"
                      className="mb-2 block text-sm font-medium text-ink"
                    >
                      Password
                    </label>
                    <input
                      id="register-password"
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`mt-4 ${authSubmitClass}`}
                  >
                    {isSubmitting ? "Creating account…" : "Create Account"}
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    We&apos;ll email you a 6-digit code to confirm your address.
                  </p>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-[#6b5f7a]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-brand hover:text-brand-dark"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
          </div>
        </section>
      </div>
    </main>
  );
}
