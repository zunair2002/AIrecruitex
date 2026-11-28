"use client";

import { useState, type ReactNode } from "react";
import {
  MessageSquareText,
  Building2,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Clock,
  TrendingUp,
  MessagesSquare,
  ClipboardCheck,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { updateApplicationStatus } from "@/lib/applicationsApi";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  INTERVIEW_DECISION_BADGE,
  INTERVIEW_DECISION_LABELS,
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
  type InterviewReport,
  type InterviewSession,
} from "@/lib/types";
import { Card, InlineError, SkillChips } from "@/components/ui/Feedback";
import { Avatar } from "@/components/ui/Avatar";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { VerdictBadge } from "@/components/shared/VerdictBadge";
import { ScoreBar } from "@/components/candidate/interview/ScoreBreakdown";

/** Stroke colour for a 0–100 score ring, matching `scoreColor`. */
function ringStroke(score: number): string {
  if (score >= 80) return "stroke-brand-500";
  if (score >= 50) return "stroke-brand-300";
  return "stroke-brand-200";
}

/** Circular 0–100 score with a label underneath. */
function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-20 w-20 sm:h-24 sm:w-24">
        <svg
          viewBox="0 0 80 80"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={`${label}: ${score}%`}
        >
          <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="7" className="stroke-surface-3" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (clamped / 100) * circumference}
            className={`${ringStroke(score)} transition-[stroke-dashoffset] duration-700`}
          />
        </svg>
        <span
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center font-display text-lg font-semibold tabular-nums sm:text-xl ${scoreColor(score)}`}
        >
          {score}%
        </span>
      </div>
      <span className="text-xs font-medium text-muted">{label}</span>
    </div>
  );
}

/** Small uppercase section label inside a card. */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
      {children}
    </p>
  );
}

const DECISION_ACTIONS: {
  status: ApplicationStatus;
  variant: ButtonVariant;
  icon: ReactNode;
}[] = [
  { status: "selected", variant: "primary", icon: <Check aria-hidden="true" /> },
  { status: "rejected", variant: "danger-soft", icon: <X aria-hidden="true" /> },
];

/** Button text per decision ("Select" / "Reject"). */
const DECISION_LABELS: Partial<Record<ApplicationStatus, string>> = {
  selected: "Select",
  rejected: "Reject",
};

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
  onStatusChanged: (id: string, status: ApplicationStatus) => void;
}) {
  const { token } = useAuth();
  const { application, interviewSession, orgInterviewSession } = report;
  const candidate = populated(application.candidateId);

  const status = application.status;
  const decided = status === "selected" || status === "rejected";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<ApplicationStatus | null>(null);
  // Final decision only once an interview (AI or org) has been completed.
  const interviewCompleted =
    interviewSession?.status === "completed" ||
    orgInterviewSession?.status === "completed";

  const changeStatus = async (next: ApplicationStatus) => {
    if (busy || decided) return;
    setBusy(next);
    setError(null);
    try {
      const updated = await updateApplicationStatus(application._id, next, token);
      onStatusChanged(application._id, updated.status);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar name={candidate?.name ?? "?"} size="lg" />
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl font-semibold tracking-tight text-ink">
                  {candidate?.name ?? "Unknown candidate"}
                </h2>
                <p className="mt-0.5 break-words text-sm text-muted">
                  {candidate?.email ?? "—"} · {jobTitle}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs tabular-nums text-muted">
                  <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                  AI interview {formatDateTime(application.aiInterview.dateTime)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
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
                    <span className="text-xs text-muted">
                      Level: {INTERVIEW_LEVEL_LABELS[interviewSession.level]}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-start justify-center gap-6 rounded-xl bg-surface-2 px-5 py-4 ring-1 ring-inset ring-line-soft md:justify-end">
              <ScoreRing score={application.matchScore} label="Resume match" />
              {interviewSession?.status === "completed" && (
                <ScoreRing
                  score={interviewSession.score ?? 0}
                  label="Interview score"
                />
              )}
            </div>
          </div>

          <div className="mt-5">
            <Eyebrow>
              Matched skills ({application.resumeSnapshotSkills.length})
            </Eyebrow>
            <SkillChips
              skills={application.resumeSnapshotSkills}
              emptyLabel="No required skills were found in this resume."
            />
          </div>
        </div>

        <div className="border-t border-line-soft bg-surface-2/60 px-5 py-4 sm:px-6">
          {error && (
            <div className="mb-3">
              <InlineError message={error} />
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Hiring decision</p>
              <p className="text-xs text-muted">
                {interviewCompleted
                  ? "The candidate is notified when the status changes."
                  : "Select or reject once the interview is complete."}
              </p>
            </div>
            {decided && <span role="status" className={APPLICATION_STATUS_BADGE[status]}>{APPLICATION_STATUS_LABELS[status]}</span>}
            {interviewCompleted && !decided && (
            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
              {DECISION_ACTIONS.map(({ status: option, variant, icon }) => (
                <Button
                  key={option}
                  variant={variant}
                  size="sm"
                  leadingIcon={icon}
                  loading={busy === option}
                  onClick={() => changeStatus(option)}
                  disabled={busy !== null}
                  className="max-sm:h-10"
                >
                  {busy === option
                    ? "Saving…"
                    : DECISION_LABELS[option]}
                </Button>
              ))}
            </div>
            )}
          </div>
        </div>
      </section>

      {/* AI interview */}
      {!interviewSession ? (
        <Card title="AI interview">
          <p className="text-sm text-muted">
            No interview session exists for this application yet.
          </p>
        </Card>
      ) : interviewSession.status === "in_progress" ? (
        <Card
          title="AI interview in progress"
          action={
            <span className={INTERVIEW_STATUS_BADGE.in_progress}>
              {INTERVIEW_STATUS_LABELS.in_progress}
            </span>
          }
        >
          <p className="text-sm text-body">
            The candidate has answered {interviewSession.turns.length} question
            {interviewSession.turns.length === 1 ? "" : "s"}. The overall score
            and verdict appear once the interview completes.
          </p>
          {interviewSession.currentQuestion && (
            <div className="mt-4 rounded-lg bg-surface-2 p-4 ring-1 ring-inset ring-line-soft">
              <Eyebrow>
                Current question {interviewSession.currentQuestionNumber}
              </Eyebrow>
              <p className="text-sm text-ink">
                {interviewSession.currentQuestion}
              </p>
            </div>
          )}
        </Card>
      ) : interviewSession.report ? (
        <Card
          title={<SectionTitle icon={<MessageSquareText />}>AI interview report</SectionTitle>}
        >
          <ReportSummary report={interviewSession.report} />
        </Card>
      ) : (
        <Card title={<SectionTitle icon={<MessageSquareText />}>AI feedback</SectionTitle>}>
          <p className="whitespace-pre-line text-sm leading-relaxed text-body">
            {interviewSession.feedback ?? "No overall feedback was returned."}
          </p>
        </Card>
      )}

      {interviewSession && interviewSession.turns.length > 0 && (
        <Card
          title={
            <SectionTitle icon={<MessagesSquare />}>
              Answers ({interviewSession.turns.length})
            </SectionTitle>
          }
          description="Each answer as the AI interviewer scored it."
        >
          <ol className="space-y-3">
            {interviewSession.turns.map((turn) => (
              <TurnItem key={turn.questionNumber} turn={turn} feedbackLabel="Feedback" />
            ))}
          </ol>
        </Card>
      )}

      {orgInterviewSession && (
        <OrgInterviewResult session={orgInterviewSession} />
      )}

      {interviewSession && interviewSession.messages.length > 0 && (
        <Transcript messages={interviewSession.messages} />
      )}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 [&>svg]:h-4 [&>svg]:w-4"
      >
        {icon}
      </span>
      {children}
    </span>
  );
}

type Turn = InterviewSession["turns"][number];

/** One graded question: number, question, verdict + marks, answer, feedback. */
function TurnItem({
  turn,
  feedbackLabel,
  displayNumber = turn.questionNumber,
}: {
  turn: Turn;
  feedbackLabel: string;
  /** The number shown in the tile; defaults to `turn.questionNumber`. */
  displayNumber?: number;
}) {
  return (
    <li className="rounded-lg border border-line-soft bg-surface-2/60 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold tabular-nums text-brand-700"
          >
            {displayNumber}
          </span>
          <p className="min-w-0 pt-0.5 text-sm font-semibold text-ink">
            <span className="sr-only">Q{displayNumber}. </span>
            {turn.question}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 pl-10 sm:pl-0">
          <VerdictBadge verdict={turn.verdict} />
          <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold tabular-nums text-ink ring-1 ring-inset ring-line">
            {turn.marksPossible !== undefined
              ? `${turn.marksEarned ?? 0}/${turn.marksPossible} marks`
              : `${turn.score}/10`}
          </span>
        </div>
      </div>
      <div className="mt-3 space-y-3 sm:pl-10">
        <div>
          <p className="text-xs font-medium text-muted">Answer</p>
          <p className="mt-0.5 whitespace-pre-line text-sm text-body">
            {turn.answer}
          </p>
        </div>
        {turn.feedback && (
          <div className="border-l-2 border-brand-300 pl-3">
            <p className="text-xs font-medium text-brand-700">{feedbackLabel}</p>
            <p className="mt-0.5 whitespace-pre-line text-sm text-ink">
              {turn.feedback}
            </p>
          </div>
        )}
      </div>
    </li>
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
    <Card
      title="Full model transcript"
      description="The raw conversation, for auditing how the model questioned the candidate."
      action={
        <Button
          variant="secondary"
          size="sm"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
          trailingIcon={
            <ChevronDown
              aria-hidden="true"
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          }
        >
          {isOpen ? "Hide" : "Show"} raw conversation ({messages.length} messages)
        </Button>
      }
    >
      {isOpen ? (
        <div className="max-h-96 space-y-3 overflow-auto pr-1">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[90%] rounded-xl p-3 text-sm ${
                message.role === "assistant"
                  ? "bg-surface-2 text-ink ring-1 ring-inset ring-line-soft"
                  : "ml-auto bg-brand-50 text-body"
              }`}
            >
              <p className="mb-1 text-xs font-medium text-muted">
                {message.role === "assistant" ? "Interviewer" : "Candidate"}
              </p>
              <p className="whitespace-pre-line">{message.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Hidden by default to keep the report focused.</p>
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
  // Unscored warm-ups; `[]` / absent on sessions from before warm-ups existed.
  const introduction = session.introduction ?? [];

  return (
    <Card
      title={
        <SectionTitle icon={<Building2 />}>Organisational interview</SectionTitle>
      }
      description="Graded against your question pool. Only HR sees this."
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg bg-surface-2 px-4 py-3 ring-1 ring-inset ring-line-soft">
        {session.score !== undefined && (
          <span
            className={`font-display text-2xl font-semibold tabular-nums ${scoreColor(session.score)}`}
          >
            {session.score}%
          </span>
        )}
        {possible > 0 && (
          <span className="text-sm tabular-nums text-muted">
            {earned}/{possible} marks
          </span>
        )}
        <span className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <span className={INTERVIEW_STATUS_BADGE[session.status]}>
            {INTERVIEW_STATUS_LABELS[session.status]}
          </span>
          {session.result && (
            <span className={INTERVIEW_RESULT_BADGE[session.result]}>
              {INTERVIEW_RESULT_LABELS[session.result]}
            </span>
          )}
        </span>
      </div>

      {session.report ? (
        <div className="mt-5">
          <ReportSummary report={session.report} />
        </div>
      ) : (
        session.feedback && (
          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-body">
            {session.feedback}
          </p>
        )
      )}

      {introduction.length > 0 && (
        <div className="mt-6">
          <Eyebrow>Introduction (not scored)</Eyebrow>
          <ol className="space-y-3">
            {introduction.map((item, index) => (
              <li
                key={item.questionNumber}
                className="rounded-lg border border-line-soft bg-surface-2/60 p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-semibold tabular-nums text-body"
                  >
                    {index + 1}
                  </span>
                  <p className="min-w-0 pt-0.5 text-sm font-semibold text-ink">
                    <span className="sr-only">Warm-up {index + 1}. </span>
                    {item.question}
                  </p>
                </div>
                <div className="mt-3 sm:pl-10">
                  <p className="text-xs font-medium text-muted">Answer</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-body">
                    {item.answer || "—"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {session.turns.length > 0 ? (
        <div className="mt-6">
          <Eyebrow>Answers ({session.turns.length})</Eyebrow>
          <ol className="space-y-3">
            {session.turns.map((turn) => (
              <TurnItem
                key={turn.questionNumber}
                turn={turn}
                feedbackLabel="Grading"
                displayNumber={turn.poolQuestionNumber ?? turn.questionNumber}
              />
            ))}
          </ol>
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted">
          The candidate hasn&apos;t answered any questions yet.
        </p>
      )}
    </Card>
  );
}

/**
 * The model-written report on a completed session. Hidden org interviews carry
 * an HR decision (shortlist / hold / reject); AI interviews carry the
 * candidate-facing one (pass / needs improvement).
 */
function ReportSummary({ report }: { report: InterviewReport }) {
  const lists: {
    title: string;
    items?: string[];
    icon: ReactNode;
  }[] = [
    {
      title: "Strengths",
      items: report.strengths,
      icon: <CircleCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />,
    },
    {
      title: "Areas to improve",
      items: report.areasToImprove,
      icon: <TrendingUp aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />,
    },
    {
      title: "Concerns",
      items: report.concerns,
      icon: <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />,
    },
  ];
  const shown = lists.filter(({ items }) => items && items.length > 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted">Decision</span>
        <span
          className={
            INTERVIEW_DECISION_BADGE[report.decision] ??
            INTERVIEW_STATUS_BADGE.completed
          }
        >
          {INTERVIEW_DECISION_LABELS[report.decision] ?? report.decision}
        </span>
        {report.generatedBy === "fallback" && (
          <span className="text-xs text-muted">(automatic summary)</span>
        )}
      </div>

      {report.summary && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-body">
          {report.summary}
        </p>
      )}

      {(report.basicScore !== undefined || report.technicalScore !== undefined) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {report.basicScore !== undefined && (
            <ScoreBar
              label="Basic"
              score={Math.round(report.basicScore * 10)}
              gradient="bg-brand"
            />
          )}
          {report.technicalScore !== undefined && (
            <ScoreBar
              label="Technical"
              score={Math.round(report.technicalScore * 10)}
              gradient="from-brand-500 to-brand-700"
            />
          )}
        </div>
      )}

      {shown.length > 0 && (
        <div className={`grid grid-cols-1 gap-5 ${shown.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {shown.map(({ title, items, icon }) => (
            <div key={title} className="min-w-0">
              <Eyebrow>{title}</Eyebrow>
              <ul className="space-y-2 text-sm text-body">
                {items!.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    {icon}
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {report.recommendation && (
        <div className="flex items-start gap-3 rounded-lg bg-brand-50 p-4 ring-1 ring-inset ring-brand-600/10">
          <ClipboardCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Recommendation</p>
            <p className="mt-0.5 whitespace-pre-line text-sm text-body">
              {report.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
