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
      className={`flex items-center gap-2 border px-2.5 py-1.5 ${
        isOut
          ? "border-rose-200 bg-rose-50"
          : isLow
            ? "border-amber-200 bg-amber-50"
            : "border-[#e9eaf0] bg-white"
      }`}
    >
      <Clock3
        aria-hidden="true"
        className={`h-3.5 w-3.5 shrink-0 ${
          isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-[#767985]"
        }`}
      />
      <div className="min-w-0">
        <p
          aria-live={isLow || isOut ? "assertive" : "off"}
          className={`text-[13px] font-bold leading-none tabular-nums tracking-[-0.03em] ${
            isOut ? "text-rose-700" : isLow ? "text-amber-700" : "text-[#292b35]"
          }`}
        >
          {isOut ? "Time up" : formatCountdown(secondsLeft)}
        </p>
        {timeLimitSeconds ? (
          <div className="mt-1 h-0.5 w-16 overflow-hidden rounded-full bg-[#ececf1]">
            <div
              className={`h-full transition-[width] duration-1000 ease-linear ${
                isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-[#6b5ce7]"
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
