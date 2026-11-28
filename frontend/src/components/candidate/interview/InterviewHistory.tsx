"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  Clock3,
  Info,
  Plus,
  Target,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInterviewReport, listMySessions } from "@/lib/interviewApi";
import { resolveSelection, useApiResource } from "@/lib/useApiResource";
import {
  INTERVIEW_HISTORY_TYPE_BADGE,
  INTERVIEW_HISTORY_TYPE_LABELS,
  INTERVIEW_RESULT_BADGE,
  INTERVIEW_RESULT_LABELS,
  INTERVIEW_STATUS_BADGE,
  INTERVIEW_STATUS_LABELS,
  formatDate,
  formatDateTime,
  roundTrackLabel,
  scoreColor,
} from "@/lib/format";
import {
  INTERVIEW_HISTORY_TYPES,
  type InterviewReport,
  type InterviewHistoryType,
  type InterviewSessionSummary,
  type ObjectId,
} from "@/lib/types";
import { PortalPage } from "@/components/dashboard/primitives";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatCard,
} from "@/components/ui/Feedback";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { compactInputClass } from "@/components/ui/controls";
import { CertificatePanel } from "./CertificatePanel";
import { FinalScoreRing } from "./ScoreBreakdown";
import { FailedInterviewNextSteps } from "./FailedInterviewNextSteps";
import { PracticeReport, practiceSummary, TurnHistory } from "./InterviewRunner";

const ALL = "all";

/**
 * The candidate's interview history, from GET /api/interview/mine.
 *
 * Only PRACTICE sessions show the detailed report (questions, answers,
 * feedback, scores). AI interviews and organisational interviews are graded by
 * the hiring team, so they show a summary only: status and dates.
 */
