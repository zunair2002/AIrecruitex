"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiErrorStatus, toErrorMessage } from "@/lib/api";
import {
  getOrgInterviewInvite,
  startOrgInterviewByToken,
  submitOrgInterviewAnswerByToken,
} from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDateTime, timeUntil } from "@/lib/format";
import { isFinishedSession, type InterviewSessionView } from "@/lib/types";
import {
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  Spinner,
} from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";
import { BrandWordmark } from "@/components/layout/Logo";
import { TurnHistory } from "./InterviewRunner";
import { VoiceAnswerField, useVoiceAnswer } from "./VoiceAnswer";
import { InterviewTimer, timerKey } from "./InterviewTimer";

/**
 * The organisational interview, opened from the emailed link.
 *
 * Authenticated by the `token` query parameter rather than a session — the
 * candidate may well open this on a device where they've never signed in, so
 * this page sits outside the candidate portal's auth gate.
 *
 * Results are hidden by design: the backend withholds score, result and
 * per-answer feedback for this interview type because it's graded for HR.
 */
export function OrgInterviewByToken() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const invite = useApiResource(
    (signal) => getOrgInterviewInvite(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  const [session, setSession] = useState<InterviewSessionView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const answer = useVoiceAnswer(
    session?.status === "in_progress" ? session.question : undefined,
  );

  /**
   * The countdown hit zero. The backend refuses an empty answer and sweeps
   * expired sessions itself every 30 seconds, so stop accepting answers and
   * wait for the server's verdict rather than trying to end it here.
   */
  const handleExpire = () => setHasTimedOut(true);

  useEffect(() => {
    if (!hasTimedOut) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const next = await startOrgInterviewByToken(token);
        if (!cancelled && isFinishedSession(next)) setSession(next);
      } catch {
        // Transient — try again on the next tick.
      }
    };

    void poll();
    const id = window.setInterval(poll, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [hasTimedOut, token]);

  const handleStart = async () => {
    setIsBusy(true);
    setError(null);
    try {
      setSession(await startOrgInterviewByToken(token));
    } catch (err) {
      // 410 = the deadline passed between rendering this question and sending
      // the answer. Switch to the time-up flow rather than showing a raw error.
      if (apiErrorStatus(err) === 410) {
        setHasTimedOut(true);
      } else {
        setError(toErrorMessage(err));
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = async () => {
    const text = answer.takeAnswer();
    if (!text) return;
    setIsBusy(true);
    setError(null);
    try {
      setSession(await submitOrgInterviewAnswerByToken(token, text));
      answer.reset();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  if (!token) {
    return (
      <Shell>
        <EmptyState
          title="This link is missing its interview token."
          description="Open the interview from the link in your invitation email."
        />
      </Shell>
    );
  }

  if (invite.isLoading)
    return (
      <Shell>
        <LoadingBlock label="Checking your invitation…" />
      </Shell>
    );

  if (invite.error) {
    return (
      <Shell>
        <ErrorBlock message={invite.error} onRetry={invite.reload} />
        <p className="mt-4 text-center text-sm text-[#898b96]">
          Invitation links expire. If yours has, ask the hiring team to send a
          new one.
        </p>
      </Shell>
    );
  }

  const data = invite.data;
  if (!data) return null;

  // Finished — submitted or timed out. Either way there is nothing more to do,
  // and deliberately no score to show: HR grades this interview.
  if (session && isFinishedSession(session)) {
    return (
      <Shell>
        <Card>
          <h1 className="text-2xl font-bold text-[#292b35]">
            {session.status === "expired"
              ? "Interview closed — time expired"
              : "Interview submitted"}
          </h1>
          <p className="mt-2 text-sm text-[#686b77]">
            Thank you, {data.candidateName ?? "there"}.{" "}
            {session.status === "expired"
              ? "The time limit ran out, so the interview closed itself. The answers you did give for "
              : "Your answers for "}
            <span className="font-semibold">{data.jobTitle}</span>{" "}
            {session.status === "expired" ? "were sent" : "have been sent"} to
            the hiring team. They review and score them, so there&apos;s no
            result to show here.
          </p>
        </Card>
        <div className="mt-6">
          <TurnHistory turns={session.turns} title="What you answered" />
        </div>
      </Shell>
    );
  }

  if (session) {
    const answered = session.turns.length;
    return (
      <Shell>
        <Card className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-[#898b96]">
            <span>{data.jobTitle}</span>
            <div className="flex items-center gap-3">
              <span>
                Question {session.questionNumber ?? answered + 1}
                {session.totalQuestions ? ` of ${session.totalQuestions}` : ""}
                {answer.voice.speaking && " · speaking…"}
              </span>
              <InterviewTimer
                key={timerKey(session)}
                session={session}
                onExpire={handleExpire}
              />
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-brand-light text-sm font-bold text-brand-dark">
              Q{session.questionNumber ?? answered + 1}
            </div>
            <h2 className="mt-1 text-xl font-bold text-[#292b35]">
              {session.question ?? "Preparing the next question…"}
            </h2>
          </div>
        </Card>

        {hasTimedOut && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 border border-amber-200 bg-amber-50 px-4 py-3"
          >
            <Spinner className="h-4 w-4" />
            <div>
              <p className="text-[12px] font-semibold text-amber-800">
                Time&apos;s up — closing your interview.
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700">
                Whatever you answered has been sent to the hiring team.
              </p>
            </div>
          </div>
        )}

        <Card>
          <VoiceAnswerField
            id="org-answer"
            label="Your answer"
            answer={answer}
            disabled={isBusy || hasTimedOut}
          />
          {error && (
            <div className="mt-4">
              <InlineError message={error} />
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!answer.value.trim() || isBusy || hasTimedOut}
            className={`${primaryButtonClass} mt-4 w-full`}
          >
            {isBusy ? "Submitting…" : "Submit answer"}
          </button>
          <p className="mt-2 text-center text-xs text-[#9698a2]">
            Your answers are scored by the hiring team — you won&apos;t see a
            score here.
          </p>
        </Card>

        {session.turns.length > 0 && (
          <div className="mt-6">
            <TurnHistory turns={session.turns} title="Answered so far" />
          </div>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <h1 className="text-2xl font-bold text-[#292b35]">
          {data.jobTitle} — interview
        </h1>
        <p className="mt-2 text-sm text-[#686b77]">
          Hello {data.candidateName ?? "there"}. The hiring team has invited you
          to complete a short set of questions for this role.
        </p>

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded bg-[#f8f8fb] p-4">
            <dt className="text-xs uppercase tracking-wide text-[#898b96]">
              Complete by
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[#292b35]">
              {formatDateTime(data.expiresAt)}
            </dd>
            <dd className="text-xs font-medium text-amber-700">
              {timeUntil(data.expiresAt)}
            </dd>
          </div>
          <div className="rounded bg-[#f8f8fb] p-4">
            <dt className="text-xs uppercase tracking-wide text-[#898b96]">
              How it works
            </dt>
            <dd className="mt-1 text-sm text-[#44464f]">
              Questions are asked one at a time. Answers are reviewed by the
              hiring team.
            </dd>
          </div>
        </dl>

        {error && (
          <div className="mt-4">
            <InlineError message={error} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={isBusy}
            className={primaryButtonClass}
          >
            {isBusy
              ? "Starting…"
              : data.started
                ? "Resume interview"
                : "Start interview"}
          </button>
          {data.calendarLink && (
            <a
              href={data.calendarLink}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-[#e9eaf0] bg-white px-6 py-3 font-semibold text-[#44464f] transition-colors hover:bg-[#f8f8fb]"
            >
              Add to calendar
            </a>
          )}
        </div>
      </Card>
    </Shell>
  );
}

/** Standalone chrome — this page is outside the signed-in portal shell. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f8f8fb] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex justify-center">
          <BrandWordmark className="text-[1.5rem]" />
        </div>
        {children}
      </div>
    </main>
  );
}
