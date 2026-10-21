"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { submitAnswer } from "@/lib/interviewApi";
import {
  INTERVIEW_DECISION_LABELS,
  INTERVIEW_RESULT_BADGE,
  INTERVIEW_RESULT_LABELS,
  TRACK_LABELS,
} from "@/lib/format";
import type {
  InterviewReport,
  InterviewSessionCompleted,
  InterviewSessionView,
  InterviewTurnView,
} from "@/lib/types";
import { VerdictBadge } from "@/components/shared/VerdictBadge";
import { Card, InlineError } from "@/components/ui/Feedback";
import { primaryButtonClass, secondaryButtonClass } from "@/components/ui/controls";
import { CertificatePanel } from "./CertificatePanel";
import { FinalScoreRing, ScoreBar } from "./ScoreBreakdown";
import { VoiceAnswerField, useVoiceAnswer } from "./VoiceAnswer";

/** Round 1 (5) + Round 2 (8) — used when the backend doesn't send a total. */
const FALLBACK_TOTAL_QUESTIONS = 13;

/**
 * Drives one interview session: renders the model's current question, posts the
 * answer, then renders the report once the backend flips `status` to
 * "completed". Works for both practice sessions and HR-scheduled ones — the
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
  const answer = useVoiceAnswer(
    session.status === "in_progress" ? session.question : undefined,
  );

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
      setError(toErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session.status === "completed") {
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
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
          <span>{title}</span>
          <span>{progressLabel}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
            style={{ width: `${Math.min(100, (answered / totalQuestions) * 100)}%` }}
          />
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
            AI
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Interviewer · Question {questionNumber}
              {answer.voice.speaking && " · speaking…"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {session.question ?? "Waiting for the next question…"}
            </h2>
          </div>
        </div>
      </Card>

      <Card>
        <VoiceAnswerField
          id="interview-answer"
          label="Your Answer"
          answer={answer}
          disabled={isSubmitting}
        />

        {error && (
          <div className="mt-4">
            <InlineError message={error} />
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!answer.value.trim() || isSubmitting}
          className={`${primaryButtonClass} mt-4 w-full`}
        >
          {isSubmitting
            ? isLastQuestion
              ? "Generating your report… (this can take up to a minute)"
              : "Submitting your answer…"
            : "Submit Answer"}
        </button>
        <p className="mt-2 text-center text-xs text-gray-400">
          {isLastQuestion
            ? "This is the last question — your full report is generated after you submit."
            : "Answers are evaluated in the background; your report arrives after the last question."}
        </p>
      </Card>

      {session.turns.length > 0 && (
        <div className="mt-6">
          <TurnHistory turns={session.turns} title="Answered so far" />
        </div>
      )}
    </div>
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
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <Card>
        <div className="flex flex-col items-center gap-8 sm:flex-row">
          <FinalScoreRing score={session.score ?? 0} />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            {session.result && (
              <span className={`${INTERVIEW_RESULT_BADGE[session.result]} mt-3`}>
                {INTERVIEW_RESULT_LABELS[session.result]}
              </span>
            )}
            <p className="mt-3 text-sm font-semibold text-gray-700">
              Overall score: {session.score ?? 0}%
              {decision && (
                <>
                  <span className="mx-2 text-gray-300">·</span>
                  Decision: {INTERVIEW_DECISION_LABELS[decision]}
                </>
              )}
            </p>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {session.report?.summary ||
                session.feedback ||
                "No overall feedback was returned."}
            </p>
          </div>
        </div>
      </Card>

      {session.report && <ReportDetails report={session.report} />}

      {isRound1 && session.round2Unlocked && (
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-emerald-900">🔓 Round 2 unlocked</h2>
          <p className="mt-1 text-sm text-emerald-800">
            Nice work. The technical interview on your track is ready when you are.
          </p>
          <Link
            href="/candidate/interview/advanced"
            className={`${primaryButtonClass} mt-4 inline-block text-sm`}
          >
            Start Round 2 — Technical Interview
          </Link>
        </div>
      )}

      {tips.length > 0 && (
        <Card title="Before you try again">
          <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </Card>
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
          <button
            type="button"
            onClick={onRestart}
            className={`${primaryButtonClass} w-full`}
          >
            Retake Round 1
          </button>
        ) : (
          <Link
            href="/candidate/interview/basic"
            className={`${primaryButtonClass} block w-full text-center`}
          >
            Retake Round 1
          </Link>
        )
      ) : (
        !isRound1 &&
        onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className={`${secondaryButtonClass} w-full`}
          >
            Start a new practice interview
          </button>
        )
      )}
    </div>
  );
}

/** The report's stage scores and narrative lists (the summary is shown by the caller). */
export function ReportDetails({ report }: { report: InterviewReport }) {
  const lists: { title: string; items?: string[] }[] = [
    { title: "Strengths", items: report.strengths },
    { title: "Areas to improve", items: report.areasToImprove },
    { title: "Learning plan", items: report.learningPlan },
  ];
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
              gradient="from-indigo-500 to-purple-600"
            />
          )}
          {report.technicalScore !== undefined && (
            <ScoreBar
              label="Round 2 — Technical"
              score={Math.round(report.technicalScore * 10)}
              gradient="from-purple-500 to-pink-600"
            />
          )}
        </div>
      )}

      {lists.map(({ title, items }) =>
        items && items.length > 0 ? (
          <Card key={title} title={title}>
            <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        ) : null,
      )}
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
    <Card title={title}>
      <div className="space-y-4">
        {turns.map((turn) => (
          <div
            key={turn.questionNumber}
            className="rounded-xl border border-gray-100 bg-gray-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">
                <span className="mr-2 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Round {turn.round}
                </span>
                Q{turn.questionNumber}. {turn.question}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <VerdictBadge verdict={turn.verdict} />
                {turn.score !== undefined && (
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-indigo-600">
                    {turn.score}/10
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-gray-700">
              <span className="font-semibold text-gray-500">Your answer: </span>
              {turn.answer}
            </p>
            {turn.feedback && (
              <p className="mt-2 whitespace-pre-line text-sm text-indigo-900">
                <span className="font-semibold text-indigo-600">Feedback: </span>
                {turn.feedback}
              </p>
            )}
            {turn.improvementTip && (
              <p className="mt-2 whitespace-pre-line text-sm text-emerald-900">
                <span className="font-semibold text-emerald-700">Tip: </span>
                {turn.improvementTip}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
