"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { formatCountdown } from "@/lib/format";
import type { InterviewSessionInProgress } from "@/lib/types";

/**
 * The interview countdown.
 *
 * The server owns the clock: every session response carries `remainingSeconds`
 * computed against the server's time, so the parent remounts this component on
 * each fresh figure (see `timerKey`) rather than letting the browser's clock
 * drift across a whole interview. Sessions with no time limit — job AI
 * interviews, and anything created before timers existed — send no timer fields
 * at all, and this renders nothing for them.
 *
 * Running out is the backend's decision, not ours. Reaching zero only notifies
 * the parent, which stops accepting answers and waits for the server's verdict;
 * the session is never finished client-side.
 */
export function InterviewTimer({
  session,
  onExpire,
}: {
  session: InterviewSessionInProgress;
  onExpire?: () => void;
}) {
  const { remainingSeconds, timeLimitSeconds } = session;
  const hasTimer = typeof remainingSeconds === "number";

  const [secondsLeft, setSecondsLeft] = useState(remainingSeconds ?? 0);

  useEffect(() => {
    if (!hasTimer) return;
    const id = window.setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [hasTimer]);

  // Once at zero the tick above is a no-op, so this fires exactly once.
  useEffect(() => {
    if (!hasTimer || secondsLeft > 0) return;
    onExpire?.();
  }, [hasTimer, secondsLeft, onExpire]);

  if (!hasTimer) return null;

  const isOut = secondsLeft <= 0;
  const isLow = secondsLeft <= 60 && !isOut;
  const elapsedFraction =
    timeLimitSeconds && timeLimitSeconds > 0
      ? Math.min(1, Math.max(0, 1 - secondsLeft / timeLimitSeconds))
      : 0;

  return (
    <div
      className={`inline-flex h-10 shrink-0 items-center gap-2.5 rounded-full px-3.5 shadow-xs ring-1 ring-inset ${
        isOut
          ? "bg-rose-50 ring-rose-600/20"
          : isLow
            ? "bg-brand-50 ring-brand-500/20"
            : "bg-surface ring-line"
      }`}
    >
      <Clock3
        aria-hidden="true"
        className={`h-4 w-4 shrink-0 ${
          isOut ? "text-rose-600" : isLow ? "text-brand-500" : "text-brand-700"
        }`}
      />
      <div className="min-w-0">
        <p
          aria-live={isLow || isOut ? "assertive" : "off"}
          className={`font-display text-sm font-semibold leading-none tabular-nums ${
            isOut ? "text-rose-700" : isLow ? "text-brand-600" : "text-ink"
          }`}
        >
          {isOut ? "Time up" : formatCountdown(secondsLeft)}
        </p>
        {timeLimitSeconds ? (
          <div className="mt-1.5 h-1 w-14 overflow-hidden rounded-full bg-surface-3">
            <div
              className={`h-full rounded-full transition-[width] duration-1000 ease-linear motion-reduce:transition-none ${
                isOut ? "bg-brand-200" : isLow ? "bg-brand-300" : "bg-brand-600"
              }`}
              style={{ width: `${elapsedFraction * 100}%` }}
            />
          </div>
        ) : null}
      </div>
      <span className="sr-only">
        {isOut
          ? "The interview time limit has run out."
          : `${formatCountdown(secondsLeft)} remaining.`}
      </span>
    </div>
  );
}

/**
 * Remount key: a new figure from the server replaces the running countdown
 * instead of letting a stale one keep ticking.
 */
export function timerKey(session: InterviewSessionInProgress): string {
  return `${session.sessionId}-${session.remainingSeconds ?? "none"}`;
}
