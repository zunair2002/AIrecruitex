"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { submitAnswer } from "@/lib/interviewApi";
import {
  INTERVIEW_RESULT_BADGE,
  INTERVIEW_RESULT_LABELS,
} from "@/lib/format";
import type { InterviewSessionView, InterviewTurn } from "@/lib/types";
import { Card, InlineError } from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";
import { CertificatePanel } from "./CertificatePanel";
import { FinalScoreRing } from "./ScoreBreakdown";

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
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const next = await submitAnswer(
        { sessionId: session.sessionId, answer: answer.trim() },
        token,
      );
      setAnswer("");
      onSessionChange(next);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session.status === "completed") {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-8">
        <Card>
          <div className="flex flex-col items-center gap-8 sm:flex-row">
            <FinalScoreRing score={session.score ?? 0} />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
              {session.result && (
                <span
                  className={`${INTERVIEW_RESULT_BADGE[session.result]} mt-3`}
                >
                  {INTERVIEW_RESULT_LABELS[session.result]}
                </span>
              )}
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {session.feedback ?? "No overall feedback was returned."}
              </p>
            </div>
          </div>
        </Card>

        <TurnHistory turns={session.turns} title="Question-by-question feedback" />

        <CertificatePanel
          sessionId={session.sessionId}
          score={session.score}
          result={session.result}
          certificatePaid={session.certificatePaid}
        />

        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Start a new practice interview
          </button>
        )}
      </div>
    );
  }

  const answered = session.turns.length;
  const questionNumber = session.questionNumber ?? answered + 1;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
          <span>{title}</span>
          <span>
            {answered} answered · Question {questionNumber}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
            // The model decides when to stop; 5 answered questions is the
            // backend's hard cap (MAX_QUESTIONS in interview.service.ts).
            style={{ width: `${Math.min(100, (answered / 5) * 100)}%` }}
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
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {session.question ?? "Waiting for the next question…"}
            </h2>
          </div>
        </div>
      </Card>

      <Card>
        <label
          htmlFor="interview-answer"
          className="mb-3 block text-sm font-semibold text-gray-900"
        >
          Your Answer
        </label>
        <textarea
          id="interview-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          rows={8}
          placeholder="Type your answer here…"
          disabled={isSubmitting}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
        />
        <p className="mt-2 text-xs text-gray-400">
          {answer.trim().split(/\s+/).filter(Boolean).length} words
        </p>

        {error && (
          <div className="mt-4">
            <InlineError message={error} />
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!answer.trim() || isSubmitting}
          className={`${primaryButtonClass} mt-4 w-full`}
        >
          {isSubmitting ? "Scoring your answer…" : "Submit Answer"}
        </button>
        <p className="mt-2 text-center text-xs text-gray-400">
          The interviewer scores each answer as you go — this can take a few seconds.
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

export function TurnHistory({
  turns,
  title,
}: {
  turns: InterviewTurn[];
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
                Q{turn.questionNumber}. {turn.question}
              </p>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-indigo-600">
                {turn.score}/10
              </span>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-gray-700">
              <span className="font-semibold text-gray-500">Your answer: </span>
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
  );
}
