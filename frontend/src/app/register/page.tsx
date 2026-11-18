"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, ShieldCheck, UserRound, Users } from "lucide-react";
import {
  AuthCardHeading,
  AuthError,
  AuthSplitLayout,
  PasswordField,
  authInputClass,
  type AuthBenefit,
} from "@/components/auth/AuthCardParts";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { Button } from "@/components/ui/Button";
import { labelClass } from "@/components/ui/controls";
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

const REGISTER_BENEFITS: AuthBenefit[] = [
  {
    icon: <Briefcase />,
    title: "For recruiters",
    description: "Post jobs, get AI-ranked applicants and run interviews overnight.",
  },
  {
    icon: <Users />,
    title: "For candidates",
    description: "Apply, practice AI interviews and track every application.",
  },
  {
    icon: <ShieldCheck />,
    title: "Verified accounts",
    description: "A one-time code confirms your email before you start.",
  },
];

export default function RegisterPage() {
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>("hr");
  // Signup emails an OTP instead of returning a session; this holds the step.
  const [pending, setPending] = useState<{ email: string } | null>(null);
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
      setPending({ email: result.email });
    } catch (err) {
      setError(toErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      eyebrow="Get started"
      tagline="One account. The whole hiring loop."
      support="Recruiters screen overnight. Candidates practice and apply. Same platform, same evidence."
      benefits={REGISTER_BENEFITS}
    >
      <AuthCardHeading
        title="Create an account"
        description="A short form. Then a code in your inbox."
      />

      {pending ? (
        <VerifyEmailForm email={pending.email} />
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <AuthError message={error} />

          <fieldset>
            <legend className={labelClass}>I am signing up as</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SELECTABLE_ROLES.map((option) => {
                const isSelected = role === option;
                const Icon = option === "hr" ? Briefcase : UserRound;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setRole(option)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:flex-col ${
                      isSelected
                        ? "border-brand-600 bg-brand-50 ring-1 ring-inset ring-brand-600"
                        : "border-line bg-white hover:border-brand-200 hover:bg-surface-2"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-brand-700 text-white"
                          : "bg-surface-3 text-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">
                        {ROLE_LABELS[option]}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {ROLE_BLURBS[option as "hr" | "candidate"]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="register-name" className={labelClass}>
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
            <label htmlFor="register-email" className={labelClass}>
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

          <PasswordField
            id="register-password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={6}
            placeholder="At least 6 characters"
          />

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-xs text-muted">
            We&apos;ll email you a 6-digit code to confirm your address.
          </p>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="rounded font-semibold text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
