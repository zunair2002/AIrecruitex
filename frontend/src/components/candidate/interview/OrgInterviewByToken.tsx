"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { apiErrorStatus, toErrorMessage } from "@/lib/api";
import {
  getOrgInterviewInvite,
  reportOrgInterviewViolation,
  startOrgInterviewByToken,
  submitOrgInterviewAnswerByToken,
} from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDateTime, timeUntil } from "@/lib/format";
import {
  isFinishedSession,
  type InterviewSessionView,
  type OrgInterviewInvite,
  type OrgInterviewViolationType,
} from "@/lib/types";
import {
  AppWindow,
  Camera as CameraIcon,
  CalendarClock,
  CameraOff,
  ListChecks,
  MessageSquareText,
  Play,
  Send,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorBlock, InlineError, LoadingBlock } from "@/components/ui/Feedback";
import { BrandWordmark } from "@/components/layout/Logo";
import { VoiceAnswerField, useVoiceAnswer } from "./VoiceAnswer";
import { InterviewTimer, timerKey } from "./InterviewTimer";
import { QuestionCard, TimeUpNotice } from "./RunnerParts";
import {
  CameraCheckCard,
  ORG_CARD,
  OrgInterviewSummary,
  OrgShell,
  ProctoringThumb,
  ViolationDialog,
  type ViolationNotice,
} from "./OrgInterviewParts";
import {
  enterFullscreen,
  exitFullscreen,
  useCamera,
  useProctoringEvents,
  type Camera,
} from "./orgProctoring";

const DEFAULT_MAX_VIOLATIONS = 3;

/**
 * The organisational interview, opened from the emailed link.
 *
 * Authenticated by the `token` query parameter rather than a session — the
 * candidate may well open this on a device where they've never signed in, so
 * this page sits outside the candidate portal's auth gate.
 *
 * Three steps: intro (rules + camera check) → proctored interview → summary.
 * Proctoring: the webcam must stay on, and leaving the tab/window/full screen
 * is reported to the backend, which warns twice and cancels on the third.
 * Results are hidden by design — once finished the candidate only ever sees a
 * status summary; questions, answers and scores are for HR.
 */
