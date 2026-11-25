"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  MessageSquareText,
  RotateCcw,
  Send,
  TrendingUp,
  Unlock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiErrorStatus, toErrorMessage } from "@/lib/api";
import { getInterviewReport, submitAnswer } from "@/lib/interviewApi";
import {
  INTERVIEW_DECISION_LABELS,
  INTERVIEW_RESULT_BADGE,
  INTERVIEW_RESULT_LABELS,
  TRACK_LABELS,
} from "@/lib/format";
import {
  isFinishedSession,
  type InterviewReport,
  type InterviewSessionCompleted,
  type InterviewSessionView,
  type InterviewTurnView,
} from "@/lib/types";
import { VerdictBadge } from "@/components/shared/VerdictBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, InlineError } from "@/components/ui/Feedback";
import { CertificatePanel } from "./CertificatePanel";
import { FinalScoreRing, ScoreBar } from "./ScoreBreakdown";
import { VoiceAnswerField, useVoiceAnswer } from "./VoiceAnswer";
import { FailedInterviewNextSteps } from "./FailedInterviewNextSteps";
import { InterviewTimer, timerKey } from "./InterviewTimer";
import { InterviewerAvatar } from "./InterviewerAvatar";
import {
  InterviewStage,
  InterviewProgressHeader,
  QuestionCard,
  TimeUpNotice,
} from "./RunnerParts";

/** Round 1 (5) + Round 2 (8) — used when the backend doesn't send a total. */
const FALLBACK_TOTAL_QUESTIONS = 13;

/**
 * Drives one interview session: renders the model's current question, posts the
 * answer, then renders the report once the backend flips `status` to
 * "completed" (or to "expired", when the time limit ended it). Works for both practice sessions and HR-scheduled ones — the
 * backend endpoints are identical, only how the session was created differs.
 */
