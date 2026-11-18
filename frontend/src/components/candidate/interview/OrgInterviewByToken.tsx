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
  CalendarClock,
  CalendarPlus,
  CircleCheck,
  ListChecks,
  Play,
  Send,
  TimerOff,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
} from "@/components/ui/Feedback";
import { BrandWordmark } from "@/components/layout/Logo";
import { TurnHistory } from "./InterviewRunner";
import { VoiceAnswerField, useVoiceAnswer } from "./VoiceAnswer";
import { InterviewTimer, timerKey } from "./InterviewTimer";
import { InterviewProgressHeader, QuestionCard, TimeUpNotice } from "./RunnerParts";

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
        <div className={CARD}>
          <LoadingBlock label="Checking your invitation…" />
        </div>
      </Shell>
    );

  if (invite.error) {
    return (
      <Shell>
        <ErrorBlock message={invite.error} onRetry={invite.reload} />
        <p className="mt-4 text-center text-sm text-muted">
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
    const expired = session.status === "expired";
    return (
      <Shell>
        <section className={`${CARD} text-center`}>
          <span
            aria-hidden="true"
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
              expired ? "bg-brand-50 text-brand-500" : "bg-brand-50 text-brand-600"
            }`}
          >
            {expired ? (
              <TimerOff className="h-6 w-6" />
            ) : (
              <CircleCheck className="h-6 w-6" />
            )}
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {expired ? "Interview closed — time expired" : "Interview submitted"}
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
            Thank you, {data.candidateName ?? "there"}.{" "}
            {expired
              ? "The time limit ran out, so the interview closed itself. The answers you did give for "
              : "Your answers for "}
            <span className="font-semibold text-ink">{data.jobTitle}</span>{" "}
            {expired ? "were sent" : "have been sent"} to
            the hiring team. They review and score them, so there&apos;s no
            result to show here.
          </p>
        </section>
        <div className="mt-6">
          <TurnHistory turns={session.turns} title="What you answered" />
        </div>
      </Shell>
    );
  }

  if (session) {
    const answered = session.turns.length;
    const questionNumber = session.questionNumber ?? answered + 1;
    return (
      <Shell>
        <div className="space-y-6">
          <InterviewProgressHeader
            eyebrow="Interview"
            title={data.jobTitle}
            progressLabel={
              <>
                Question {questionNumber}
                {session.totalQuestions ? ` of ${session.totalQuestions}` : ""}
                {answer.voice.speaking && " · speaking…"}
              </>
            }
            answered={answered}
            total={session.totalQuestions}
            timer={
              <InterviewTimer
                key={timerKey(session)}
                session={session}
                onExpire={handleExpire}
              />
            }
          />

          {hasTimedOut && (
            <TimeUpNotice
              title="Time's up — closing your interview."
              detail="Whatever you answered has been sent to the hiring team."
            />
          )}

          <QuestionCard
            eyebrow={`Question ${questionNumber}`}
            badge={`Q${questionNumber}`}
            question={session.question ?? "Preparing the next question…"}
          />

          <section aria-label="Your answer" className={CARD}>
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
            <Button
              size="lg"
              fullWidth
              onClick={handleSubmit}
              disabled={!answer.value.trim() || isBusy || hasTimedOut}
              loading={isBusy}
              leadingIcon={<Send aria-hidden="true" />}
              className="mt-5"
            >
              {isBusy ? "Submitting…" : "Submit answer"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted">
              Your answers are scored by the hiring team — you won&apos;t see a
              score here.
            </p>
          </section>

          {session.turns.length > 0 && (
            <TurnHistory turns={session.turns} title="Answered so far" />
          )}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className={CARD}>
        <Badge tone="info" dot>
          Interview invitation
        </Badge>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {data.jobTitle} — interview
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
          Hello {data.candidateName ?? "there"}. The hiring team has invited you
          to complete a short set of questions for this role.
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="flex items-start gap-3 rounded-lg border border-line-soft bg-surface-2 p-4">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500"
            >
              <CalendarClock className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-muted">Complete by</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                {formatDateTime(data.expiresAt)}
              </dd>
              <dd className="text-xs font-medium text-brand-600">
                {timeUntil(data.expiresAt)}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-line-soft bg-surface-2 p-4">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
            >
              <ListChecks className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-muted">How it works</dt>
              <dd className="mt-0.5 text-sm text-body">
                Questions are asked one at a time. Answers are reviewed by the
                hiring team.
              </dd>
            </div>
          </div>
        </dl>

        {error && (
          <div className="mt-5">
            <InlineError message={error} />
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-line-soft pt-6 sm:flex-row">
          <Button
            size="lg"
            onClick={handleStart}
            disabled={isBusy}
            loading={isBusy}
            leadingIcon={<Play aria-hidden="true" />}
            className="w-full sm:w-auto"
          >
            {isBusy
              ? "Starting…"
              : data.started
                ? "Resume interview"
                : "Start interview"}
          </Button>
          {data.calendarLink && (
            <a
              href={data.calendarLink}
              target="_blank"
              rel="noreferrer"
              className={buttonClass({
                variant: "secondary",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              <CalendarPlus aria-hidden="true" />
              Add to calendar
            </a>
          )}
        </div>
      </section>
    </Shell>
  );
}

const CARD = "rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-8";

/** Standalone chrome — this page is outside the signed-in portal shell. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col bg-canvas px-4 py-8 sm:py-12"
    >
      <div className="mx-auto w-full max-w-3xl flex-1">
        <div className="mb-8 flex justify-center sm:mb-10">
          <BrandWordmark className="text-2xl" />
        </div>
        {children}
      </div>
      <p className="mt-10 text-center text-xs text-muted">
        Secure interview link · Powered by AiRecruitex
      </p>
    </main>
  );
}
