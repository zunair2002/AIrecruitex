"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toErrorMessage } from "@/lib/api";
import {
  getOrgInterviewInvite,
  startOrgInterviewByToken,
  submitOrgInterviewAnswerByToken,
} from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDateTime, timeUntil } from "@/lib/format";
import type { InterviewSessionView } from "@/lib/types";
import {
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
} from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";
import { LogoMark } from "@/components/layout/Logo";
import { TurnHistory } from "./InterviewRunner";

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
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleStart = async () => {
    setIsBusy(true);
    setError(null);
    try {
      setSession(await startOrgInterviewByToken(token));
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setIsBusy(true);
    setError(null);
    try {
      setSession(await submitOrgInterviewAnswerByToken(token, answer.trim()));
      setAnswer("");
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

  if (invite.isLoading) return <Shell><LoadingBlock label="Checking your invitation…" /></Shell>;

  if (invite.error) {
    return (
      <Shell>
        <ErrorBlock message={invite.error} onRetry={invite.reload} />
        <p className="mt-4 text-center text-sm text-gray-500">
          Invitation links expire. If yours has, ask the hiring team to send a new one.
        </p>
      </Shell>
    );
  }

  const data = invite.data;
  if (!data) return null;

  // Completed: nothing more to do, and deliberately no score to show.
  if (session?.status === "completed") {
    return (
      <Shell>
        <Card>
          <h1 className="text-2xl font-bold text-gray-900">Interview submitted</h1>
          <p className="mt-2 text-sm text-gray-600">
            Thank you, {data.candidateName ?? "there"}. Your answers for{" "}
            <span className="font-semibold">{data.jobTitle}</span> have been sent to
            the hiring team. They review and score them, so there&apos;s no result
            to show here.
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
          <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
            <span>{data.jobTitle}</span>
            <span>
              {answered} answered · Question {session.questionNumber ?? answered + 1}
            </span>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
              Q{session.questionNumber ?? answered + 1}
            </div>
            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {session.question ?? "Preparing the next question…"}
            </h2>
          </div>
        </Card>

        <Card>
          <label
            htmlFor="org-answer"
            className="mb-3 block text-sm font-semibold text-gray-900"
          >
            Your answer
          </label>
          <textarea
            id="org-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            rows={8}
            disabled={isBusy}
            placeholder="Type your answer here…"
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
          />
          {error && (
            <div className="mt-4">
              <InlineError message={error} />
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!answer.trim() || isBusy}
            className={`${primaryButtonClass} mt-4 w-full`}
          >
            {isBusy ? "Submitting…" : "Submit answer"}
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Your answers are scored by the hiring team — you won&apos;t see a score here.
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
        <h1 className="text-2xl font-bold text-gray-900">
          {data.jobTitle} — interview
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Hello {data.candidateName ?? "there"}. The hiring team has invited you to
          complete a short set of questions for this role.
        </p>

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Complete by
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {formatDateTime(data.expiresAt)}
            </dd>
            <dd className="text-xs font-medium text-amber-700">
              {timeUntil(data.expiresAt)}
            </dd>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              How it works
            </dt>
            <dd className="mt-1 text-sm text-gray-700">
              Questions are asked one at a time. Answers are reviewed by the hiring
              team.
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
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
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
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          <LogoMark className="h-9 w-9" rounded="rounded-lg" />
          <span className="text-xl font-bold text-gray-900">AiRecruitex</span>
        </div>
        {children}
      </div>
    </main>
  );
}