export function InterviewHistory() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<
    InterviewHistoryType | typeof ALL
  >(ALL);
  // Stripe returns certificate buyers with their interview id in the URL so
  // the same result (and its certificate panel) is restored after checkout.
  const returnedSessionId = searchParams.get("sessionId") as ObjectId | null;
  const checkoutStatus = searchParams.get("checkout");
  const [requestedId, setRequestedId] = useState<ObjectId | null>(
    () => returnedSessionId,
  );

  const sessions = useApiResource(
    (signal) =>
      listMySessions(
        typeFilter === ALL ? undefined : typeFilter,
        token,
        signal,
      ),
    [token, typeFilter],
    { enabled: Boolean(token) },
  );

  const list = sessions.data ?? [];
  const selected = resolveSelection(list, requestedId, (s) => s.sessionId);
  const selectedId = selected?.sessionId ?? null;
  const isPractice = selected?.type === "practice";

  // The list rows are summaries; the full report is fetched for the selected one.
  // The loader guards on `selectedId` itself rather than trusting `enabled` — if
  // the list empties (e.g. the type filter changes) between a render and the
  // effect firing, there is simply nothing to fetch.
  // Only practice sessions load the full report — job interviews never show
  // their questions, answers or scores to the candidate.
  const report = useApiResource(
    (signal) =>
      selectedId && isPractice
        ? getInterviewReport(selectedId, token, signal)
        : Promise.resolve(null),
    [selectedId, isPractice, token],
    { enabled: Boolean(token && selectedId && isPractice) },
  );

  if (sessions.isLoading) {
    return (
      <PortalPage>
        <PageSkeleton label="Loading interview results…" />
      </PortalPage>
    );
  }

  const practiceCount = list.filter(
    (session) => session.type === "practice",
  ).length;
  const completedCount = list.filter(
    (session) => session.status === "completed",
  ).length;
  const inProgressCount = list.length - completedCount;
  const selectedTitle = selected
    ? (selected.jobTitle ?? `${roundTrackLabel(selected)} practice interview`)
    : null;

  return (
    <PortalPage>
      <PageHeader
        title="Interview results"
        description="Review your scores, feedback and interview progress."
        icon={<ChartNoAxesColumnIncreasing />}
        action={
          <Button
            href="/candidate/interview/basic"
            leadingIcon={<Plus aria-hidden="true" />}
          >
            Start interview
          </Button>
        }
      />

      {sessions.error && (
        <ErrorBlock message={sessions.error} onRetry={sessions.reload} />
      )}

      <section
        aria-label="Interview overview"
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      >
        <StatCard
          label="Total interviews"
          value={list.length}
          sub="In the selected category"
          icon={<ChartNoAxesColumnIncreasing aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          sub="Reports available"
          icon={<CheckCircle2 aria-hidden="true" />}
          tone="success"
        />
        <StatCard
          label="In progress"
          value={inProgressCount}
          sub="Interviews to finish"
          icon={<Clock3 aria-hidden="true" />}
          tone="warning"
        />
        <StatCard
          label="Practice sessions"
          value={practiceCount}
          sub="With detailed feedback"
          icon={<Target aria-hidden="true" />}
          tone="info"
        />
      </section>

      {list.length === 0 ? (
        <EmptyState
          title="No interviews yet."
          description="Take a practice interview, or wait for HR to schedule one on an application."
          icon={<ChartNoAxesColumnIncreasing />}
          action={
            <Button
              href="/candidate/interview/basic"
              leadingIcon={<Plus aria-hidden="true" />}
            >
              Start a practice interview
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)]">
          <Card
            title="Interview history"
            description={`${list.length} session${list.length === 1 ? "" : "s"}`}
            padding="none"
            className="lg:sticky lg:top-6"
            action={
              <label className="block">
                <span className="sr-only">Filter interview type</span>
                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value as InterviewHistoryType | typeof ALL,
                    )
                  }
                  className={`${compactInputClass} max-w-[11rem]`}
                >
                  <option value={ALL}>All interviews</option>
                  {INTERVIEW_HISTORY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {INTERVIEW_HISTORY_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>
            }
          >
            <div className="max-h-[26rem] space-y-1 overflow-y-auto border-t border-line-soft p-2 lg:max-h-[calc(100dvh-12rem)]">
              {list.map((session) => (
                <SessionRow
                  key={session.sessionId}
                  session={session}
                  isActive={session.sessionId === selected?.sessionId}
                  onSelect={() => setRequestedId(session.sessionId)}
                />
              ))}
            </div>
          </Card>

          <div className="min-w-0 space-y-6">
            {selected && !isPractice ? (
              <JobInterviewSummary session={selected} title={selectedTitle} />
            ) : report.isLoading ? (
              <Card>
                <LoadingBlock label="Loading report…" />
              </Card>
            ) : report.error ? (
              <ErrorBlock message={report.error} onRetry={report.reload} />
            ) : report.data && selected ? (
              report.data.status !== "in_progress" ? (
                <>
                  <Card
                    title="Interview report"
                    description={
                      <>
                        {selectedTitle}
                        <span aria-hidden="true" className="mx-1.5">
                          ·
                        </span>
                        {formatDate(selected.createdAt)}
                      </>
                    }
                    action={
                      <span className={INTERVIEW_HISTORY_TYPE_BADGE[selected.type]}>
                        {INTERVIEW_HISTORY_TYPE_LABELS[selected.type]}
                      </span>
                    }
                  >
                    <div className="flex flex-col items-center gap-6 border-t border-line-soft pt-5 sm:flex-row sm:items-center">
                      {report.data.score !== undefined ? (
                        <div className="shrink-0">
                          <FinalScoreRing score={report.data.score} />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1 text-center sm:text-left">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted">
                          {report.data.turns.length} question
                          {report.data.turns.length === 1 ? "" : "s"} answered
                        </p>
                        <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-ink">
                          {selectedTitle}
                        </h3>
                        {report.data.result && (
                          <span
                            className={`${INTERVIEW_RESULT_BADGE[report.data.result]} mt-2`}
                          >
                            {INTERVIEW_RESULT_LABELS[report.data.result]}
                          </span>
                        )}
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-body">
                          {practiceSummary(report.data)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {report.data.report?.reportType === "candidate" && (
                    <RoundProgress
                      report={report.data.report}
                      stage={report.data.stage}
                      round={report.data.round}
                      score={report.data.score}
                      result={report.data.result}
                      round2Unlocked={report.data.round2Unlocked}
                    />
                  )}

                  {report.data.result === "fail" && (
                    <FailedInterviewNextSteps
                      tips={report.data.elearningTips ?? []}
                      report={report.data.report}
                    />
                  )}

                  <PracticeReport session={report.data} />

                  {report.data.certificateEligible && (
                    <CertificatePanel
                      sessionId={selected.sessionId}
                      score={report.data.score}
                      result={report.data.result}
                      certificatePaid={report.data.certificatePaid}
                      checkoutStatus={
                        selected.sessionId === returnedSessionId
                          ? checkoutStatus
                          : null
                      }
                    />
                  )}
                </>
              ) : (
                <>
                  <Card
                    title="Interview in progress"
                    description={
                      <>
                        {selectedTitle}
                        <span aria-hidden="true" className="mx-1.5">
                          ·
                        </span>
                        {formatDate(selected.createdAt)}
                      </>
                    }
                    action={
                      <span className={INTERVIEW_HISTORY_TYPE_BADGE[selected.type]}>
                        {INTERVIEW_HISTORY_TYPE_LABELS[selected.type]}
                      </span>
                    }
                  >
                    <div className="flex flex-col gap-4 border-t border-line-soft pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-body">
                        You&apos;ve answered {report.data.turns.length} question
                        {report.data.turns.length === 1 ? "" : "s"}. Finish the
                        interview to see the outcome.
                      </p>
                      {selected.type === "practice" && (
                        <Button
                          href={`/candidate/interview/session/${selected.sessionId}`}
                          trailingIcon={<ArrowRight aria-hidden="true" />}
                          className="w-full sm:w-auto"
                        >
                          Continue interview
                        </Button>
                      )}
                    </div>
                  </Card>
                  <TurnHistory
                    turns={report.data.turns}
                    title="Questions answered so far"
                  />
                </>
              )
            ) : null}
          </div>
        </div>
      )}
    </PortalPage>
  );
}

function RoundProgress({
  report,
  stage,
  round,
  score,
  result,
  round2Unlocked,
}: {
  report: InterviewReport;
  stage?: "basic" | "technical" | "combined";
  round?: 1 | 2;
  score?: number;
  result?: "pass" | "fail";
  round2Unlocked?: boolean;
}) {
  const basicScore =
    report.basicScore ?? (stage === "basic" && score !== undefined ? score / 10 : undefined);
  const technicalScore =
    report.technicalScore ??
    (stage === "technical" && score !== undefined ? score / 10 : undefined);
  const roundOnePassed =
    round2Unlocked === true ||
    stage === "technical" ||
    round === 2 ||
    (stage === "basic" && result === "pass");
  const roundOneNeedsWork =
    report.decision === "retry_round1" ||
    report.decision === "needs_improvement" ||
    (stage === "basic" && result === "fail");
  const roundOneStatus = roundOnePassed
    ? "Passed"
    : roundOneNeedsWork
      ? "Needs improvement"
      : basicScore !== undefined
        ? "Score recorded"
        : "Not available";
  const roundTwoStatus =
    technicalScore !== undefined
      ? stage === "technical" && result
        ? result === "pass"
          ? "Passed"
          : "Needs improvement"
        : "Completed"
      : round2Unlocked
        ? "Unlocked"
        : stage === "combined"
          ? "Not scored"
          : stage === "technical" || round === 2
            ? "Completed"
            : "Locked";

  return (
    <Card
      title="Round progress"
      description="Scores and status for each interview round"
      action={<span className="text-sm text-muted">Pass mark: 70%</span>}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <RoundProgressCard
          title="Round 1"
          subtitle="Basic"
          score={basicScore}
          status={roundOneStatus}
          tone="violet"
        />
        <RoundProgressCard
          title="Round 2"
          subtitle="Technical"
          score={technicalScore}
          status={roundTwoStatus}
          tone="blue"
        />
      </div>
    </Card>
  );
}

function RoundProgressCard({
  title,
  subtitle,
  score,
  status,
  tone,
}: {
  title: string;
  subtitle: string;
  score?: number;
  status: string;
  tone: "violet" | "blue";
}) {
  const percentage =
    score === undefined ? undefined : Math.max(0, Math.min(100, score * 10));
  const badgeTone: BadgeTone =
    status === "Passed" || status === "Completed"
      ? "success"
      : status === "Needs improvement"
        ? "warning"
        : status === "Unlocked"
          ? "brand"
          : "neutral";

  return (
    <article className="min-w-0 rounded-lg border border-line-soft bg-surface-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
        <Badge tone={badgeTone}>{status}</Badge>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
          {percentage !== undefined && (
            <div
              className={`h-full rounded-full transition-[width] motion-reduce:transition-none ${
                tone === "violet" ? "bg-chart-1" : "bg-chart-5"
              }`}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
        <span className="min-w-12 text-right font-display text-sm font-semibold tabular-nums text-ink">
          {score === undefined ? "—" : `${score.toFixed(1)}/10`}
        </span>
      </div>
    </article>
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
      aria-pressed={isActive}
      className={`block w-full rounded-lg border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
        isActive
          ? "border-brand-200 bg-brand-50"
          : "border-transparent hover:bg-surface-2"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-semibold text-ink">
          {session.jobTitle ?? "Practice interview"}
        </p>
        {session.type === "practice" && session.score !== undefined && (
          <span
            className={`shrink-0 font-display text-sm font-semibold tabular-nums ${scoreColor(session.score)}`}
          >
            {session.score}%
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={INTERVIEW_HISTORY_TYPE_BADGE[session.type]}>
          {INTERVIEW_HISTORY_TYPE_LABELS[session.type]}
        </span>
        <span className={INTERVIEW_STATUS_BADGE[session.status]}>
          {INTERVIEW_STATUS_LABELS[session.status]}
        </span>
        {session.type === "practice" && session.result && (
          <span className={INTERVIEW_RESULT_BADGE[session.result]}>
            {INTERVIEW_RESULT_LABELS[session.result]}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted">
        <span className="min-w-0 truncate">{roundTrackLabel(session)}</span>
        <span className="shrink-0 tabular-nums">
          {formatDate(session.createdAt)}
        </span>
      </div>
    </button>
  );
}

/**
 * AI and organisational interviews: summary only — status and dates. The
 * questions, answers and scores stay with the hiring team.
 */
function JobInterviewSummary({
  session,
  title,
}: {
  session: InterviewSessionSummary;
  title: string | null;
}) {
  const completed = session.status === "completed";
  return (
    <Card
      title={
        session.type === "organizational"
          ? "Organisational interview"
          : "AI interview"
      }
      description={title ?? undefined}
      action={
        <span className={INTERVIEW_HISTORY_TYPE_BADGE[session.type]}>
          {INTERVIEW_HISTORY_TYPE_LABELS[session.type]}
        </span>
      }
    >
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-line-soft pt-5 sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-xs font-medium text-muted">Status</dt>
          <dd className="mt-1">
            <span className={INTERVIEW_STATUS_BADGE[session.status]}>
              {INTERVIEW_STATUS_LABELS[session.status]}
            </span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-medium text-muted">Started</dt>
          <dd className="mt-1 text-sm tabular-nums text-ink">
            {formatDateTime(session.createdAt)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-medium text-muted">
            {completed ? "Completed" : "Last activity"}
          </dt>
          <dd className="mt-1 text-sm tabular-nums text-ink">
            {formatDateTime(session.updatedAt)}
          </dd>
        </div>
      </dl>
      <p className="mt-5 flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-inset ring-brand-600/10">
        <Info
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-brand-700"
        />
        <span className="min-w-0">
          {completed
            ? "This interview is reviewed by the hiring team. Questions, answers and scores aren't shown here — you'll hear back on your application."
            : "Use the interview link sent to your email to take or continue this interview."}
        </span>
      </p>
    </Card>
  );
}
