"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { listMySessions, listTracks, startInterview } from "@/lib/interviewApi";
import { useApiResource } from "@/lib/useApiResource";
import { TRACK_LABELS, scoreColor } from "@/lib/format";
import type {
  InterviewSessionView,
  InterviewStage,
  TrackId,
} from "@/lib/types";
import {
  ErrorBlock,
  InlineError,
  LoadingBlock,
  SkillChips,
} from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";
import { InterviewRunner } from "./InterviewRunner";

/** Round 1 must score at least this (0-100) to unlock Round 2 — ROUND2_UNLOCK_SCORE. */
const ROUND2_UNLOCK_SCORE = 50;
const DEFAULT_TRACK: TrackId = "fullstack";

const STAGE_COPY: Record<
  InterviewStage,
  { heading: string; intro: string; icon: string; questions: number }
> = {
  basic: {
    heading: "Round 1 — Basic Interview",
    intro:
      "Five warm-up questions about you, your projects and how you work. Score 50% or more to unlock the technical round.",
    icon: "🎤",
    questions: 5,
  },
  technical: {
    heading: "Round 2 — Technical Interview",
    intro:
      "Eight technical questions on your chosen track. Your final report combines both rounds, and a pass earns a certificate.",
    icon: "🚀",
    questions: 8,
  },
};

const humanizeTopic = (topic: string) => topic.replace(/_/g, " ");

/**
 * Practice mode, one round per page. Round 2 checks the candidate's latest
 * completed Round 1 up front so the lock state shows before they press Start;
 * the backend enforces the same rule and its message is shown if it refuses.
 */
export function PracticeInterview({ stage }: { stage: InterviewStage }) {
  const { token } = useAuth();
  const copy = STAGE_COPY[stage];
  const isRound2 = stage === "technical";

  const [session, setSession] = useState<InterviewSessionView | null>(null);
  const [pickedTrack, setPickedTrack] = useState<TrackId | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tracks = useApiResource((signal) => listTracks(signal), []);
  const history = useApiResource(
    (signal) => listMySessions("practice", token, signal),
    [token],
    { enabled: Boolean(token && isRound2) },
  );

  // Newest first, so the first match is the latest completed Round 1.
  const latestRound1 = history.data?.find(
    (s) => s.stage === "basic" && s.status === "completed",
  );
  const track: TrackId =
    pickedTrack ?? (isRound2 ? latestRound1?.track : undefined) ?? DEFAULT_TRACK;
  const trackLabel =
    tracks.data?.find((t) => t.id === track)?.label ?? TRACK_LABELS[track] ?? track;

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);
    try {
      setSession(await startInterview({ stage, track }, token));
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsStarting(false);
    }
  };

  if (isStarting && !session) {
    return (
      <LoadingBlock label="Waking the interviewer and preparing your questions…" />
    );
  }

  if (session) {
    return (
      <InterviewRunner
        session={session}
        onSessionChange={setSession}
        title={copy.heading}
        subtitle={`Practice mode · ${trackLabel}`}
        onRestart={() => setSession(null)}
      />
    );
  }

  if (isRound2 && history.isLoading) {
    return <LoadingBlock label="Checking your Round 1 result…" />;
  }

  let lockedState: React.ReactNode = null;
  if (isRound2 && history.error) {
    lockedState = <ErrorBlock message={history.error} onRetry={history.reload} />;
  } else if (isRound2 && !latestRound1) {
    lockedState = (
      <LockedCard
        title="Complete Round 1 first"
        body="Round 2 unlocks once you finish the basic interview with a score of 50% or more."
        href="/candidate/interview/basic"
        cta="Go to Round 1"
      />
    );
  } else if (
    isRound2 &&
    latestRound1 &&
    (latestRound1.score ?? 0) < ROUND2_UNLOCK_SCORE
  ) {
    const score = latestRound1.score ?? 0;
    lockedState = (
      <LockedCard
        title="Round 2 is locked"
        body={
          <>
            Your latest Round 1 score was{" "}
            <span className={`font-bold ${scoreColor(score)}`}>{score}%</span>. You
            need {ROUND2_UNLOCK_SCORE}% to unlock the technical interview — review the
            tips in your Round 1 report and try again.
          </>
        }
        href="/candidate/interview/basic"
        cta="Retake Round 1"
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand text-4xl ">
          {lockedState ? "🔒" : copy.icon}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{copy.heading}</h1>
        <p className="mx-auto mt-3 max-w-lg text-gray-500">{copy.intro}</p>

        {lockedState ? (
          <div className="mx-auto mt-8 max-w-lg text-left">{lockedState}</div>
        ) : (
          <>
            <div className="mt-8 text-left">
              <p className="mb-3 text-sm font-semibold text-gray-900">
                {isRound2
                  ? "Your track"
                  : "Choose your track — Round 2 uses it for its technical questions"}
              </p>
              {tracks.isLoading ? (
                <LoadingBlock label="Loading tracks…" />
              ) : tracks.error ? (
                <InlineError
                  message={`Couldn't load tracks (${tracks.error}). You can still start with the ${TRACK_LABELS[track]} track.`}
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(tracks.data ?? []).map((option) => {
                    const isActive = option.id === track;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPickedTrack(option.id)}
                        aria-pressed={isActive}
                        className={`rounded-xl border p-5 text-left transition-colors ${
                          isActive
                            ? "border-brand/50 bg-brand-light"
                            : "border-gray-100 bg-white hover:border-brand-light hover:bg-gray-50"
                        }`}
                      >
                        <p
                          className={`font-bold ${isActive ? "text-zinc-900" : "text-gray-900"}`}
                        >
                          {option.label}
                        </p>
                        <div className="mt-2">
                          <SkillChips
                            skills={option.topics.map(humanizeTopic)}
                            tone={isActive ? "indigo" : "gray"}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {isRound2 && latestRound1?.track && (
                <p className="mt-2 text-xs text-gray-400">
                  Preselected from your latest Round 1 (
                  {TRACK_LABELS[latestRound1.track] ?? latestRound1.track}).
                </p>
              )}
            </div>

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
              {isStarting ? "Starting…" : `Start Round ${isRound2 ? 2 : 1}`}
            </button>
            <p className="mt-3 text-xs text-gray-400">
              {copy.questions} questions. If you have an unfinished round on this
              track, this resumes it. Voice answers work in Chrome or Edge.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function LockedCard({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: React.ReactNode;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 ">
      <h2 className="text-lg font-bold text-amber-900">{title}</h2>
      <p className="mt-1 text-sm text-amber-800">{body}</p>
      <Link href={href} className={`${primaryButtonClass} mt-4 inline-block text-sm`}>
        {cta}
      </Link>
    </div>
  );
}
