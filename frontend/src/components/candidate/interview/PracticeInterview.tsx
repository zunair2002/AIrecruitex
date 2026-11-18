"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Briefcase,
  Check,
  CircleCheck,
  ClipboardCheck,
  Cpu,
  Crown,
  FileBarChart,
  History,
  Layers,
  ListChecks,
  Lock,
  Mic,
  Monitor,
  Play,
  Route,
  Server,
  Target,
  Timer,
  Trophy,
  Unlock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError, toErrorMessage } from "@/lib/api";
import {
  getPracticeUsage,
  listMySessions,
  listTracks,
  startInterview,
} from "@/lib/interviewApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  INTERVIEW_STATUS_BADGE,
  INTERVIEW_STATUS_LABELS,
  TRACK_LABELS,
  formatDate,
  formatDateTime,
  roundTrackLabel,
  scoreColor,
} from "@/lib/format";
import type {
  InterviewSessionSummary,
  InterviewSessionView,
  InterviewStage,
  PracticeUsage,
  TrackId,
} from "@/lib/types";
import {
  DashboardHero,
  HeroButton,
  HeroMeter,
  type HeroStat,
} from "@/components/dashboard/DashboardHero";
import { PanelLink, PortalPage } from "@/components/dashboard/primitives";
import { Badge, scoreTone } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { PlanBadge } from "@/components/candidate/plan/PlanBits";
import {
  Card,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  SkillChips,
} from "@/components/ui/Feedback";
import { InterviewRunner } from "./InterviewRunner";

/** Round 1 must score at least this (0-100) to unlock Round 2 — ROUND2_UNLOCK_SCORE. */
const ROUND2_UNLOCK_SCORE = 50;
const DEFAULT_TRACK: TrackId = "fullstack";

const STAGE_COPY: Record<
  InterviewStage,
  {
    heading: string;
    title: string;
    pitch: string;
    questions: number;
  }
> = {
  basic: {
    heading: "Round 1 — Basic interview",
    title: "Basic interview",
    pitch:
      "Five warm-up questions about you, your projects and how you work. Score 50% or more to unlock the technical round.",
    questions: 5,
  },
  technical: {
    heading: "Round 2 — Technical interview",
    title: "Technical interview",
    pitch:
      "Eight technical questions on your chosen track. Your final report combines both rounds, and a pass earns a certificate.",
    questions: 8,
  },
};

