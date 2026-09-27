"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, homePathForRole } from "@/context/AuthContext";
import { getGoogleIdToken, isGoogleSignInConfigured } from "@/lib/firebase";
import { toErrorMessage } from "@/lib/api";
import type { UserRole } from "@/lib/types";
import { InlineError } from "@/components/ui/Feedback";

/**
 * Google sign-in for POST /api/auth/google.
 *
 * `role` is only used when the account doesn't exist yet — the backend ignores
 * it for a returning user and keeps the role already on the record. An email
 * that signed up with a password is rejected server-side with a 409, which is
 * surfaced here as-is.
 *
 * Renders nothing when the Firebase env vars are missing, so the button never
 * appears in a state where it cannot work.
 */
export function GoogleSignInButton({
  role,
  label = "Continue with Google",
}: {
  role: UserRole;
  label?: string;
}) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isGoogleSignInConfigured()) return null;

  const handleClick = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      const idToken = await getGoogleIdToken();
      const user = await loginWithGoogle(idToken, role);
      router.replace(homePathForRole(user.role));
    } catch (err) {
      setError(toErrorMessage(err));
      setIsSigningIn(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          or
        </span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <InlineError message={error} />

      <button
        type="button"
        onClick={handleClick}
        disabled={isSigningIn}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark />
        {isSigningIn ? "Opening Google…" : label}
      </button>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
