"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getInterviewReport } from "@/lib/interviewApi";
import { listMyApplications } from "@/lib/applicationsApi";
import {
  getStoredSessions,
  SESSIONS_UPDATED_EVENT,
  type StoredSession,
} from "@/lib/interviewSessionStore";
import { resolveSelection, useApiResource } from "@/lib/useApiResource";
import {
  INTERVIEW_RESULT_BADGE,
  INTERVIEW_RESULT_LABELS,
  INTERVIEW_STATUS_BADGE,
  INTERVIEW_STATUS_LABELS,
  formatDate,
  scoreColor,
} from "@/lib/format";
import { populated, type InterviewSessionView, type ObjectId } from "@/lib/types";
import {
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";
import { CertificatePanel } from "./CertificatePanel";
import { TurnHistory } from "./InterviewRunner";
import { FinalScoreRing } from "./ScoreBreakdown";

type Entry = {
  sessionId: ObjectId;
  label: string;
  startedAt: string;
  view: InterviewSessionView;
};

/**
 * The candidate's interview history.
 *
 * The backend has no "list my sessions" route, so ids come from two places:
 * the applications list (`interviewSessionId`, authoritative and server-side)
 * and this browser's practice-session index. Each id is then loaded through
 * GET /api/interview/report/:sessionId, which is the real report.
 */
export function InterviewHistory() {
  const { token, user } = useAuth();
  const [stored, setStored] = useState<StoredSession[]>([]);
  const [requestedId, setRequestedId] = useState<ObjectId | null>(null);

  useEffect(() => {
    const sync = () => setStored(user ? getStoredSessions(user.id) : []);
    sync();
    window.addEventListener(SESSIONS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSIONS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [user]);

  const history = useApiResource<Entry[]>(
    async (signal) => {
      const candidates = new Map<
        ObjectId,
        { label: string; startedAt: string }
      >();
      for (const entry of stored) {
        candidates.set(entry.sessionId, {
          label: entry.label,
          startedAt: entry.startedAt,
        });
      }

      // Application-linked sessions are authoritative — they survive a cleared
      // localStorage and carry the job title as their label.
      try {
        for (const application of await listMyApplications(token, signal)) {
          if (!application.interviewSessionId) continue;
          candidates.set(application.interviewSessionId, {
            label: populated(application.jobId)?.title ?? "Job interview",
            startedAt: application.aiInterview.dateTime ?? application.createdAt,
          });
        }
      } catch {
        // A failed applications fetch shouldn't hide practice history.
      }

      const loaded = await Promise.all(
        Array.from(candidates.entries()).map(async ([sessionId, meta]) => {
          try {
            return {
              sessionId,
              ...meta,
              view: await getInterviewReport(sessionId, token, signal),
            };
          } catch {
            // A session the backend no longer has, or that isn't this user's.
            return null;
          }
        }),
      );

      return loaded
        .filter((entry): entry is Entry => entry !== null)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    },
    [token, stored],
    { enabled: Boolean(token) },
  );

  const entries = history.data ?? [];
  const selected = resolveSelection(entries, requestedId, (e) => e.sessionId);

  if (history.isLoading) {
    return <LoadingBlock label="Loading your interview reports…" />;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Interview Results"
        description="Every interview you've taken, with the model's per-answer scores and overall verdict."
      />

      {history.error && (
        <div className="mb-6">
          <ErrorBlock message={history.error} onRetry={history.reload} />
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState
          title="No interviews yet."
          description="Take a practice interview, or wait for HR to schedule an AI interview on one of your applications."
          action={
            <Link
              href="/candidate/interview/basic"
              className={`${primaryButtonClass} text-sm`}
            >
              Start a practice interview
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Sessions
            </h2>
            {entries.map((entry) => {
              const isActive = entry.sessionId === selected?.sessionId;
              return (
                <button
                  key={entry.sessionId}
                  type="button"
                  onClick={() => setRequestedId(entry.sessionId)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    isActive
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-gray-100 bg-white hover:border-indigo-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-sm font-semibold ${isActive ? "text-indigo-900" : "text-gray-900"}`}
                    >
                      {entry.label}
                    </p>
                    {entry.view.status === "completed" && (
                      <span
                        className={`text-sm font-bold ${scoreColor(entry.view.score ?? 0)}`}
                      >
                        {entry.view.score ?? 0}%
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={INTERVIEW_STATUS_BADGE[entry.view.status]}>
                      {INTERVIEW_STATUS_LABELS[entry.view.status]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(entry.startedAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-6 lg:col-span-2">
            {selected?.view.status === "completed" ? (
              <>
                <Card>
                  <div className="flex flex-col items-center gap-8 sm:flex-row">
                    <FinalScoreRing score={selected.view.score ?? 0} />
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selected.label}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(selected.startedAt)} ·{" "}
                        {selected.view.turns.length} questions answered
                      </p>
                      {selected.view.result && (
                        <span
                          className={`${INTERVIEW_RESULT_BADGE[selected.view.result]} mt-3`}
                        >
                          {INTERVIEW_RESULT_LABELS[selected.view.result]}
                        </span>
                      )}
                      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                        {selected.view.feedback ??
                          "No overall feedback was returned."}
                      </p>
                    </div>
                  </div>
                </Card>

                <TurnHistory
                  turns={selected.view.turns}
                  title="Question-by-question feedback"
                />

                <CertificatePanel
                  sessionId={selected.sessionId}
                  score={selected.view.score}
                  result={selected.view.result}
                  certificatePaid={selected.view.certificatePaid}
                />
              </>
            ) : selected ? (
              <Card title="Interview in progress">
                <p className="text-sm text-gray-600">
                  You&apos;ve answered {selected.view.turns.length} question
                  {selected.view.turns.length === 1 ? "" : "s"}. Finish the
                  interview to see your overall score and feedback.
                </p>
                <Link
                  href={`/candidate/interview/session/${selected.sessionId}`}
                  className={`${primaryButtonClass} mt-4 inline-block text-sm`}
                >
                  Continue interview
                </Link>
                <div className="mt-6">
                  <TurnHistory
                    turns={selected.view.turns}
                    title="Answered so far"
                  />
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
