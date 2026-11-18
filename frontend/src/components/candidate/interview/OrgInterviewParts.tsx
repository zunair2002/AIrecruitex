"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  AlertTriangle,
  Ban,
  Camera as CameraIcon,
  CameraOff,
  CircleCheck,
  Maximize,
  RefreshCw,
} from "lucide-react";
import type { OrgInterviewInvite, OrgInterviewViolationType } from "@/lib/types";
import {
  formatDateTime,
  ORG_INTERVIEW_STATUS_BADGE,
  ORG_INTERVIEW_STATUS_LABELS,
} from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Feedback";
import { BrandWordmark } from "@/components/layout/Logo";
import { VIOLATION_LABELS, type Camera } from "./orgProctoring";

export const ORG_CARD = "rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-7";

/** Standalone chrome for the intro / summary screens (outside the portal shell). */
export function OrgShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <main id="main-content" className="flex min-h-dvh flex-col bg-canvas px-4 py-8 sm:py-12">
      <div className={`mx-auto w-full flex-1 ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
        <div className="mb-8 flex justify-center sm:mb-10">
          <BrandWordmark className="text-2xl" />
        </div>
        {children}
      </div>
      <p className="mt-10 text-center text-xs text-muted">
        Secure, proctored interview link · Powered by AiRecruitex
      </p>
    </main>
  );
}

/** A mirrored, muted live <video> bound to a MediaStream. */
export function CameraView({
  stream,
  className = "",
}: {
  stream: MediaStream | null;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) void video.play().catch(() => undefined);
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      playsInline
      aria-label="Your camera preview"
      className={`-scale-x-100 bg-ink object-cover ${className}`}
    />
  );
}

/** Intro-screen camera check: live preview, permission state and a retry. */
export function CameraCheckCard({ camera }: { camera: Camera }) {
  const { state, stream, error, start } = camera;
  const isOn = state === "on";

  return (
    <section aria-labelledby="camera-check-title" className={ORG_CARD}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="camera-check-title" className="font-display text-base font-semibold text-ink">
          Camera check
        </h2>
        {isOn ? (
          <Badge tone="success" dot>
            Camera on
          </Badge>
        ) : state === "requesting" ? (
          <Badge tone="info">Waiting for permission…</Badge>
        ) : state === "idle" ? (
          <Badge tone="neutral">Not started</Badge>
        ) : (
          <Badge tone="danger" dot>
            {state === "denied" ? "Permission blocked" : "Camera off"}
          </Badge>
        )}
      </div>

      <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-lg bg-surface-3 ring-1 ring-inset ring-line">
        {isOn ? (
          <CameraView stream={stream} className="h-full w-full" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            {state === "requesting" ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted ring-1 ring-inset ring-line"
              >
                {state === "idle" ? <CameraIcon className="h-6 w-6" /> : <CameraOff className="h-6 w-6" />}
              </span>
            )}
            <p className="max-w-xs text-sm text-muted">
              {state === "requesting"
                ? "Allow camera access in the browser prompt."
                : (error ?? "Turn on your camera so we can confirm it works before you begin.")}
            </p>
          </div>
        )}
        {isOn && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" aria-hidden="true" />
            Live preview
          </span>
        )}
      </div>

      {isOn ? (
        <p className="mt-3 text-sm text-muted">
          Make sure your face is clearly visible and well lit.
        </p>
      ) : (
        <Button
          variant="secondary"
          fullWidth
          className="mt-4"
          onClick={() => void start()}
          loading={state === "requesting"}
          disabled={state === "requesting"}
          leadingIcon={state === "idle" ? <CameraIcon aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
        >
          {state === "idle" ? "Turn on camera" : "Try again"}
        </Button>
      )}
    </section>
  );
}

/** Small live thumbnail + "Proctoring on" indicator for the interview header. */
export function ProctoringThumb({ camera }: { camera: Camera }) {
  const isOn = camera.state === "on";
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            isOn ? "text-success-700" : "text-danger-700"
          }`}
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            {isOn && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-60 motion-reduce:hidden" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${isOn ? "bg-success-500" : "bg-danger-500"}`}
            />
          </span>
          {isOn ? "Proctoring on" : "Camera off"}
        </p>
        <p className="text-[11px] text-muted">Camera &amp; tab activity</p>
      </div>
      <div
        className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md ring-2 ${
          isOn ? "ring-success-200" : "ring-danger-200"
        } bg-surface-3`}
        role="img"
        aria-label={isOn ? "Proctoring on — camera live" : "Camera off"}
      >
        {isOn ? (
          <CameraView stream={camera.stream} className="h-full w-full" />
        ) : (
          <span className="flex h-full items-center justify-center text-danger-600">
            <CameraOff className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}

export type ViolationNotice = {
  type: OrgInterviewViolationType;
  count: number;
  max: number;
};

/**
 * "Warning n of 2" — blocks the interview until acknowledged. When the camera
 * is off or full screen was left, the primary action restores it first.
 */
export function ViolationDialog({
  notice,
  camera,
  needsFullscreen,
  onReturnToFullscreen,
  onAcknowledge,
}: {
  notice: ViolationNotice | null;
  camera: Camera;
  needsFullscreen: boolean;
  onReturnToFullscreen: () => void;
  onAcknowledge: () => void;
}) {
  const warnings = notice ? Math.max(1, notice.max - 1) : 2;
  const cameraOff = camera.state !== "on";

  return (
    <Dialog
      open={Boolean(notice)}
      onClose={onAcknowledge}
      dismissible={false}
      hideCloseButton
      size="sm"
      title={
        <span className="inline-flex items-center gap-2 text-warning-700">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          Warning {notice?.count ?? 1} of {warnings}
        </span>
      }
      footer={
        cameraOff ? (
          <Button
            onClick={() => void camera.start()}
            loading={camera.state === "requesting"}
            leadingIcon={<CameraIcon aria-hidden="true" />}
          >
            Turn camera back on
          </Button>
        ) : needsFullscreen ? (
          <Button onClick={onReturnToFullscreen} leadingIcon={<Maximize aria-hidden="true" />}>
            Return to full screen
          </Button>
        ) : (
          <Button onClick={onAcknowledge}>I understand, continue</Button>
        )
      }
    >
      {notice && (
        <div className="space-y-3 text-sm leading-6 text-body">
          <p className="font-medium text-ink">{VIOLATION_LABELS[notice.type]}</p>
          <p>
            This interview is proctored. Stay on this page with your camera on until you
            finish.{" "}
            {notice.count >= warnings ? (
              <strong className="text-danger-700">
                This is your final warning — one more violation cancels the interview.
              </strong>
            ) : (
              <>
                After {warnings} warnings, the next violation{" "}
                <strong className="text-ink">cancels the interview automatically</strong>.
              </>
            )}
          </p>
          {cameraOff && camera.error && <p className="text-danger-700">{camera.error}</p>}
        </div>
      )}
    </Dialog>
  );
}

/**
 * The only thing a candidate sees once the interview is over: its status and
 * when it was invited / started / finished. No questions, answers or scores.
 */
export function OrgInterviewSummary({
  invite,
  status,
}: {
  invite: OrgInterviewInvite;
  status: "completed" | "cancelled";
}) {
  const isCancelled = status === "cancelled";
  const finishedAt = isCancelled ? invite.cancelledAt : invite.completedAt;

  const rows: { label: string; value?: string; fallback: string }[] = [
    { label: "Invited", value: invite.invitedAt, fallback: "—" },
    { label: "Started", value: invite.startedAt, fallback: "—" },
    // The invite is re-fetched right after finishing; until it lands, it was just now.
    { label: isCancelled ? "Cancelled" : "Completed", value: finishedAt, fallback: "Just now" },
  ];

  return (
    <OrgShell>
      <section className={`${ORG_CARD} text-center`}>
        <span
          aria-hidden="true"
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            isCancelled ? "bg-danger-50 text-danger-600" : "bg-success-50 text-success-600"
          }`}
        >
          {isCancelled ? <Ban className="h-7 w-7" /> : <CircleCheck className="h-7 w-7" />}
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          {isCancelled ? "Interview cancelled" : "Interview submitted"}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
          {isCancelled ? (
            <>
              Your interview for{" "}
              <span className="font-semibold text-ink">{invite.jobTitle ?? "this role"}</span> was
              ended early and no further answers can be submitted. The hiring team has been
              notified.
            </>
          ) : (
            <>
              Thank you{invite.candidateName ? `, ${invite.candidateName}` : ""}. Your interview for{" "}
              <span className="font-semibold text-ink">{invite.jobTitle ?? "this role"}</span> has
              been sent to the hiring team. They review it privately and will be in touch about
              next steps.
            </>
          )}
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-lg border border-line-soft bg-surface-2 p-4 text-left">
          <div className="flex items-center justify-between gap-3 border-b border-line-soft pb-3">
            <span className="text-sm font-medium text-body">Status</span>
            <span className={ORG_INTERVIEW_STATUS_BADGE[status]}>
              {ORG_INTERVIEW_STATUS_LABELS[status]}
            </span>
          </div>
          <dl className="mt-3 space-y-2">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-muted">{row.label}</dt>
                <dd className="font-medium tabular-nums text-ink">
                  {row.value ? formatDateTime(row.value) : row.fallback}
                </dd>
              </div>
            ))}
          </dl>
          {isCancelled && invite.cancelReason && (
            <p className="mt-3 border-t border-line-soft pt-3 text-xs leading-5 text-muted">
              Reason: {invite.cancelReason}
            </p>
          )}
        </div>
        <p className="mt-6 text-xs text-muted">You can close this window.</p>
      </section>
    </OrgShell>
  );
}
