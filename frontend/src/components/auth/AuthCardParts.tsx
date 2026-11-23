"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquareText, ListChecks, ScanSearch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { resolveNextPath } from "@/lib/nextPath";
import type { UserRole } from "@/lib/types";
import { VerifyEmailForm } from "./VerifyEmailForm";
import { BrandWordmark } from "@/components/layout/Logo";
import { Button, buttonClass } from "@/components/ui/Button";
import { InlineError } from "@/components/ui/Feedback";
import { checkboxClass, labelClass } from "@/components/ui/controls";

export function AuthBrand() {
  return (
    <div className="mb-8">
      <Link
        href="/"
        className="inline-block rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <BrandWordmark className="text-3xl" />
      </Link>
      <p className="mt-2.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
        Screen with evidence
      </p>
    </div>
  );
}

/** Auth inputs are one step taller (h-11) than portal inputs; 16px text on phones avoids iOS zoom. */
export const authInputClass =
  "block h-11 min-h-11 w-full rounded-lg border border-line bg-white px-3.5 text-base text-ink placeholder:text-subtle shadow-xs transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 aria-[invalid=true]:border-rose-300 sm:text-sm";

/**
 * Password input with a "Show password" checkbox beneath it.
 *
 * A labelled checkbox rather than an icon inside the field: the state is stated
 * in words instead of inferred from an icon, the hit target is the whole label,
 * and it needs no `aria-pressed` or icon-only `aria-label` to be understood.
 * The field reverts to hidden on every mount, so a password is never revealed
 * by default.
 */