export function InterviewRunner({
  session,
  onSessionChange,
  title,
  subtitle,
  onRestart,
}: {
  session: InterviewSessionView;
  onSessionChange: (next: InterviewSessionView) => void;
  title: string;
  subtitle?: string;
  onRestart?: () => void;
}) {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set once the countdown hits zero; flips the UI into "finishing up" and
  // starts polling for the server's verdict.
  const [hasTimedOut, setHasTimedOut] = useState(false);
  // Resumed a session with under a minute left — offer a fresh start instead.
  const [lowTimeOnResume] = useState(
    () =>
      session.status === "in_progress" &&
      typeof session.remainingSeconds === "number" &&
      session.remainingSeconds < 60,
  );
  const answer = useVoiceAnswer(
    session.status === "in_progress" ? session.question : undefined,
  );

  /**
   * The clock reached zero in the browser.
   *
   * We do NOT finish the session here. The backend rejects an empty answer (400)
   * and runs its own sweep every 30 seconds that expires the session and scores
   * the unanswered questions, so the only correct move is to stop accepting
   * answers and poll the report endpoint until the server reports it finished.
   */
  const handleExpire = useCallback(() => {
    setHasTimedOut(true);
  }, []);

  useEffect(() => {
    if (!hasTimedOut) return;
    let cancelled = false;
    const controller = new AbortController();

    const poll = async () => {
      try {
        const next = await getInterviewReport(
          session.sessionId,
          token,
          controller.signal,
        );
        if (cancelled) return;
        if (isFinishedSession(next)) onSessionChange(next);
      } catch (err) {
        // A transient failure here just means we try again on the next tick.
        if (!cancelled && apiErrorStatus(err) === 401) setError(toErrorMessage(err));
      }
    };

    void poll();
    const id = window.setInterval(poll, 5000);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(id);
    };
  }, [hasTimedOut, session.sessionId, token, onSessionChange]);

  const handleSubmit = async () => {
    const text = answer.takeAnswer();
    if (!text) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const next = await submitAnswer(
        { sessionId: session.sessionId, answer: text },
        token,
      );
      answer.reset();
      onSessionChange(next);
    } catch (err) {
      // 410 = the deadline passed between rendering this question and sending
      // the answer. Not an error the candidate can act on — switch to the
      // time-up flow and let the server's report land.
      if (apiErrorStatus(err) === 410) {
        setHasTimedOut(true);
      } else {
        setError(toErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinishedSession(session)) {
    return (
      <CompletedInterview
        session={session}
        title={title}
        subtitle={subtitle}
        onRestart={onRestart}
      />
    );
  }

  const answered = session.turns.length;
  const questionNumber = session.questionNumber ?? answered + 1;
  const totalQuestions = session.totalQuestions ?? FALLBACK_TOTAL_QUESTIONS;
  const isLastQuestion = questionNumber >= totalQuestions;
  const progressLabel = [
    session.round ? `Round ${session.round}` : null,
    session.track ? (TRACK_LABELS[session.track] ?? session.track) : null,
    `Question ${questionNumber} of ${totalQuestions}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <InterviewStage
      aside={
        <InterviewerAvatar
          speaking={answer.voice.speaking}
          listening={answer.voice.listening}
          caption={
            hasTimedOut
              ? "The time limit has run out — finishing up."
              : "Answer in your own words. There's no penalty for thinking out loud."
          }
        />
      }
    >
      <InterviewProgressHeader
        title={title}
        description={subtitle}
        progressLabel={progressLabel}
        answered={answered}
        total={totalQuestions}
        timer={
          <InterviewTimer
            key={timerKey(session)}
            session={session}
            onExpire={handleExpire}
          />
        }
      />

      {lowTimeOnResume && !hasTimedOut && onRestart && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm font-medium text-warning-700">
            Your previous attempt had little time left
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={onRestart}
            leadingIcon={<RotateCcw aria-hidden="true" />}
          >
            Start a new interview
          </Button>
        </div>
      )}

      {hasTimedOut && (
        <TimeUpNotice
          title="Time's up — finishing your interview."
          detail="Any questions you didn't reach are scored zero. Your report appears here as soon as it's ready."
        />
      )}

      <QuestionCard
        eyebrow={
          <>
            Interviewer · Question {questionNumber}
            {answer.voice.speaking && " · speaking…"}
          </>
        }
        question={session.question ?? "Waiting for the next question…"}
      />

      <section
        aria-label="Your answer"
        className="rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6"
      >
        <VoiceAnswerField
          id="interview-answer"
          label="Your answer"
          answer={answer}
          disabled={isSubmitting || hasTimedOut}
        />

        {error && (
          <div className="mt-4">
            <InlineError message={error} />
          </div>
        )}

        <Button
          size="lg"
          fullWidth
          onClick={handleSubmit}
          disabled={!answer.value.trim() || isSubmitting || hasTimedOut}
          loading={isSubmitting}
          leadingIcon={<Send aria-hidden="true" />}
          className="mt-5 h-auto! min-h-11 whitespace-normal! py-2.5 text-center"
        >
          {hasTimedOut
            ? "Time expired"
            : isSubmitting
            ? isLastQuestion
              ? "Generating your report… (this can take up to a minute)"
              : "Submitting your answer…"
            : "Submit answer"}
        </Button>
        <p className="mt-3 text-center text-xs text-muted">
          {isLastQuestion
            ? "This is the last question — your full report is generated after you submit."
            : "Answers are evaluated in the background; your report arrives after the last question."}
        </p>
      </section>

      {session.turns.length > 0 && (
        <TurnHistory turns={session.turns} title="Answered so far" />
      )}
    </InterviewStage>
  );
}

function CompletedInterview({
  session,
  title,
  subtitle,
  onRestart,
}: {
  session: InterviewSessionCompleted;
  title: string;
  subtitle?: string;
  onRestart?: () => void;
}) {
  const isRound1 = session.stage === "basic";
  const tips = session.elearningTips ?? [];
  const decision = session.report?.decision;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <FinalScoreRing score={session.score ?? 0} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-700">
              Interview report
            </p>
            <h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {session.result && (
                <span className={INTERVIEW_RESULT_BADGE[session.result]}>
                  {INTERVIEW_RESULT_LABELS[session.result]}
                </span>
              )}
              <span className="text-sm font-medium tabular-nums text-body">
                Overall score: {session.score ?? 0}%
              </span>
              {decision && (
                <>
                  <span aria-hidden="true" className="text-subtle">
                    ·
                  </span>
                  <span className="text-sm font-medium text-body">
                    Decision: {INTERVIEW_DECISION_LABELS[decision]}
                  </span>
                </>
              )}
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-body">
              {session.report?.summary ||
                session.feedback ||
                "No overall feedback was returned."}
            </p>
          </div>
        </div>
      </section>

      {isRound1 && session.round2Unlocked && (
        <section className="flex flex-col gap-4 rounded-xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-inset ring-brand-600/20"
            >
              <Unlock className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-brand-900">
                Round 2 unlocked
              </h2>
              <p className="mt-1 text-sm text-brand-800">
                Nice work. The technical interview on your track is ready when you are.
              </p>
            </div>
          </div>
          <Button
            href="/candidate/interview/advanced"
            trailingIcon={<ArrowRight aria-hidden="true" />}
            className="w-full sm:w-auto"
          >
            Start Round 2 — Technical interview
          </Button>
        </section>
      )}

      {session.report && <ReportDetails report={session.report} />}

      {session.result === "fail" && (
        <FailedInterviewNextSteps tips={tips} report={session.report} />
      )}

      <TurnHistory turns={session.turns} title="Question-by-question feedback" />

      {session.certificateEligible && (
        <CertificatePanel
          sessionId={session.sessionId}
          score={session.score}
          result={session.result}
          certificatePaid={session.certificatePaid}
        />
      )}

      {isRound1 && !session.round2Unlocked ? (
        onRestart ? (
          <Button
            size="lg"
            fullWidth
            onClick={onRestart}
            leadingIcon={<RotateCcw aria-hidden="true" />}
          >
            Retake Round 1
          </Button>
        ) : (
          <Button
            size="lg"
            fullWidth
            href="/candidate/interview/basic"
            leadingIcon={<RotateCcw aria-hidden="true" />}
          >
            Retake Round 1
          </Button>
        )
      ) : (
        !isRound1 &&
        onRestart && (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onRestart}
            leadingIcon={<RotateCcw aria-hidden="true" />}
          >
            Start a new practice interview
          </Button>
        )
      )}
    </div>
  );
}

const REPORT_LISTS = [
  {
    key: "strengths",
    title: "Strengths",
    icon: <CircleCheck aria-hidden="true" className="h-4 w-4" />,
    tile: "bg-brand-50 text-brand-600",
    dot: "bg-brand-500",
  },
  {
    key: "areasToImprove",
    title: "Areas to improve",
    icon: <TrendingUp aria-hidden="true" className="h-4 w-4" />,
    tile: "bg-brand-50 text-brand-500",
    dot: "bg-brand-300",
  },
  {
    key: "learningPlan",
    title: "Learning plan",
    icon: <BookOpen aria-hidden="true" className="h-4 w-4" />,
    tile: "bg-brand-50 text-brand-700",
    dot: "bg-brand-500",
  },
] as const;

/** One titled list of report bullets (strengths, areas to improve, plan). */
export function ReportList({
  title,
  items,
  icon,
  tile,
  dot,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  tile: string;
  dot: string;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tile}`}
        >
          {icon}
        </span>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
      </div>
      <ul className="divide-y divide-line-soft">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 py-2.5 text-sm leading-6 text-body first:pt-0 last:pb-0"
          >
            <span
              aria-hidden="true"
              className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`}
            />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The report's stage scores and narrative lists (the summary is shown by the caller). */
export function ReportDetails({ report }: { report: InterviewReport }) {
  const hasScores =
    report.basicScore !== undefined || report.technicalScore !== undefined;

  return (
    <>
      {hasScores && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {report.basicScore !== undefined && (
            <ScoreBar
              label="Round 1 — Basic"
              score={Math.round(report.basicScore * 10)}
              gradient="bg-brand"
            />
          )}
          {report.technicalScore !== undefined && (
            <ScoreBar
              label="Round 2 — Technical"
              score={Math.round(report.technicalScore * 10)}
              gradient="bg-brand"
            />
          )}
        </div>
      )}

      {REPORT_LISTS.map(({ key, title, icon, tile, dot }) => {
        const items = report[key];
        return items && items.length > 0 ? (
          <ReportList
            key={key}
            title={title}
            items={items}
            icon={icon}
            tile={tile}
            dot={dot}
          />
        ) : null;
      })}
    </>
  );
}

export function TurnHistory({
  turns,
  title,
}: {
  turns: InterviewTurnView[];
  title: string;
}) {
  if (turns.length === 0) return null;
  return (
    <Card
      title={title}
      padding="none"
      action={
        <span className="text-sm tabular-nums text-muted">
          {turns.length} question{turns.length === 1 ? "" : "s"}
        </span>
      }
    >
      <ol className="divide-y divide-line-soft border-t border-line-soft">
        {turns.map((turn) => (
          <li
            key={`${turn.round}-${turn.questionNumber}`}
            className="flex gap-3 px-5 py-5 sm:gap-4 sm:px-6"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:flex"
            >
              <MessageSquareText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">
                    Round {turn.round} · Question {turn.questionNumber}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-6 text-ink">
                    {turn.question}
                  </h3>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <VerdictBadge verdict={turn.verdict} />
                  {turn.score !== undefined && (
                    <Badge tone="brand" className="tabular-nums">
                      {turn.score}/10
                    </Badge>
                  )}
                </div>
              </div>
              <div className="mt-3 rounded-lg border-l-2 border-brand-200 bg-surface-2 px-3.5 py-3">
                <p className="text-xs font-medium text-muted">Your answer</p>
                <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-body">
                  {turn.answer || "No answer provided."}
                </p>
              </div>
              {turn.feedback && (
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-body">
                  <span className="font-semibold text-ink">Feedback: </span>
                  {turn.feedback}
                </p>
              )}
              {turn.improvementTip && (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-brand-800">
                  <span className="font-semibold text-brand-700">Tip: </span>
                  {turn.improvementTip}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
