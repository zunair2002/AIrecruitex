"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { updateApplicationStatus } from "@/lib/applicationsApi";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  INTERVIEW_LEVEL_LABELS,
  INTERVIEW_RESULT_BADGE,
  INTERVIEW_RESULT_LABELS,
  INTERVIEW_STATUS_BADGE,
  INTERVIEW_STATUS_LABELS,
  formatDateTime,
  scoreColor,
} from "@/lib/format";
import {
  populated,
  type ApplicationReport,
  type ApplicationStatus,
  type InterviewSession,
} from "@/lib/types";
import { Card, InlineError, SkillChips } from "@/components/ui/Feedback";
import { smallButtonClass } from "@/components/ui/controls";

/**
 * Renders GET /api/applications/:applicationId/report — the application plus
 * the linked InterviewSession document (null until HR schedules the interview).
 */
export function InterviewReportDetail({
  report,
  jobTitle,
  onStatusChanged,
}: {
  report: ApplicationReport;
  jobTitle: string;
  onStatusChanged?: () => void;
}) {
  const { token } = useAuth();
  const { application, interviewSession, orgInterviewSession } = report;
  const candidate = populated(application.candidateId);

  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<ApplicationStatus | null>(null);

  const changeStatus = async (next: ApplicationStatus) => {
    setBusy(next);
    setError(null);
    try {
      const updated = await updateApplicationStatus(application._id, next, token);
      setStatus(updated.status);
      onStatusChanged?.();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900">
              {candidate?.name ?? "Unknown candidate"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {candidate?.email ?? "—"} · {jobTitle}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              AI interview {formatDateTime(application.aiInterview.dateTime)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={`text-3xl font-bold ${scoreColor(application.matchScore)}`}>
                {application.matchScore}%
              </p>
              <p className="text-xs text-gray-500">Resume match</p>
            </div>
            {interviewSession?.status === "completed" && (
              <div className="text-center">
                <p
                  className={`text-3xl font-bold ${scoreColor(interviewSession.score ?? 0)}`}
                >
                  {interviewSession.score ?? 0}%
                </p>
                <p className="text-xs text-gray-500">Interview score</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={APPLICATION_STATUS_BADGE[status]}>
            {APPLICATION_STATUS_LABELS[status]}
          </span>
          {interviewSession && (
            <span className={INTERVIEW_STATUS_BADGE[interviewSession.status]}>
              {INTERVIEW_STATUS_LABELS[interviewSession.status]}
            </span>
          )}
          {interviewSession?.result && (
            <span className={INTERVIEW_RESULT_BADGE[interviewSession.result]}>
              {INTERVIEW_RESULT_LABELS[interviewSession.result]}
            </span>
          )}
          {interviewSession?.level && (
            <span className="text-xs text-gray-500">
              Level: {INTERVIEW_LEVEL_LABELS[interviewSession.level]}
            </span>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Matched skills ({application.resumeSnapshotSkills.length})
          </p>
          <SkillChips
            skills={application.resumeSnapshotSkills}
            emptyLabel="No required skills were found in this resume."
          />
        </div>

        {error && (
          <div className="mt-4">
            <InlineError message={error} />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {(["selected", "rejected", "pending"] as ApplicationStatus[]).map(
            (option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeStatus(option)}
                disabled={busy !== null || status === option}
                className={smallButtonClass}
              >
                {busy === option
                  ? "Saving…"
                  : `Mark ${APPLICATION_STATUS_LABELS[option].toLowerCase()}`}
              </button>
            ),
          )}
        </div>
      </Card>

      {!interviewSession ? (
        <Card title="AI interview">
          <p className="text-sm text-gray-600">
            No interview session exists for this application yet.
          </p>
        </Card>
      ) : interviewSession.status === "in_progress" ? (
        <Card title="AI interview in progress">
          <p className="text-sm text-gray-600">
            The candidate has answered {interviewSession.turns.length} question
            {interviewSession.turns.length === 1 ? "" : "s"}. The overall score
            and verdict appear once the interview completes.
          </p>
          {interviewSession.currentQuestion && (
            <p className="mt-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-semibold">
                Current question {interviewSession.currentQuestionNumber}:{" "}
              </span>
              {interviewSession.currentQuestion}
            </p>
          )}
        </Card>
      ) : (
        <Card title="AI feedback">
          <p className="whitespace-pre-line text-sm leading-relaxed text-indigo-900">
            {interviewSession.feedback ?? "No overall feedback was returned."}
          </p>
        </Card>
      )}

      {orgInterviewSession && (
        <OrgInterviewResult session={orgInterviewSession} />
      )}

      {interviewSession && interviewSession.messages.length > 0 && (
        <Transcript messages={interviewSession.messages} />
      )}

      {interviewSession && interviewSession.turns.length > 0 && (
        <Card title={`Answers (${interviewSession.turns.length})`}>
          <div className="space-y-4">
            {interviewSession.turns.map((turn) => (
              <div
                key={turn.questionNumber}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Q{turn.questionNumber}. {turn.question}
                  </p>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-indigo-600">
                    {turn.marksPossible !== undefined
                      ? `${turn.marksEarned ?? 0}/${turn.marksPossible} marks`
                      : `${turn.score}/10`}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-gray-700">
                  <span className="font-semibold text-gray-500">Answer: </span>
                  {turn.answer}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm text-indigo-900">
                  <span className="font-semibold text-indigo-600">Feedback: </span>
                  {turn.feedback}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * The raw model conversation (`InterviewSession.messages`).
 *
 * Only HR sees this: the candidate-facing `toSessionView` never includes
 * `messages`, it returns `turns` instead. Useful for auditing how the model
 * actually questioned someone, so it's collapsed rather than omitted.
 */
function Transcript({
  messages,
}: {
  messages: { role: "user" | "assistant"; content: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card title="Full model transcript">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
      >
        {isOpen ? "Hide" : "Show"} raw conversation ({messages.length} messages)
      </button>

      {isOpen && (
        <div className="mt-4 max-h-96 space-y-3 overflow-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`rounded-xl p-3 text-sm ${
                message.role === "assistant"
                  ? "bg-indigo-50 text-indigo-900"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                {message.role === "assistant" ? "Interviewer" : "Candidate"}
              </p>
              <p className="whitespace-pre-line">{message.content}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/**
 * The organisational interview — graded against HR's question pool, so each
 * turn carries raw marks as well as the normalised score. The candidate never
 * sees any of this; it exists only on HR's report.
 */
function OrgInterviewResult({ session }: { session: InterviewSession }) {
  const earned = session.turns.reduce((sum, t) => sum + (t.marksEarned ?? 0), 0);
  const possible = session.turns.reduce((sum, t) => sum + (t.marksPossible ?? 0), 0);

  return (
    <Card title="Organisational interview">
      <div className="flex flex-wrap items-center gap-3">
        <span className={INTERVIEW_STATUS_BADGE[session.status]}>
          {INTERVIEW_STATUS_LABELS[session.status]}
        </span>
        {session.result && (
          <span className={INTERVIEW_RESULT_BADGE[session.result]}>
            {INTERVIEW_RESULT_LABELS[session.result]}
          </span>
        )}
        {session.score !== undefined && (
          <span className={`text-lg font-bold ${scoreColor(session.score)}`}>
            {session.score}%
          </span>
        )}
        {possible > 0 && (
          <span className="text-sm text-gray-500">
            {earned}/{possible} marks
          </span>
        )}
      </div>

      {session.feedback && (
        <p className="mt-4 whitespace-pre-line rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          {session.feedback}
        </p>
      )}

      {session.turns.length > 0 ? (
        <div className="mt-4 space-y-4">
          {session.turns.map((turn) => (
            <div
              key={turn.questionNumber}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900">
                  Q{turn.questionNumber}. {turn.question}
                </p>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-indigo-600">
                  {turn.marksPossible !== undefined
                    ? `${turn.marksEarned ?? 0}/${turn.marksPossible} marks`
                    : `${turn.score}/10`}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-gray-700">
                <span className="font-semibold text-gray-500">Answer: </span>
                {turn.answer}
              </p>
              {turn.feedback && (
                <p className="mt-2 whitespace-pre-line text-sm text-indigo-900">
                  <span className="font-semibold text-indigo-600">Grading: </span>
                  {turn.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600">
          The candidate hasn&apos;t answered any questions yet.
        </p>
      )}
    </Card>
  );
}
