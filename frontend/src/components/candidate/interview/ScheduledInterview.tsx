"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getInterviewReport } from "@/lib/interviewApi";
import { rememberSession } from "@/lib/interviewSessionStore";
import { useApiResource } from "@/lib/useApiResource";
import type { InterviewSessionView, ObjectId } from "@/lib/types";
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

  // Records the id so the session also shows up in the interview history list.
  useEffect(() => {
    if (!resource.data) return;
    rememberSession({
      sessionId,
      label: "Interview",
      startedAt: new Date().toISOString(),
    });
  }, [resource.data, sessionId]);

  if (resource.isLoading && !session) {
    return <LoadingBlock label="Loading interview…" />;
  }
  if (resource.error && !session) {
    return (
      <div className="p-8">
        <ErrorBlock message={resource.error} onRetry={resource.reload} />
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link
            href="/candidate/applications"
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Back to my applications
          </Link>
        </p>
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
