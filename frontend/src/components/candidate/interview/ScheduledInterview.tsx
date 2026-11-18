"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getInterviewReport } from "@/lib/interviewApi";
import { useApiResource } from "@/lib/useApiResource";
import type { InterviewSessionView, ObjectId } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorBlock, LoadingBlock } from "@/components/ui/Feedback";
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

  return (
    <InterviewRunner
      session={session}
      onSessionChange={setAnswered}
      title="AI Interview"
      subtitle={
        session.status === "completed"
          ? "This interview is complete — HR can see this report."
          : "Answer each question; the interviewer scores as you go."
      }
    />
  );
}
