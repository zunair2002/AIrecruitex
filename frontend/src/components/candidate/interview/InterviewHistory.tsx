"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getInterviewReport, listMySessions } from "@/lib/interviewApi";
import { resolveSelection, useApiResource } from "@/lib/useApiResource";
import {
  INTERVIEW_HISTORY_TYPE_BADGE,
  INTERVIEW_HISTORY_TYPE_LABELS,
  INTERVIEW_LEVEL_LABELS,
  INTERVIEW_RESULT_BADGE,
  INTERVIEW_RESULT_LABELS,
  INTERVIEW_STATUS_BADGE,
  INTERVIEW_STATUS_LABELS,
  formatDate,
  scoreColor,
} from "@/lib/format";
import {
  INTERVIEW_HISTORY_TYPES,
  type InterviewHistoryType,
  type InterviewSessionSummary,
  type ObjectId,
} from "@/lib/types";
import {
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { compactInputClass, primaryButtonClass } from "@/components/ui/controls";
import { CertificatePanel } from "./CertificatePanel";
import { TurnHistory } from "./InterviewRunner";
import { FinalScoreRing } from "./ScoreBreakdown";

const ALL = "all";

/**
 * The candidate's interview history, from GET /api/interview/mine.
 *
 * Organisational interviews appear here but are "hidden": the backend strips
 * score, result and per-answer feedback from them, because those are HR's to
 * see. The UI says so rather than rendering empty fields.
 */
export function InterviewHistory() {
  const { token } = useAuth();
  const [typeFilter, setTypeFilter] = useState<InterviewHistoryType | typeof ALL>(ALL);
  const [requestedId, setRequestedId] = useState<ObjectId | null>(null);

  const sessions = useApiResource(
    (signal) =>
      listMySessions(typeFilter === ALL ? undefined : typeFilter, token, signal),
    [token, typeFilter],
    { enabled: Boolean(token) },
  );

  const list = sessions.data ?? [];
  const selected = resolveSelection(list, requestedId, (s) => s.sessionId);

  // The list rows are summaries; the full report is fetched for the selected one.
  const report = useApiResource(
    (signal) => getInterviewReport(selected!.sessionId, token, signal),
    [selected?.sessionId, token],
    { enabled: Boolean(token && selected) },
  );

  if (sessions.isLoading) {
    return <LoadingBlock label="Loading your interview reports…" />;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Interview Results"
        description="Every interview you've taken — practice, AI, and organisational."
      />

      {sessions.error && (
        <div className="mb-6">
          <ErrorBlock message={sessions.error} onRetry={sessions.reload} />
        </div>
      )}

      <select
        value={typeFilter}
        onChange={(event) =>
          setTypeFilter(event.target.value as InterviewHistoryType | typeof ALL)
        }
        className={`${compactInputClass} mb-6`}
      >
        <option value={ALL}>All interviews</option>
        {INTERVIEW_HISTORY_TYPES.map((type) => (
          <option key={type} value={type}>
            {INTERVIEW_HISTORY_TYPE_LABELS[type]}
          </option>
        ))}
      </select>

      {list.length === 0 ? (
        <EmptyState
          title="No interviews yet."
          description="Take a practice interview, or wait for HR to schedule one on an application."
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
            {list.map((session) => (
              <SessionRow
                key={session.sessionId}
                session={session}
                isActive={session.sessionId === selected?.sessionId}
                onSelect={() => setRequestedId(session.sessionId)}
              />
            ))}
          </div>

          <div className="space-y-6 lg:col-span-2">
            {report.isLoading ? (
              <LoadingBlock label="Loading report…" />
            ) : report.error ? (
              <ErrorBlock message={report.error} onRetry={report.reload} />
            ) : report.data && selected ? (
              report.data.status === "completed" ? (
                <>
                  <Card>
                    <div className="flex flex-col items-center gap-8 sm:flex-row">
                      {report.data.score !== undefined ? (
                        <FinalScoreRing score={report.data.score} />
                      ) : null}
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {selected.jobTitle ??
                            `${selected.level ? INTERVIEW_LEVEL_LABELS[selected.level] + " " : ""}practice interview`}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(selected.createdAt)} ·{" "}
                          {report.data.turns.length} questions answered
                        </p>
                        {report.data.result && (
                          <span
                            className={`${INTERVIEW_RESULT_BADGE[report.data.result]} mt-3`}
                          >
                            {INTERVIEW_RESULT_LABELS[report.data.result]}
                          </span>
                        )}
                        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                          {report.data.feedback ??
                            (selected.type === "organizational"
                              ? "This interview is graded by the hiring team — your score and feedback aren't shown here."
                              : "No overall feedback was returned.")}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {report.data.elearningTips &&
                    report.data.elearningTips.length > 0 && (
                      <Card title="Before you try again">
                        <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
                          {report.data.elearningTips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      </Card>
                    )}

                  <TurnHistory
                    turns={report.data.turns}
                    title={
                      selected.type === "organizational"
                        ? "Your answers"
                        : "Question-by-question feedback"
                    }
                  />

                  {selected.type !== "organizational" && (
                    <CertificatePanel
                      sessionId={selected.sessionId}
                      score={report.data.score}
                      result={report.data.result}
                      certificatePaid={report.data.certificatePaid}
                    />
                  )}
                </>
              ) : (
                <Card title="Interview in progress">
                  <p className="text-sm text-gray-600">
                    You&apos;ve answered {report.data.turns.length} question
                    {report.data.turns.length === 1 ? "" : "s"}. Finish the
                    interview to see the outcome.
                  </p>
                  {selected.type !== "organizational" && (
                    <Link
                      href={`/candidate/interview/session/${selected.sessionId}`}
                      className={`${primaryButtonClass} mt-4 inline-block text-sm`}
                    >
                      Continue interview
                    </Link>
                  )}
                  <div className="mt-6">
                    <TurnHistory
                      turns={report.data.turns}
                      title="Answered so far"
                    />
                  </div>
                </Card>
              )
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionRow({
  session,
  isActive,
  onSelect,
}: {
  session: InterviewSessionSummary;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
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
          {session.jobTitle ??
            `${session.level ? INTERVIEW_LEVEL_LABELS[session.level] + " " : ""}practice`}
        </p>
        {session.score !== undefined && (
          <span className={`text-sm font-bold ${scoreColor(session.score)}`}>
            {session.score}%
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className={INTERVIEW_HISTORY_TYPE_BADGE[session.type]}>
          {INTERVIEW_HISTORY_TYPE_LABELS[session.type]}
        </span>
        <span className={INTERVIEW_STATUS_BADGE[session.status]}>
          {INTERVIEW_STATUS_LABELS[session.status]}
        </span>
        <span className="text-xs text-gray-500">
          {formatDate(session.createdAt)}
        </span>
      </div>
    </button>
  );
}