export function OrgInterviewByToken() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const invite = useApiResource(
    (signal) => getOrgInterviewInvite(token, signal),
    [token],
    { enabled: Boolean(token) },
  );
  const reloadInvite = invite.reload;

  const [session, setSession] = useState<InterviewSessionView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [notice, setNotice] = useState<ViolationNotice | null>(null);
  const [violationCount, setViolationCount] = useState<number | null>(null);
  const [fullscreenEntered, setFullscreenEntered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const data = invite.data;
  const sessionFinished = Boolean(session && isFinishedSession(session));
  const inviteStatus = data?.status;
  const ended =
    cancelled ||
    sessionFinished ||
    Boolean(session?.status === "in_progress" && session.cancelled) ||
    inviteStatus === "completed" ||
    inviteStatus === "cancelled";
  const inProgress = session?.status === "in_progress" ? session : null;
  const proctoringActive = Boolean(inProgress) && !ended && !hasTimedOut;
  const maxViolations = data?.maxViolations ?? DEFAULT_MAX_VIOLATIONS;
  const violations = violationCount ?? data?.violationCount ?? 0;

  // The camera dropping out mid-interview is a violation too.
  const camera = useCamera({
    onLost: () => {
      if (proctoringActive) void handleViolation("camera_off");
    },
  });

  const answer = useVoiceAnswer(proctoringActive ? inProgress?.question : undefined);

  /* ------------------------------------------------------------ proctoring */

  async function handleViolation(type: OrgInterviewViolationType) {
    try {
      const result = await reportOrgInterviewViolation(token, type);
      setViolationCount(result.violationCount);
      if (result.cancelled) {
        setNotice(null);
        setCancelled(true);
        return;
      }
      setNotice({ type, count: result.violationCount, max: result.maxViolations });
    } catch (err) {
      // 409: no longer active (cancelled/completed elsewhere) — show the summary.
      if (apiErrorStatus(err) === 409) {
        reloadInvite();
        return;
      }
      // Network trouble: still warn locally; the server stays the judge.
      const count = Math.min(violations + 1, maxViolations - 1);
      setViolationCount(count);
      setNotice({ type, count, max: maxViolations });
    }
  }

  useProctoringEvents({
    active: proctoringActive,
    fullscreenEntered,
    onViolation: (type) => void handleViolation(type),
  });

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Finished or cancelled: release the camera and full screen, and refresh the
  // invite so the summary carries the server's timestamps.
  const releaseAndRefresh = useEffectEvent(() => {
    camera.stop();
    exitFullscreen();
    reloadInvite();
  });
  useEffect(() => {
    if (cancelled || sessionFinished) releaseAndRefresh();
  }, [cancelled, sessionFinished]);

  /* ---------------------------------------------------------------- timer */

  /**
   * The countdown hit zero. The backend refuses an empty answer and sweeps
   * expired sessions itself, so stop accepting answers and wait for the
   * server's verdict rather than trying to end it here.
   */
  const handleExpire = () => setHasTimedOut(true);

  useEffect(() => {
    if (!hasTimedOut) return;
    let stopped = false;

    const poll = async () => {
      try {
        const next = await startOrgInterviewByToken(token);
        if (!stopped && isFinishedSession(next)) setSession(next);
      } catch {
        // Transient — try again on the next tick.
      }
    };

    void poll();
    const id = window.setInterval(poll, 5000);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [hasTimedOut, token]);

  /* -------------------------------------------------------------- actions */

  const handleStart = async () => {
    if (camera.state !== "on") return;
    setIsBusy(true);
    setError(null);
    // Full screen needs the click's user activation, so request it first.
    const fullscreen = await enterFullscreen();
    setFullscreenEntered(fullscreen);
    try {
      setSession(await startOrgInterviewByToken(token));
    } catch (err) {
      exitFullscreen();
      setFullscreenEntered(false);
      const status = apiErrorStatus(err);
      if (status === 409 || status === 410) reloadInvite();
      setError(toErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = async () => {
    const text = answer.takeAnswer();
    if (!text) return;
    setIsBusy(true);
    setError(null);
    try {
      setSession(await submitOrgInterviewAnswerByToken(token, text));
      answer.reset();
    } catch (err) {
      if (apiErrorStatus(err) === 409) reloadInvite();
      setError(toErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleReturnToFullscreen = async () => {
    if (await enterFullscreen()) setNotice(null);
  };

  /* --------------------------------------------------------------- render */

  if (!token) {
    return (
      <OrgShell>
        <EmptyState
          title="This link is missing its interview token."
          description="Open the interview from the link in your invitation email."
        />
      </OrgShell>
    );
  }

  if (!data) {
    if (invite.error) {
      return (
        <OrgShell>
          <ErrorBlock message={invite.error} onRetry={invite.reload} />
          <p className="mt-4 text-center text-sm text-muted">
            Invitation links expire. If yours has, ask the hiring team to send a new one.
          </p>
        </OrgShell>
      );
    }
    return (
      <OrgShell>
        <div className={ORG_CARD}>
          <LoadingBlock label="Checking your invitation…" />
        </div>
      </OrgShell>
    );
  }

  if (ended) {
    const status = cancelled || inviteStatus === "cancelled" || inProgress?.cancelled
      ? "cancelled"
      : "completed";
    return <OrgInterviewSummary invite={data} status={status} />;
  }

  if (inProgress) {
    return (
      <InterviewScreen
        invite={data}
        session={inProgress}
        camera={camera}
        answer={answer}
        error={error}
        isBusy={isBusy}
        hasTimedOut={hasTimedOut}
        violations={violations}
        maxViolations={maxViolations}
        onExpire={handleExpire}
        onSubmit={handleSubmit}
        dialog={
          <ViolationDialog
            notice={notice}
            camera={camera}
            needsFullscreen={fullscreenEntered && !isFullscreen}
            onReturnToFullscreen={() => void handleReturnToFullscreen()}
            onAcknowledge={() => setNotice(null)}
          />
        }
      />
    );
  }

  return (
    <IntroScreen
      invite={data}
      camera={camera}
      error={error}
      isBusy={isBusy}
      onStart={() => void handleStart()}
    />
  );
}

/* ------------------------------------------------------------------ intro */

const RULES: { icon: typeof CameraIcon; title: string; detail: string }[] = [
  {
    icon: CameraIcon,
    title: "Camera on throughout",
    detail: "Keep your face visible. If the camera turns off, the interview pauses until it's back.",
  },
  {
    icon: AppWindow,
    title: "Stay on this page",
    detail: "Switching tabs, windows or apps, or leaving full screen, counts as a violation.",
  },
  {
    icon: ShieldAlert,
    title: "Two warnings, then cancelled",
    detail: "The first two violations show a warning. The third cancels the interview automatically.",
  },
  {
    icon: MessageSquareText,
    title: "One question at a time",
    detail: "Type or dictate each answer. You can't go back, and answers are reviewed by the hiring team.",
  },
];

function IntroScreen({
  invite,
  camera,
  error,
  isBusy,
  onStart,
}: {
  invite: OrgInterviewInvite;
  camera: Camera;
  error: string | null;
  isBusy: boolean;
  onStart: () => void;
}) {
  const cameraReady = camera.state === "on";

  return (
    <OrgShell wide>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className={ORG_CARD}>
          <Badge tone="info" dot>
            Proctored interview
          </Badge>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {invite.jobTitle ?? "Your interview"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
            Hello {invite.candidateName ?? "there"}. The hiring team has invited you to a short,
            AI-conducted interview for this role. Take it whenever you&apos;re ready before the
            deadline.
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-line-soft bg-surface-2 p-4">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"
              >
                <CalendarClock className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-muted">Complete by</dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                  {formatDateTime(invite.expiresAt)}
                </dd>
                <dd className="text-xs font-medium text-brand-600">{timeUntil(invite.expiresAt)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-line-soft bg-surface-2 p-4">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"
              >
                <ListChecks className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-muted">Format</dt>
                <dd className="mt-0.5 text-sm text-body">
                  Written or spoken answers, in one sitting. No score is shown to you.
                </dd>
              </div>
            </div>
          </dl>

          <h2 className="mt-8 font-display text-base font-semibold text-ink">Before you begin</h2>
          <ul className="mt-3 space-y-3">
            {RULES.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-3 text-body"
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-ink">{title}</p>
                  <p className="text-muted">{detail}</p>
                </div>
              </li>
            ))}
          </ul>

          {error && (
            <div className="mt-6">
              <InlineError message={error} />
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-line-soft pt-6 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={onStart}
              disabled={!cameraReady || isBusy}
              loading={isBusy}
              leadingIcon={<Play aria-hidden="true" />}
              className="w-full sm:w-auto"
            >
              {isBusy
                ? "Starting…"
                : invite.started
                  ? "I agree, resume interview"
                  : "I agree, start interview"}
            </Button>
            <p className="text-xs leading-5 text-muted">
              {cameraReady
                ? "The interview opens in full screen. By starting, you agree to camera and activity monitoring."
                : "Turn on your camera to continue."}
            </p>
          </div>
        </section>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <CameraCheckCard camera={camera} />
        </div>
      </div>
    </OrgShell>
  );
}

/* -------------------------------------------------------------- interview */

function InterviewScreen({
  invite,
  session,
  camera,
  answer,
  error,
  isBusy,
  hasTimedOut,
  violations,
  maxViolations,
  onExpire,
  onSubmit,
  dialog,
}: {
  invite: OrgInterviewInvite;
  session: Extract<InterviewSessionView, { status: "in_progress" }>;
  camera: Camera;
  answer: ReturnType<typeof useVoiceAnswer>;
  error: string | null;
  isBusy: boolean;
  hasTimedOut: boolean;
  violations: number;
  maxViolations: number;
  onExpire: () => void;
  onSubmit: () => void;
  dialog: React.ReactNode;
}) {
  const answered = session.turns.length;
  const questionNumber = session.questionNumber ?? answered + 1;
  const total = session.totalQuestions;
  const percent = total ? Math.min(100, Math.round((answered / total) * 100)) : 0;
  const cameraOn = camera.state === "on";
  const warnings = maxViolations - 1;
  const locked = isBusy || hasTimedOut || !cameraOn;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <BrandWordmark className="hidden text-lg sm:inline-flex" />
          <span aria-hidden="true" className="hidden h-8 w-px bg-line sm:block" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{invite.jobTitle ?? "Interview"}</p>
            <p className="text-xs tabular-nums text-muted">
              Question {questionNumber}
              {total ? ` of ${total}` : ""}
              {answer.voice.speaking && " · reading aloud…"}
            </p>
          </div>
          {violations > 0 && (
            <Badge tone={violations >= warnings ? "danger" : "warning"} className="hidden sm:inline-flex">
              Warnings {Math.min(violations, warnings)}/{warnings}
            </Badge>
          )}
          <InterviewTimer key={timerKey(session)} session={session} onExpire={onExpire} />
          <ProctoringThumb camera={camera} />
        </div>
        <div
          role="progressbar"
          aria-label="Interview progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-1 bg-surface-3"
        >
          <div
            className="h-full bg-brand-600 transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 space-y-5 px-4 py-6 sm:py-10">
        {!cameraOn && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-danger-200 bg-danger-50 p-4 sm:flex-row sm:items-center"
          >
            <CameraOff className="h-5 w-5 shrink-0 text-danger-600" aria-hidden="true" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-danger-700">Your camera is off</p>
              <p className="text-danger-700/90">
                {camera.error ?? "Turn it back on to keep answering."}
              </p>
            </div>
            <Button
              size="sm"
              variant="danger"
              onClick={() => void camera.start()}
              loading={camera.state === "requesting"}
            >
              Turn camera on
            </Button>
          </div>
        )}

        {hasTimedOut && (
          <TimeUpNotice
            title="Time's up — closing your interview."
            detail="Whatever you answered has been sent to the hiring team."
          />
        )}

        <QuestionCard
          eyebrow={`Question ${questionNumber}${total ? ` of ${total}` : ""}`}
          badge={`Q${questionNumber}`}
          question={session.question ?? "Preparing the next question…"}
        />

        <section aria-label="Your answer" className={ORG_CARD}>
          <VoiceAnswerField id="org-answer" label="Your answer" answer={answer} disabled={locked} />
          {error && (
            <div className="mt-4">
              <InlineError message={error} />
            </div>
          )}
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              Answers can&apos;t be changed after you submit.
            </p>
            <Button
              size="lg"
              onClick={onSubmit}
              disabled={!answer.value.trim() || locked}
              loading={isBusy}
              leadingIcon={<Send aria-hidden="true" />}
              className="w-full sm:w-auto"
            >
              {isBusy
                ? "Submitting…"
                : total && questionNumber >= total
                  ? "Submit & finish"
                  : "Submit answer"}
            </Button>
          </div>
        </section>
      </main>

      {dialog}
    </div>
  );
}
