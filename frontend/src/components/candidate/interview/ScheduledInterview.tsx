"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInterviewReport } from "@/lib/interviewApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  isFinishedSession,
  type InterviewSessionCompleted,
  type InterviewSessionView,
  type ObjectId,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, ErrorBlock, LoadingBlock } from "@/components/ui/Feedback";
import { InterviewRunner } from "./InterviewRunner";

/**
 * Opens one interview session by id — used for the interviews HR schedules
 * against an application, and for revisiting a finished practice session.
 */
export function ScheduledInterview({ sessionId }: { sessionId: ObjectId }) {
  const { token } = useAuth();
  const resource = useApiResource(
    (signal) => getInterviewReport(sessionId, token, signal),
    [sessionId, token],
    { enabled: Boolean(token) },
  );

  // Answering advances the session locally; until then the fetched view is used.
  const [answered, setAnswered] = useState<InterviewSessionView | null>(null);
  const session = answered ?? resource.data;

  if (resource.isLoading && !session) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <LoadingBlock label="Loading interview…" />
      </div>
    );
  }
  if (resource.error && !session) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
        <ErrorBlock message={resource.error} onRetry={resource.reload} />
        <Button href="/candidate/applications" variant="secondary">
          Back to my applications
        </Button>
      </div>
    );
  }
  if (!session) return null;

  // Job (HR-scheduled) AI interviews are graded by the hiring team: once
  // finished, the candidate sees a summary only — no questions, answers or scores.
  if (isJobInterview(session) && isFinishedSession(session)) {
    return (
      <JobInterviewFinished
        session={session}
        justCompleted={Boolean(answered && isFinishedSession(answered))}
      />
    );
  }

  return (
    <InterviewRunner
      session={session}
      onSessionChange={setAnswered}
      title="AI Interview"
      subtitle={
        session.status === "completed"
          ? "This interview is complete."
          : "Answer each question; the interviewer scores as you go."
      }
    />
  );
}

const COMPLETION_NOTICE_MS = 4000;

/** Practice sessions are tagged basic/technical (round 1/2); job interviews are "combined". */
function isJobInterview(session: InterviewSessionView): boolean {
  return (
    session.stage === "combined" ||
    (session.stage === undefined && session.round === undefined)
  );
}

function JobInterviewFinished({
  session,
  justCompleted,
}: {
  session: InterviewSessionCompleted;
  justCompleted: boolean;
}) {
  // The "interview submitted" notice disappears on its own after ~4 seconds.
  const [showNotice, setShowNotice] = useState(justCompleted);
  useEffect(() => {
    if (!showNotice) return;
    const id = window.setTimeout(
      () => setShowNotice(false),
      COMPLETION_NOTICE_MS,
    );
    return () => window.clearTimeout(id);
  }, [showNotice]);

  const timedOut = session.status === "expired" || session.timedOut;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
      {showNotice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700 ring-1 ring-inset ring-success-600/20"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-success-600"
          />
          <span className="min-w-0">
            <span className="font-semibold">Interview submitted.</span> Thank
            you — your answers have been sent to the hiring team.
          </span>
        </div>
      )}
      <Card
        title="AI interview"
        description={timedOut ? "Ended when the time limit ran out" : "Completed"}
      >
        <dl className="grid grid-cols-1 gap-4 border-t border-line-soft pt-5 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs font-medium text-muted">Status</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {timedOut ? "Time expired" : "Completed"}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-medium text-muted">Questions answered</dt>
            <dd className="mt-1 text-sm tabular-nums text-ink">
              {session.turns.length}
            </dd>
          </div>
        </dl>
        <p className="mt-5 flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-inset ring-brand-600/10">
          <Info
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-brand-700"
          />
          <span className="min-w-0">
            This interview is reviewed by the hiring team. You&apos;ll hear back
            on your application.
          </span>
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button href="/candidate/applications">Back to my applications</Button>
          <Button href="/candidate/interview/result" variant="secondary">
            Interview results
          </Button>
        </div>
      </Card>
    </div>
  );
}
