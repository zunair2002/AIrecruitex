"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  Clock3,
  MessageSquareText,
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
  roundTrackLabel,
  scoreColor,
} from "@/lib/format";
import {
  INTERVIEW_HISTORY_TYPES,
  type InterviewReport,
  type InterviewHistoryType,
  type InterviewSessionSummary,
  type InterviewTurnView,
  type ObjectId,
} from "@/lib/types";
import {
  Card,
  EmptyState,
  ErrorBlock,
} from "@/components/ui/Feedback";
import { CertificatePanel } from "./CertificatePanel";
import { FinalScoreRing } from "./ScoreBreakdown";
import { VerdictBadge } from "@/components/shared/VerdictBadge";
import { FailedInterviewNextSteps } from "./FailedInterviewNextSteps";

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
  const [typeFilter, setTypeFilter] = useState<
    InterviewHistoryType | typeof ALL
  >(ALL);
  const [requestedId, setRequestedId] = useState<ObjectId | null>(null);

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

  // The list rows are summaries; the full report is fetched for the selected one.
  // The loader guards on `selectedId` itself rather than trusting `enabled` — if
  // the list empties (e.g. the type filter changes) between a render and the
  // effect firing, there is simply nothing to fetch.
  const report = useApiResource(
    (signal) =>
      selectedId
        ? getInterviewReport(selectedId, token, signal)
        : Promise.resolve(null),
    [selectedId, token],
    { enabled: Boolean(token && selectedId) },
  );

  if (sessions.isLoading) {
    return (
      <div className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
        <div className="mx-auto max-w-[1500px] animate-pulse space-y-3">
          <div className="h-9 bg-white" />
          <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-[76px] bg-white" />
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="h-80 bg-white" />
            <div className="h-80 bg-white lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  const scoredSessions = list.filter(
    (session): session is InterviewSessionSummary & { score: number } =>
      session.status === "completed" && typeof session.score === "number",
  );
  const averageScore =
    scoredSessions.length > 0
      ? `${Math.round(
          scoredSessions.reduce((total, session) => total + session.score, 0) /
            scoredSessions.length,
        )}%`
      : "—";
  const completedCount = list.filter(
    (session) => session.status === "completed",
  ).length;
  const inProgressCount = list.length - completedCount;

  return (
    <div className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div className="mx-auto max-w-[1500px] space-y-3">
        <header className="flex min-h-8 items-center justify-between gap-3 border-b border-[#e9eaf0] pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e9eaf0] bg-white text-[#767985]">
              <ChartNoAxesColumnIncreasing
                aria-hidden="true"
                className="h-3 w-3"
              />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-semibold text-[#30323b]">
                Interview Results
              </h1>
              <p className="hidden text-[10px] text-[#999ba4] sm:block">
                Review your scores, feedback, and interview progress.
              </p>
            </div>
          </div>
          <Link
            href="/candidate/interview/basic"
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded bg-[#6b5ce7] px-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#5849d1]"
          >
            <Plus aria-hidden="true" className="h-3 w-3" />
            Start interview
          </Link>
        </header>

        {sessions.error && (
          <div>
            <ErrorBlock message={sessions.error} onRetry={sessions.reload} />
          </div>
        )}

        <section
          aria-label="Interview overview"
          className="grid grid-cols-2 gap-2.5 xl:grid-cols-4"
        >
          <ResultMetric
            label="Total interviews"
            value={String(list.length)}
            detail="In the selected category"
            icon={
              <ChartNoAxesColumnIncreasing
                aria-hidden="true"
                className="h-4 w-4"
              />
            }
            iconClass="bg-[#f0efff] text-[#6b5ce7]"
          />
          <ResultMetric
            label="Completed"
            value={String(completedCount)}
            detail="Reports available"
            icon={<CheckCircle2 aria-hidden="true" className="h-4 w-4" />}
            iconClass="bg-[#edf7ee] text-[#50a66d]"
          />
          <ResultMetric
            label="In progress"
            value={String(inProgressCount)}
            detail="Interviews to finish"
            icon={<Clock3 aria-hidden="true" className="h-4 w-4" />}
            iconClass="bg-[#fff6e8] text-[#d99b2b]"
          />
          <ResultMetric
            label="Average score"
            value={averageScore}
            detail={`${scoredSessions.length} scored session${scoredSessions.length === 1 ? "" : "s"}`}
            icon={<Target aria-hidden="true" className="h-4 w-4" />}
            iconClass="bg-[#eaf7f5] text-[#46aa9e]"
          />
        </section>

        {list.length === 0 ? (
          <section className="border border-[#e9eaf0] bg-white p-4 sm:p-5">
            <EmptyState
              title="No interviews yet."
              description="Take a practice interview, or wait for HR to schedule one on an application."
              action={
                <Link
                  href="/candidate/interview/basic"
                  className="inline-flex h-8 items-center gap-1.5 rounded bg-[#6b5ce7] px-3 text-[11px] font-semibold text-white transition-colors hover:bg-[#5849d1]"
                >
                  <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                  Start a practice interview
                </Link>
              }
            />
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <section className="min-w-0 border border-[#e9eaf0] bg-white lg:col-span-1">
            <div className="flex min-h-11 items-center justify-between gap-2 border-b border-[#eeeeF2] px-3 py-2.5">
              <div className="min-w-0">
                <h2 className="text-[11px] font-semibold text-[#454752]">
                  Interview history
                </h2>
                <p className="mt-0.5 text-[9px] text-[#999ba4]">
                  {list.length} session{list.length === 1 ? "" : "s"}
                </p>
              </div>
              <label className="relative shrink-0">
                <span className="sr-only">Filter interview type</span>
                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value as InterviewHistoryType | typeof ALL,
                    )
                  }
                  className="h-7 max-w-[130px] appearance-none border border-[#e9eaf0] bg-white py-1 pl-2 pr-6 text-[9px] text-[#666974] outline-none transition-colors focus:border-[#6b5ce7]"
                >
                  <option value={ALL}>All interviews</option>
                  {INTERVIEW_HISTORY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {INTERVIEW_HISTORY_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-[#858793]"
                >
                  ▾
                </span>
              </label>
            </div>
            <div className="max-h-[680px] overflow-y-auto p-2">
              {list.map((session) => (
                <SessionRow
                  key={session.sessionId}
                  session={session}
                  isActive={session.sessionId === selected?.sessionId}
                  onSelect={() => setRequestedId(session.sessionId)}
                />
              ))}
            </div>
          </section>

          <section className="min-w-0 space-y-3 lg:col-span-2">
            <div className="flex min-h-11 items-center justify-between gap-3 border border-[#e9eaf0] bg-white px-3 py-2.5">
              <div className="min-w-0">
                <h2 className="text-[11px] font-semibold text-[#454752]">
                  Interview report
                </h2>
                {selected && (
                  <p className="mt-0.5 truncate text-[9px] text-[#999ba4]">
                    {selected.jobTitle ??
                      `${roundTrackLabel(selected)} practice interview`}
                    <span className="mx-1.5">·</span>
                    {formatDate(selected.createdAt)}
                  </p>
                )}
              </div>
              {selected && (
                <span
                  className={`shrink-0 ${INTERVIEW_HISTORY_TYPE_BADGE[selected.type]}`}
                >
                  {INTERVIEW_HISTORY_TYPE_LABELS[selected.type]}
                </span>
              )}
            </div>

            {report.isLoading ? (
              <div
                role="status"
                className="flex min-h-48 items-center justify-center border border-[#e9eaf0] bg-white text-[11px] text-[#858793]"
              >
                Loading report…
              </div>
            ) : report.error ? (
              <ErrorBlock message={report.error} onRetry={report.reload} />
            ) : report.data && selected ? (
              report.data.status === "completed" ? (
                <>
                  <section className="border border-[#e9eaf0] bg-white p-4 sm:p-5">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                      {report.data.score !== undefined ? (
                        <div className="shrink-0 scale-[0.82]">
                          <FinalScoreRing score={report.data.score} />
                        </div>
                      ) : null}
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-[#92949e]">
                          {report.data.turns.length} question
                          {report.data.turns.length === 1 ? "" : "s"} answered
                        </p>
                        <h3 className="mt-1 text-[15px] font-semibold text-[#30323b]">
                          {selected.jobTitle ??
                            `${roundTrackLabel(selected)} practice interview`}
                        </h3>
                        {report.data.result && (
                          <span
                            className={`${INTERVIEW_RESULT_BADGE[report.data.result]} mt-2`}
                          >
                            {INTERVIEW_RESULT_LABELS[report.data.result]}
                          </span>
                        )}
                        {selected.type === "organizational" && (
                          <p className="mt-3 border-l-2 border-[#d8d5f7] bg-[#f8f7ff] px-3 py-2 text-left text-[10px] leading-4 text-[#666974]">
                            This interview is graded by the hiring team. Your
                            score and answer feedback aren&apos;t shown here.
                          </p>
                        )}
                        <p className="mt-3 whitespace-pre-line text-[11px] leading-5 text-[#666974]">
                          {report.data.report?.summary ||
                            report.data.feedback ||
                            "No overall feedback was returned."}
                        </p>
                      </div>
                    </div>
                  </section>

                  {report.data.report?.reportType === "candidate" && (
                    <InterviewReportDetails
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

                  <InterviewQuestionHistory
                    turns={report.data.turns}
                    title="Questions & answers"
                  />

                  {report.data.certificateEligible && (
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
                  <p className="text-[11px] leading-5 text-[#666974]">
                    You&apos;ve answered {report.data.turns.length} question
                    {report.data.turns.length === 1 ? "" : "s"}. Finish the
                    interview to see the outcome.
                  </p>
                  {selected.type !== "organizational" && (
                    <Link
                      href={`/candidate/interview/session/${selected.sessionId}`}
                      className="mt-3 inline-flex h-8 items-center rounded bg-[#6b5ce7] px-3 text-[10px] font-semibold text-white transition-colors hover:bg-[#5849d1]"
                    >
                      Continue interview
                    </Link>
                  )}
                  <div className="mt-5">
                    <InterviewQuestionHistory
                      turns={report.data.turns}
                      title="Questions answered so far"
                    />
                  </div>
                </Card>
              )
            ) : null}
          </section>
        </div>
        )}
      </div>
    </div>
  );
}

function InterviewReportDetails({
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
  const sections = [
    { title: "Strengths", items: report.strengths, tone: "emerald" },
    {
      title: "Areas to improve",
      items: report.areasToImprove,
      tone: "amber",
    },
    { title: "Learning plan", items: report.learningPlan, tone: "violet" },
  ] as const;

  return (
    <>
      <section className="border border-[#e9eaf0] bg-white p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[11px] font-semibold text-[#30323b]">
              Round progress
            </h3>
            <p className="mt-0.5 text-[9px] text-[#92949e]">
              Scores and status for each interview round
            </p>
          </div>
          <span className="text-[9px] text-[#92949e]">Pass mark: 70%</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
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
      </section>

      {sections.map(({ title, items, tone }) =>
        items && items.length > 0 ? (
          <section
            key={title}
            className="border border-[#e9eaf0] bg-white px-3 py-3 sm:px-4"
          >
            <div className="mb-2.5 flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  tone === "emerald"
                    ? "bg-[#48a875]"
                    : tone === "amber"
                      ? "bg-[#d99b2b]"
                      : "bg-[#6b5ce7]"
                }`}
              />
              <h3 className="text-[11px] font-semibold text-[#30323b]">
                {title}
              </h3>
            </div>
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 border-t border-[#f1f1f4] pt-2 text-[10px] leading-4 text-[#666974] first:border-0 first:pt-0"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#a5a6af]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </>
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
  const statusTone =
    status === "Passed" || status === "Completed"
      ? "bg-[#edf7ee] text-[#39865a]"
      : status === "Needs improvement"
        ? "bg-[#fff3e8] text-[#b66b20]"
        : status === "Unlocked"
          ? "bg-[#f0efff] text-[#6658d9]"
          : "bg-[#f3f4f6] text-[#777a85]";
  const accent = tone === "violet" ? "#6b5ce7" : "#4b8acb";

  return (
    <article className="border border-[#ececf1] bg-[#fcfcfd] px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold text-[#30323b]">{title}</p>
          <p className="mt-0.5 text-[9px] text-[#92949e]">{subtitle}</p>
        </div>
        <span
          className={`inline-flex items-center px-1.5 py-1 text-[8px] font-semibold ${statusTone}`}
        >
          {status}
        </span>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ececf1]">
          {percentage !== undefined && (
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${percentage}%`, backgroundColor: accent }}
            />
          )}
        </div>
        <span className="min-w-[48px] text-right text-[10px] font-semibold text-[#454752]">
          {score === undefined ? "—" : `${score.toFixed(1)}/10`}
        </span>
      </div>
    </article>
  );
}

function InterviewQuestionHistory({
  turns,
  title,
}: {
  turns: InterviewTurnView[];
  title: string;
}) {
  if (turns.length === 0) return null;

  return (
    <section className="border border-[#e9eaf0] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#eeeeF2] px-3 py-2.5 sm:px-4">
        <h3 className="text-[11px] font-semibold text-[#30323b]">{title}</h3>
        <span className="text-[9px] text-[#92949e]">
          {turns.length} question{turns.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="px-3 sm:px-4">
        {turns.map((turn) => (
          <article
            key={turn.questionNumber}
            className="flex gap-2.5 border-b border-dashed border-[#e9eaf0] py-3 last:border-0"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-[#f0efff] text-[#6658d9]">
              <MessageSquareText aria-hidden="true" className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.06em] text-[#92949e]">
                    Round {turn.round} · Question {turn.questionNumber}
                  </p>
                  <h4 className="mt-1 text-[10px] font-semibold leading-4 text-[#383a44]">
                    {turn.question}
                  </h4>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <VerdictBadge verdict={turn.verdict} />
                  {turn.score !== undefined && (
                    <span className="bg-[#f4f3ff] px-1.5 py-1 text-[8px] font-semibold text-[#6658d9]">
                      {turn.score}/10
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 border-l-2 border-[#e4e2f5] bg-[#fafafe] px-2.5 py-2">
                <p className="text-[8px] font-semibold uppercase tracking-[0.05em] text-[#92949e]">
                  Your answer
                </p>
                <p className="mt-1 whitespace-pre-line text-[9px] leading-4 text-[#666974]">
                  {turn.answer || "No answer provided."}
                </p>
              </div>
              {turn.feedback && (
                <p className="mt-2 whitespace-pre-line text-[9px] leading-4 text-[#666974]">
                  <span className="font-semibold text-[#454752]">Feedback: </span>
                  {turn.feedback}
                </p>
              )}
              {turn.improvementTip && (
                <p className="mt-1.5 whitespace-pre-line text-[9px] leading-4 text-[#39865a]">
                  <span className="font-semibold">Tip: </span>
                  {turn.improvementTip}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResultMetric({
  label,
  value,
  detail,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <article className="flex min-h-[76px] items-center justify-between gap-3 border border-[#ececf1] bg-white px-3 py-3 sm:px-4">
      <div className="min-w-0">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.07em] text-[#898b96]">
          {label}
        </p>
        <p className="mt-1 text-[19px] font-bold leading-none tracking-[-0.04em] text-[#292b35]">
          {value}
        </p>
        <p className="mt-1 truncate text-[9px] text-[#9698a2]">{detail}</p>
      </div>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center ${iconClass}`}>
        {icon}
      </span>
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
      className={`mb-1.5 w-full border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6b5ce7] ${
        isActive
          ? "border-[#d8d5f7] bg-[#f7f6ff]"
          : "border-[#f0f0f3] bg-white hover:border-[#e3e0fa] hover:bg-[#fcfbff]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className="truncate text-[11px] font-semibold text-[#30323b]"
        >
          {session.jobTitle ?? "Practice interview"}
        </p>
        {session.score !== undefined && (
          <span className={`shrink-0 text-[11px] font-bold ${scoreColor(session.score)}`}>
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
        {session.result && (
          <span className={INTERVIEW_RESULT_BADGE[session.result]}>
            {INTERVIEW_RESULT_LABELS[session.result]}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-[#92949e]">
        <span className="truncate">
          {roundTrackLabel(session)}
        </span>
        <span className="shrink-0">
          {formatDate(session.createdAt)}
        </span>
      </div>
    </button>
  );
}
