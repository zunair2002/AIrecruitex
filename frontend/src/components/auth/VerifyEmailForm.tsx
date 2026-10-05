"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, homePathForRole } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { AuthError } from "./AuthCardParts";
import { InlineSuccess } from "@/components/ui/Feedback";

/**
 * Step two of signing up: the backend emails a 6-digit OTP and only issues a
 * session once it's confirmed, so a password account lands here before it can
 * reach the app.
 *
 * In non-production the server echoes the code back as `devOtp`, which is
 * pre-filled here so testing never blocks on email delivery.
 */
export function VerifyEmailForm({
  email,
  devOtp,
  onResendDevOtp,
}: {
  email: string;
  devOtp?: string;
  onResendDevOtp?: (otp?: string) => void;
}) {
  const { verifyEmail, resendOtp } = useAuth();
  const router = useRouter();

  const [otp, setOtp] = useState(devOtp ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    devOtp ? "Development mode: the code below was filled in for you." : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  // Rate-limits the resend button so a stuck inbox doesn't become mash-the-button.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await verifyEmail(email, otp.trim());
      router.replace(homePathForRole(user.role));
    } catch (err) {
      setError(toErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setNotice(null);
    try {
      const result = await resendOtp(email);
      setSecondsLeft(30);
      if (result.devOtp) setOtp(result.devOtp);
      onResendDevOtp?.(result.devOtp);
      setNotice(
        result.devOtp
          ? "A new code was issued and filled in for you."
          : "A new code is on its way to your inbox.",
      );
    } catch (err) {
      setError(toErrorMessage(err));
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className="text-lg font-bold text-gray-900">Check your email</h2>
        <p className="mt-1 text-sm text-gray-500">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-gray-700">{email}</span>. Enter it
          to finish setting up your account.
        </p>
      </div>

      <AuthError message={error} />
      <InlineSuccess message={notice} />

      <div>
        <label
          htmlFor="verify-otp"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Verification code
        </label>
        <input
          id="verify-otp"
          ref={inputRef}
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={6}
          value={otp}
          onChange={(event) =>
            setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="123456"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-gray-900 placeholder:tracking-normal placeholder:text-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="mt-2 text-xs text-gray-400">The code expires in 10 minutes.</p>
      </div>

      <button
        type="submit"
        disabled={otp.length !== 6 || isSubmitting}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
      >
        {isSubmitting ? "Verifying…" : "Verify and continue"}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={secondsLeft > 0}
        className="w-full text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 disabled:text-gray-400"
      >
        {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
      </button>
    </form>
  );
}
