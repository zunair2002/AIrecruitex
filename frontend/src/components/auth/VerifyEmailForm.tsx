"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, homePathForRole } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { AuthError } from "./AuthCardParts";
import { MailCheck } from "lucide-react";
import { InlineSuccess } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { helpTextClass, labelClass } from "@/components/ui/controls";

/**
 * Step two of signing up: the backend emails a 6-digit OTP and only issues a
 * session once it's confirmed, so a password account lands here before it can
 * reach the app.
 *
 * The code is only ever delivered by email — the user types it in here.
 */
export function VerifyEmailForm({ email }: { email: string }) {
  const { verifyEmail, resendOtp } = useAuth();
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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
      await resendOtp(email);
      setSecondsLeft(30);
      setNotice("A new code is on its way to your inbox.");
    } catch (err) {
      setError(toErrorMessage(err));
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/10"
        >
          <MailCheck className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Check your email</h2>
        <p className="mt-1 text-sm text-muted">
          We sent a 6-digit code to{" "}
          <span className="break-all font-medium text-ink">{email}</span>. Enter
          it to finish setting up your account.
        </p>
      </div>

      <AuthError message={error} />
      <InlineSuccess message={notice} />

      <div>
        <label htmlFor="verify-otp" className={labelClass}>
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
          className="block h-14 w-full rounded-lg border border-line bg-white px-4 text-center font-display text-2xl font-semibold tracking-[0.4em] tabular-nums text-ink shadow-xs transition placeholder:font-normal placeholder:tracking-normal placeholder:text-subtle focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        />
        <p className={helpTextClass}>The code expires in 10 minutes.</p>
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={otp.length !== 6}
        loading={isSubmitting}
      >
        {isSubmitting ? "Verifying…" : "Verify and continue"}
      </Button>

      <Button
        variant="ghost"
        fullWidth
        onClick={handleResend}
        disabled={secondsLeft > 0}
        className="tabular-nums"
      >
        {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
      </Button>
    </form>
  );
}
