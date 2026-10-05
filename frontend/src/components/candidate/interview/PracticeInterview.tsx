"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { startInterview } from "@/lib/interviewApi";
import { INTERVIEW_LEVEL_LABELS } from "@/lib/format";
import type { InterviewLevel, InterviewSessionView } from "@/lib/types";
import { InlineError, LoadingBlock } from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";
import { InterviewRunner } from "./InterviewRunner";

const LEVEL_BLURBS: Record<InterviewLevel, string> = {
  beginner:
    "Foundational questions and gentle follow-ups — good for a first practice run.",
  intermediate:
    "Applied scenarios with deeper follow-ups on how and why you'd do something.",
  expert:
    "Hard, open-ended design and trade-off questions with little hand-holding.",
};

/**
 * Practice mode. The backend reuses any in-progress practice session for this
 * user, so hitting Start again resumes rather than restarting — the copy says so.
 */
export function PracticeInterview({
  levels,
  heading,
  intro,
  icon,
}: {
  /** Which of the backend's three enum levels this page offers. */
  levels: InterviewLevel[];
  heading: string;
  intro: string;
  icon: string;
}) {
  const { token } = useAuth();
  const [session, setSession] = useState<InterviewSessionView | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<InterviewLevel>(levels[0]);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    try {
      const started = await startInterview(selectedLevel, token);
      setSession(started);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsStarting(false);
    }
  }, [selectedLevel, token]);

  if (isStarting && !session) {
    return (
      <LoadingBlock label="Waking the interviewer and preparing your first question…" />
    );
  }

  if (session) {
    return (
      <InterviewRunner
        session={session}
        onSessionChange={setSession}
        title={`${INTERVIEW_LEVEL_LABELS[selectedLevel]} practice interview`}
        subtitle="Practice mode — not tied to a job application."
        onRestart={() => setSession(null)}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl shadow-lg">
          {icon}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{heading}</h1>
        <p className="mx-auto mt-3 max-w-lg text-gray-500">{intro}</p>

        {levels.length > 1 && (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {levels.map((level) => {
              const isActive = level === selectedLevel;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className={`rounded-xl border p-5 text-left transition-colors ${
                    isActive
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-100 bg-white hover:border-indigo-100 hover:bg-gray-50"
                  }`}
                >
                  <p
                    className={`font-bold ${isActive ? "text-indigo-900" : "text-gray-900"}`}
                  >
                    {INTERVIEW_LEVEL_LABELS[level]}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {LEVEL_BLURBS[level]}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {levels.length === 1 && (
          <p className="mx-auto mt-6 max-w-lg rounded-xl bg-white p-5 text-sm text-gray-600 shadow-sm">
            {LEVEL_BLURBS[levels[0]]}
          </p>
        )}

        {error && (
          <div className="mx-auto mt-6 max-w-lg text-left">
            <InlineError message={error} />
          </div>
        )}

        <button
          type="button"
          onClick={handleStart}
          disabled={isStarting}
          className={`${primaryButtonClass} mt-8 px-8 py-3.5`}
        >
          {isStarting ? "Starting…" : "Start Interview"}
        </button>
        <p className="mt-3 text-xs text-gray-400">
          If you already have an unfinished practice interview, this resumes it.
        </p>
      </div>
    </div>
  );
}