/** A distinct icon and one-line pitch per track (unknown tracks fall back). */
const TRACK_META: Record<string, { icon: React.ReactNode; blurb: string }> = {
  frontend: {
    icon: <Monitor />,
    blurb: "Interfaces, the web platform and UI engineering.",
  },
  backend: {
    icon: <Server />,
    blurb: "APIs, databases, networking and system internals.",
  },
  fullstack: {
    icon: <Layers />,
    blurb: "End-to-end features across client, server and data.",
  },
  data_ai: {
    icon: <BrainCircuit />,
    blurb: "Machine learning, big data and data modelling.",
  },
  software_engineer: {
    icon: <Cpu />,
    blurb: "Core CS: algorithms, OOP, operating systems and design.",
  },
};
const FALLBACK_TRACK_META = {
  icon: <Briefcase />,
  blurb: "Technical questions on this track.",
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
  // The plan's daily practice allowance (free 5/day, premium 10/day).
  const usage = useApiResource(
    (signal) => getPracticeUsage(token, signal),
    [token],
    { enabled: Boolean(token) },
  );
  // Both rounds read the practice history: Round 2 for its lock state, and
  // both pages for the attempts / best-score summary.
  const history = useApiResource(
    (signal) => listMySessions("practice", token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  // Newest first, so the first match is the latest completed Round 1.
  const latestRound1 = history.data?.find(
    (s) => s.stage === "basic" && s.status === "completed",
  );
  const track: TrackId =
    pickedTrack ?? (isRound2 ? latestRound1?.track : undefined) ?? DEFAULT_TRACK;
  const trackLabel =
    tracks.data?.find((t) => t.id === track)?.label ?? TRACK_LABELS[track] ?? track;

  // Resuming an unfinished round never uses up the allowance.
  const canResume = Boolean(
    history.data?.some(
      (s) => s.stage === stage && s.track === track && s.status === "in_progress",
    ),
  );
  const limitReached = Boolean(usage.data && usage.data.remaining <= 0 && !canResume);

  const handleStart = async () => {
    if (limitReached) return;
    setIsStarting(true);
    setError(null);
    try {
      setSession(await startInterview({ stage, track }, token));
      usage.reload();
    } catch (err) {
      // 429 = allowance used up meanwhile; refresh so the limit state shows.
      if (err instanceof ApiError && err.status === 429) usage.reload();
      else setError(toErrorMessage(err));
    } finally {
      setIsStarting(false);
    }
  };

  if (isStarting && !session) {
    return (
      <PortalPage>
        <Card>
          <LoadingBlock label="Waking the interviewer and preparing your questions…" />
        </Card>
      </PortalPage>
    );
  }

  if (session) {
    return (
      <InterviewRunner
        session={session}
        onSessionChange={setSession}
        title={copy.heading}
        subtitle={`Practice mode · ${trackLabel}`}
        onRestart={() => {
          setSession(null);
          usage.reload();
        }}
      />
    );
  }

  if (isRound2 && history.isLoading) {
    return (
      <PortalPage>
        <Card>
          <LoadingBlock label="Checking your Round 1 result…" />
        </Card>
      </PortalPage>
    );
  }

  const latestRound1Score = latestRound1?.score ?? 0;
  const round2Unlocked =
    Boolean(latestRound1) && latestRound1Score >= ROUND2_UNLOCK_SCORE;

  let lockedState: React.ReactNode = null;
  if (isRound2 && history.error) {
    lockedState = <ErrorBlock message={history.error} onRetry={history.reload} />;
  } else if (isRound2 && !latestRound1) {
    lockedState = (
      <LockedCard
        title="Complete Round 1 first"
        body="Round 2 unlocks once you finish the basic interview with a score of 50% or more."
        score={null}
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
            <span className={`font-semibold tabular-nums ${scoreColor(score)}`}>
              {score}%
            </span>
            . You need {ROUND2_UNLOCK_SCORE}% to unlock the technical interview — review the
            tips in your Round 1 report and try again.
          </>
        }
        score={score}
        href="/candidate/interview/basic"
        cta="Retake Round 1"
      />
    );
  }

  // Summary numbers for the hero, from the practice history.
  const practice = history.data ?? [];
  const stageSessions = practice.filter((s) => s.stage === stage);
  const stageScores = stageSessions
    .filter((s) => s.status === "completed" && typeof s.score === "number")
    .map((s) => s.score as number);
  const bestScore = stageScores.length > 0 ? Math.max(...stageScores) : null;

  const stats: HeroStat[] = [
    usage.data
      ? {
          label: "Left today",
          value: `${usage.data.remaining} of ${usage.data.limit}`,
          detail: limitReached ? "Daily limit reached" : "Practice interviews",
          icon: <Timer />,
          trend: usage.data.remaining > 0 ? "neutral" : "down",
        }
      : {
          label: "Questions",
          value: copy.questions,
          detail: isRound2 ? "On your chosen track" : "About you and your work",
          icon: <ListChecks />,
        },
    isRound2
      ? {
          label: "Reward",
          value: "Certificate",
          detail: "When you pass",
          icon: <Trophy />,
        }
      : {
          label: "Unlock score",
          value: `${ROUND2_UNLOCK_SCORE}%`,
          detail: "Opens Round 2",
          icon: <Target />,
        },
    {
      label: "Your attempts",
      value: history.isLoading ? "—" : stageSessions.length,
      detail: stageSessions.length === 1 ? "Practice round" : "Practice rounds",
      icon: <History />,
    },
    {
      label: "Best score",
      value: bestScore === null ? "—" : `${bestScore}%`,
      detail: bestScore === null ? "No scored round yet" : "Across your attempts",
      icon: <BarChart3 />,
      trend:
        bestScore === null
          ? "neutral"
          : bestScore >= ROUND2_UNLOCK_SCORE
            ? "up"
            : "down",
    },
  ];

  const meter = latestRound1 ? (
    <HeroMeter
      value={latestRound1Score}
      label="Latest Round 1 score"
      caption={
        round2Unlocked
          ? "Round 2 is unlocked — the technical round is ready."
          : `${ROUND2_UNLOCK_SCORE - latestRound1Score} more points to unlock Round 2.`
      }
    />
  ) : (
    <HeroMeter
      value={0}
      label="Round 1 not scored yet"
      caption={`Score ${ROUND2_UNLOCK_SCORE}% or more in Round 1 to unlock the technical round.`}
    />
  );

  const steps = [
    {
      icon: <Route className="h-5 w-5" />,
      title: isRound2 ? "Confirm your track" : "Choose a track",
      detail: isRound2
        ? "Preselected from your latest Round 1 — change it any time."
        : "Round 2 uses it for its technical questions.",
    },
    {
      icon: <Mic className="h-5 w-5" />,
      title: `Answer ${copy.questions} questions`,
      detail: "One at a time, by typing or speaking.",
    },
    {
      icon: <FileBarChart className="h-5 w-5" />,
      title: "Get a scored report",
      detail: isRound2
        ? "Combined feedback for both rounds, plus a certificate on a pass."
        : "Per-answer feedback, tips and your Round 2 unlock.",
    },
  ];

  const selectedMeta = TRACK_META[track] ?? FALLBACK_TRACK_META;

  return (
    <PortalPage>
      <DashboardHero
        eyebrow={`Round ${isRound2 ? 2 : 1} · Practice`}
        title={copy.title}
        description={copy.pitch}
        actions={
          lockedState ? (
            <HeroButton
              href="/candidate/interview/basic"
              icon={<ArrowRight aria-hidden="true" />}
            >
              Go to Round 1
            </HeroButton>
          ) : (
            <>
              {limitReached ? (
                usage.data?.plan === "free" ? (
                  <HeroButton href="/pricing" icon={<Crown aria-hidden="true" />}>
                    Upgrade to Premium
                  </HeroButton>
                ) : null
              ) : (
                <HeroButton onClick={handleStart} icon={<Play aria-hidden="true" />}>
                  {`Start Round ${isRound2 ? 2 : 1}`}
                </HeroButton>
              )}
              <HeroButton
                href="/candidate/interview/result"
                variant="ghost"
                icon={<ClipboardCheck aria-hidden="true" />}
              >
                View past reports
              </HeroButton>
            </>
          )
        }
        aside={meter}
        stats={stats}
      />

      <section
        aria-label="How it works"
        className="rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          How it works
        </p>
        <ol className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 sm:flex-col sm:gap-3">
              {index < steps.length - 1 && (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-12 -bottom-4 w-px bg-line sm:hidden"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-14 right-2 top-5 hidden h-px bg-gradient-to-r from-brand-200 to-line sm:block"
                  />
                </>
              )}
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/10">
                {step.icon}
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white ring-2 ring-surface">
                  {index + 1}
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{step.title}</p>
                <p className="mt-0.5 text-sm text-muted">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          {lockedState ? (
            lockedState
          ) : (
            <Card
              title={isRound2 ? "Your track" : "Choose your track"}
              description={
                isRound2
                  ? "Round 2 asks technical questions on this track."
                  : "Round 2 uses it for its technical questions."
              }
            >
              {tracks.isLoading ? (
                <LoadingBlock label="Loading tracks…" />
              ) : tracks.error ? (
                <InlineError
                  message={`Couldn't load tracks (${tracks.error}). You can still start with the ${TRACK_LABELS[track]} track.`}
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
                  {(tracks.data ?? []).map((option) => {
                    const isActive = option.id === track;
                    const meta = TRACK_META[option.id] ?? FALLBACK_TRACK_META;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPickedTrack(option.id)}
                        aria-pressed={isActive}
                        className={`group relative flex min-w-0 flex-col rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:p-5 ${
                          isActive
                            ? "border-brand-500 bg-brand-50 ring-1 ring-inset ring-brand-500"
                            : "border-line bg-surface hover:border-brand-200"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                            isActive
                              ? "bg-brand-700 text-white"
                              : "border border-line bg-surface text-transparent group-hover:border-brand-200"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span
                          aria-hidden="true"
                          className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors [&>svg]:h-5 [&>svg]:w-5 ${
                            isActive
                              ? "bg-brand-700 text-white"
                              : "bg-brand-50 text-brand-700"
                          }`}
                        >
                          {meta.icon}
                        </span>
                        <span className="mt-4 block pr-8 text-base font-semibold text-ink">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-sm text-muted">
                          {meta.blurb}
                        </span>
                        <span className="mt-4 block">
                          <SkillChips
                            skills={option.topics.map(humanizeTopic)}
                            tone={isActive ? "indigo" : "gray"}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {isRound2 && latestRound1?.track && (
                <p className="mt-3 text-xs text-muted">
                  Preselected from your latest Round 1 (
                  {TRACK_LABELS[latestRound1.track] ?? latestRound1.track}).
                </p>
              )}

              {error && (
                <div className="mt-5">
                  <InlineError message={error} />
                </div>
              )}

              {limitReached && usage.data ? (
                <LimitReachedPanel usage={usage.data} onAvailable={usage.reload} />
              ) : (
              <div className="mt-6 flex flex-col gap-4 rounded-xl border border-brand-200 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white [&>svg]:h-5 [&>svg]:w-5"
                  >
                    {selectedMeta.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted">Selected track</p>
                    <p className="truncate text-sm font-semibold text-ink">
                      {trackLabel}
                      <span className="font-normal text-muted">
                        {" "}
                        · {copy.questions} questions
                      </span>
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={isStarting}
                  loading={isStarting}
                  leadingIcon={<Play aria-hidden="true" />}
                  className="w-full sm:w-auto"
                >
                  {isStarting ? "Starting…" : `Start Round ${isRound2 ? 2 : 1}`}
                </Button>
              </div>
              )}
              <p className="mt-3 text-xs text-muted">
                {copy.questions} questions. If you have an unfinished round on this
                track, this resumes it. Voice answers work in Chrome or Edge.
              </p>
            </Card>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {usage.data && <UsageCard usage={usage.data} canResume={canResume} />}
          <ProgressCard
            sessions={practice}
            isLoading={history.isLoading}
            latestRound1Score={latestRound1 ? latestRound1Score : null}
            round2Unlocked={round2Unlocked}
          />
        </div>
      </div>
    </PortalPage>
  );
}

/** Ticks every second until `target`, then calls `onDone` once. */
function useCountdown(target: string | null, onDone?: () => void): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const end = new Date(target).getTime();
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= end) {
        window.clearInterval(id);
        onDone?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [target, onDone]);
  return target ? Math.max(0, new Date(target).getTime() - now) : 0;
}

function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec.toString().padStart(2, "0")}s`;
  return `${sec}s`;
}

/** Shown in place of the Start panel once the plan's allowance is used up. */
function LimitReachedPanel({
  usage,
  onAvailable,
}: {
  usage: PracticeUsage;
  onAvailable: () => void;
}) {
  const left = useCountdown(usage.nextAvailableAt, onAvailable);
  const isFree = usage.plan === "free";
  return (
    <div
      role="status"
      className="mt-6 flex flex-col gap-4 rounded-xl border border-warning-200 bg-warning-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-100 text-warning-700"
        >
          <Timer className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            Limit reached — you can practise again in{" "}
            <span className="tabular-nums">{formatCountdown(left)}</span>
          </p>
          <p className="mt-0.5 text-sm text-body">
            You&apos;ve used all {usage.limit} practice interviews on the{" "}
            {isFree ? "Free" : "Premium"} plan.
            {isFree && " Premium members get 10 a day."}
          </p>
        </div>
      </div>
      {isFree && (
        <Link
          href="/pricing"
          className={buttonClass({ size: "lg", className: "w-full shrink-0 sm:w-auto" })}
        >
          <Crown aria-hidden="true" />
          Upgrade to Premium for 10/day
        </Link>
      )}
    </div>
  );
}

/** Today's practice allowance for the candidate's plan. */
function UsageCard({ usage, canResume }: { usage: PracticeUsage; canResume: boolean }) {
  const percent = Math.round((usage.used / usage.limit) * 100);
  const exhausted = usage.remaining <= 0;
  return (
    <Card title="Practice allowance" action={<PlanBadge plan={usage.plan} />}>
      <p className="text-sm text-body">
        <span className="text-2xl font-semibold tabular-nums text-ink">
          {usage.remaining}
        </span>{" "}
        of {usage.limit} practice interviews left today
      </p>
      <div
        role="progressbar"
        aria-label="Practice interviews used today"
        aria-valuemin={0}
        aria-valuemax={usage.limit}
        aria-valuenow={usage.used}
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className={`h-full rounded-full transition-[width] ${exhausted ? "bg-warning-500" : "bg-brand-600"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        {exhausted
          ? canResume
            ? "Limit reached — you can still finish your unfinished round."
            : "Limit reached. Resuming an unfinished round never counts."
          : usage.resetsAt
            ? `Next slot frees up ${formatDateTime(usage.resetsAt)}. Resuming never counts.`
            : "Resuming an unfinished round never counts."}
      </p>
      {usage.plan === "free" && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg bg-brand-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-body">
            <span className="font-semibold text-ink">Premium</span> doubles it to 10 a day
            and unlocks every course.
          </p>
          <Link
            href="/pricing"
            className={buttonClass({ size: "sm", variant: "soft", className: "shrink-0" })}
          >
            Upgrade
          </Link>
        </div>
      )}
    </Card>
  );
}

/** Round 1 → Round 2 path, unlock progress and the latest practice attempts. */
function ProgressCard({
  sessions,
  isLoading,
  latestRound1Score,
  round2Unlocked,
}: {
  sessions: InterviewSessionSummary[];
  isLoading: boolean;
  latestRound1Score: number | null;
  round2Unlocked: boolean;
}) {
  const unlockPercent =
    latestRound1Score === null
      ? 0
      : Math.min(100, Math.round((latestRound1Score / ROUND2_UNLOCK_SCORE) * 100));
  const recent = sessions.slice(0, 4);

  return (
    <Card
      title="Your progress"
      action={<PanelLink href="/candidate/interview/result">All results</PanelLink>}
    >
      <ol className="space-y-0">
        <li className="relative flex items-start gap-3 pb-5">
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-5 top-11 w-px bg-line"
          />
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              round2Unlocked
                ? "bg-brand-50 text-brand-600"
                : "bg-brand-50 text-brand-700"
            }`}
          >
            {round2Unlocked ? (
              <CircleCheck className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">Round 1 · Basic</p>
              <Badge
                tone={
                  round2Unlocked
                    ? "success"
                    : latestRound1Score === null
                      ? "neutral"
                      : "warning"
                }
              >
                {round2Unlocked
                  ? "Passed"
                  : latestRound1Score === null
                    ? "Not started"
                    : "Needs 50%"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {latestRound1Score === null
                ? "No completed round yet"
                : `Latest score ${latestRound1Score}%`}
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              round2Unlocked
                ? "bg-brand-50 text-brand-700"
                : "bg-surface-3 text-subtle"
            }`}
          >
            {round2Unlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">Round 2 · Technical</p>
              <Badge tone={round2Unlocked ? "brand" : "neutral"}>
                {round2Unlocked ? "Unlocked" : "Locked"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {round2Unlocked
                ? "Ready when you are"
                : `Unlocks at ${ROUND2_UNLOCK_SCORE}% in Round 1`}
            </p>
          </div>
        </li>
      </ol>

      <div className="mt-5 rounded-lg bg-surface-2 p-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-body">Unlock progress</span>
          <span className="tabular-nums text-muted">
            {latestRound1Score ?? 0}% of {ROUND2_UNLOCK_SCORE}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Progress towards unlocking Round 2"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={unlockPercent}
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3"
        >
          <div
            className={`h-full rounded-full ${round2Unlocked ? "bg-brand-500" : "bg-brand-600"}`}
            style={{ width: `${unlockPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Recent attempts
        </p>
        {isLoading ? (
          <LoadingBlock label="Loading attempts…" variant="skeleton" rows={2} />
        ) : recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No practice rounds yet — your scores will show up here.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-line-soft">
            {recent.map((attempt) => (
              <li
                key={attempt.sessionId}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {roundTrackLabel(attempt)}
                  </p>
                  <p className="text-xs tabular-nums text-muted">
                    {formatDate(attempt.createdAt)}
                  </p>
                </div>
                {attempt.status === "completed" &&
                typeof attempt.score === "number" ? (
                  <Badge tone={scoreTone(attempt.score)} className="tabular-nums">
                    {attempt.score}%
                  </Badge>
                ) : (
                  <span className={INTERVIEW_STATUS_BADGE[attempt.status]}>
                    {INTERVIEW_STATUS_LABELS[attempt.status]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function LockedCard({
  title,
  body,
  score,
  href,
  cta,
}: {
  title: string;
  body: React.ReactNode;
  /** Latest Round 1 score, or null when Round 1 hasn't been completed. */
  score: number | null;
  href: string;
  cta: string;
}) {
  const percent =
    score === null ? 0 : Math.min(100, Math.round((score / ROUND2_UNLOCK_SCORE) * 100));
  return (
    <section className="relative overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-100/60 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sidebar text-brand-300 shadow-lg"
        >
          <Lock className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
            {title}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">{body}</p>

          <div className="mt-5 max-w-md">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-body">Progress to unlock</span>
              <span className="tabular-nums text-muted">
                {score ?? 0}% of {ROUND2_UNLOCK_SCORE}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Progress towards unlocking Round 2"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3"
            >
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              href={href}
              size="lg"
              trailingIcon={<ArrowRight aria-hidden="true" />}
              className="w-full sm:w-auto"
            >
              {cta}
            </Button>
            {score !== null && (
              <Button
                href="/candidate/interview/result"
                variant="secondary"
                size="lg"
                leadingIcon={<ClipboardCheck aria-hidden="true" />}
                className="w-full sm:w-auto"
              >
                Review Round 1 report
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