export function PasswordField({
  id,
  label = "Password",
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
  required = true,
  labelAction,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (next: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  /** Optional link shown at the right of the label row (e.g. "Forgot password?"). */
  labelAction?: ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleId = useId();

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium text-body">
          {label}
        </label>
        {labelAction}
      </div>
      <input
        id={id}
        name="password"
        type={isVisible ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={authInputClass}
      />
      <div className="mt-2.5 flex items-center gap-2">
        <input
          id={toggleId}
          type="checkbox"
          checked={isVisible}
          onChange={(event) => setIsVisible(event.target.checked)}
          aria-controls={id}
          className={checkboxClass}
        />
        <label
          htmlFor={toggleId}
          className="cursor-pointer select-none text-sm text-muted transition-colors hover:text-ink"
        >
          Show password
        </label>
      </div>
    </div>
  );
}

export const authSubmitClass = buttonClass({ size: "lg", fullWidth: true });

export type AuthTab = "login" | "register";

/** Sign in / Create account switch — a full-width segmented control. */
export function AuthTabs({
  activeTab,
  onChange,
}: {
  activeTab: AuthTab;
  onChange: (tab: AuthTab) => void;
}) {
  const tabs: { id: AuthTab; label: string }[] = [
    { id: "login", label: "Sign in" },
    { id: "register", label: "Create account" },
  ];
  return (
    <div
      role="group"
      aria-label="Sign in or create an account"
      className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-surface-3 p-1"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.id)}
            className={`h-10 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              isActive
                ? "bg-white text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  return <InlineError message={message} />;
}

export { toErrorMessage } from "@/lib/api";

/** A brand-panel value prop: icon, short title, one line of detail. */
export type AuthBenefit = {
  icon: ReactNode;
  title: string;
  description: string;
};

const DEFAULT_BENEFITS: AuthBenefit[] = [
  {
    icon: <ScanSearch />,
    title: "AI-matched applicants",
    description: "Every resume parsed and scored against the job.",
  },
  {
    icon: <MessageSquareText />,
    title: "AI interviews on demand",
    description: "Candidates interview on their schedule; you get scored answers.",
  },
  {
    icon: <ListChecks />,
    title: "Evidence-based shortlists",
    description: "Decide with scores, verdicts and transcripts side by side.",
  },
];

/**
 * The split auth layout: a dark brand panel with value props on lg+, and the
 * form card centred on the right (a single centred card on phones).
 */
export function AuthSplitLayout({
  eyebrow,
  tagline,
  support,
  benefits = DEFAULT_BENEFITS,
  children,
  footer,
}: {
  /** Portal label, e.g. "Hiring portal". */
  eyebrow: string;
  tagline: string;
  support: string;
  benefits?: AuthBenefit[];
  /** The card's contents. */
  children: ReactNode;
  /** Small print under the card (e.g. a link to the other portal). */
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-canvas">
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <aside className="relative hidden overflow-hidden bg-sidebar px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-700/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-500/20 blur-3xl"
          />

          <Link
            href="/"
            className="relative w-fit rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
          >
            <BrandWordmark className="text-3xl" tone="dark" />
          </Link>

          <div className="relative max-w-md py-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
              {eyebrow}
            </p>
            <p className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
              {tagline}
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              {support}
            </p>
            <ul className="mt-10 space-y-6">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300 ring-1 ring-inset ring-white/10 [&>svg]:h-5 [&>svg]:w-5"
                  >
                    {benefit.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {benefit.title}
                    </p>
                    <p className="mt-0.5 text-sm text-white/60">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs font-medium uppercase tracking-wider text-white/40">
            Screen with evidence
          </p>
        </aside>

        <section className="flex flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex flex-col items-center text-center lg:hidden">
              <Link
                href="/"
                className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <BrandWordmark className="text-2xl" />
              </Link>
              <p className="mt-2 text-sm font-medium text-muted">{eyebrow}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8">
              {children}
            </div>
            {footer && (
              <div className="mt-6 text-center text-sm text-muted">{footer}</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/** Heading block at the top of an auth card. */
export function AuthCardHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-1.5 text-sm text-muted">{description}</p>
    </div>
  );
}

const inlineLinkClass =
  "rounded font-semibold text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

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
  const [pending, setPending] = useState<{ email: string } | null>(null);

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
      setPending({ email: result.email });
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
    return <VerifyEmailForm email={pending.email} />;
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <AuthError message={error} />
      <div>
        <label htmlFor={`${role}-name`} className={labelClass}>
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
        <label htmlFor={`${role}-email`} className={labelClass}>
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
      <PasswordField
        id={`${role}-password`}
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        minLength={6}
        placeholder="At least 6 characters"
      />
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? "Creating account…" : submitLabel}
      </Button>
      <p className="text-center text-xs text-muted">
        We&apos;ll email you a 6-digit code to confirm your address.
      </p>
    </form>
  );
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  // Set when the visitor was sent here from somewhere specific (a pricing CTA,
  // a deep link). Validated in resolveNextPath — it comes from the URL.
  const nextPath = useSearchParams().get("next");

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
      router.replace(resolveNextPath(nextPath, user.role));
    } catch (err) {
      // The backend refuses a deactivated account at login too. Send them to
      // the dedicated page rather than squeezing the explanation into the auth
      // card, where the sign-in tabs would still invite another attempt.
      if (err instanceof Error && /deactivat/i.test(err.message)) {
        router.replace("/account-deactivated");
        return;
      }
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
        <label htmlFor="login-email" className={labelClass}>
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
      <PasswordField
        id="login-password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        placeholder="Your password"
        labelAction={
          <a href="#" className={`text-sm ${inlineLinkClass}`}>
            Forgot password?
          </a>
        }
      />
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
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
  benefits,
  switchPortal,
}: {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  registerForm: ReactNode;
  /** Rendered under whichever form is showing; omitted when unconfigured. */
  googleButton?: ReactNode;
  portalLabel: string;
  tagline: string;
  support: string;
  /** Value props for the brand panel (lg+). */
  benefits?: AuthBenefit[];
  /** Link to the other portal's sign-in, shown under the card. */
  switchPortal?: { prompt: string; label: string; href: string };
}) {
  return (
    <AuthSplitLayout
      eyebrow={portalLabel}
      tagline={tagline}
      support={support}
      benefits={benefits}
      footer={
        switchPortal && (
          <p>
            {switchPortal.prompt}{" "}
            <Link href={switchPortal.href} className={inlineLinkClass}>
              {switchPortal.label}
            </Link>
          </p>
        )
      }
    >
      <AuthCardHeading
        title={activeTab === "login" ? "Welcome back" : "Create your account"}
        description={
          activeTab === "login"
            ? "Sign in to continue screening."
            : "A short form. Then a code in your inbox."
        }
      />
      <AuthTabs activeTab={activeTab} onChange={onTabChange} />
      {activeTab === "login" ? <LoginForm /> : registerForm}
      {googleButton && <div className="mt-6">{googleButton}</div>}
      <p className="mt-6 text-center text-sm text-muted">
        {activeTab === "register" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onTabChange("login")}
              className={inlineLinkClass}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            New here?{" "}
            <button
              type="button"
              onClick={() => onTabChange("register")}
              className={inlineLinkClass}
            >
              Create an account
            </button>
          </>
        )}
      </p>
    </AuthSplitLayout>
  );
}
