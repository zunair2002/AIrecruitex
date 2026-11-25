"use client";

import { useState } from "react";
import {
  CalendarClock,
  CalendarPlus,
  Copy,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Button, buttonClass } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { InlineError } from "@/components/ui/Feedback";
import { labelClass, textareaClass } from "@/components/ui/controls";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { cancelOrgInterviewInvite } from "@/lib/applicationsApi";
import {
  ORG_INTERVIEW_STATUS_BADGE,
  ORG_INTERVIEW_STATUS_LABELS,
  formatDateTime,
  isInviteExpired,
  timeUntil,
} from "@/lib/format";
import type {
  Application,
  ObjectId,
  OrgInterview,
  OrgInterviewViolationType,
} from "@/lib/types";

const VIOLATION_LABELS: Record<OrgInterviewViolationType, string> = {
  tab_hidden: "Switched tab",
  window_blur: "Left the window",
  fullscreen_exit: "Exited full screen",
  camera_off: "Camera off",
};

/**
 * The organisational-interview invite, as both HR and the candidate see it.
 *
 * It's no longer a booked slot: HR sends a token link valid for a window, and
 * the candidate takes it whenever they like inside that window. `joinLink` is
 * passed only on HR's side — the candidate gets theirs by email.
 *
 * On HR's side, passing `applicationId` adds a "Cancel invite" action for an
 * active invite (POST /:id/org-interview-invite/cancel); `onCancelled` receives
 * the updated application so the parent list can refresh its row.
 */
export function OrgInterviewPanel({
  orgInterview: orgInterviewProp,
  joinLink,
  audience,
  applicationId,
  onCancelled,
}: {
  orgInterview: OrgInterview;
  joinLink?: string;
  audience: "hr" | "candidate";
  applicationId?: ObjectId;
  onCancelled?: (application: Application) => void;
}) {
  const { token } = useAuth();
  // Holds the server's answer after a cancel, until the parent passes fresh data.
  const [cancelled, setCancelled] = useState<{
    from: OrgInterview;
    to: OrgInterview;
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const orgInterview =
    cancelled && cancelled.from === orgInterviewProp
      ? cancelled.to
      : orgInterviewProp;

  const status = orgInterview.status;
  if (!status) return null;

  // The backend sweeps expired invites on a schedule, so a still-"invited"
  // record can be past its window; treat that as expired in the UI.
  const expired =
    status === "expired" ||
    (status === "invited" && isInviteExpired(orgInterview.expiresAt));
  const effective = expired ? "expired" : status;
  const isCancelled = effective === "cancelled";

  const showCopy = Boolean(joinLink) && effective === "invited";
  const showCalendar =
    Boolean(orgInterview.calendarLink) && effective === "invited";
  const canCancel =
    audience === "hr" && Boolean(applicationId) && effective === "invited";
  const violations = orgInterview.violations ?? [];

  const handleCancel = async () => {
    if (!applicationId) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelOrgInterviewInvite(
        applicationId,
        { reason: reason.trim() || undefined },
        token,
      );
      setCancelled({
        from: orgInterviewProp,
        to: updated.orgInterview ?? {
          ...orgInterviewProp,
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
          cancelledBy: "hr",
        },
      });
      setConfirmOpen(false);
      setReason("");
      onCancelled?.(updated);
    } catch (err) {
      setCancelError(toErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        isCancelled
          ? "border-danger-200 bg-danger-50/60"
          : effective === "expired"
            ? "border-line bg-surface-2"
            : "border-brand-200 bg-brand-50/60"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <CalendarClock aria-hidden="true" className="h-4 w-4 text-muted" />
          Organisational interview
        </p>
        <span className={ORG_INTERVIEW_STATUS_BADGE[effective]}>
          {ORG_INTERVIEW_STATUS_LABELS[effective]}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
        {orgInterview.invitedAt && (
          <>
            <dt className="text-muted">Invited</dt>
            <dd className="text-body tabular-nums">
              {formatDateTime(orgInterview.invitedAt)}
            </dd>
          </>
        )}
        {orgInterview.expiresAt &&
          effective !== "completed" &&
          !isCancelled && (
            <>
              <dt className="text-muted">Valid until</dt>
              <dd className="text-body tabular-nums">
                {formatDateTime(orgInterview.expiresAt)}
                {!expired && (
                  <span className="ml-2 text-xs font-medium text-brand-600">
                    {timeUntil(orgInterview.expiresAt)}
                  </span>
                )}
              </dd>
            </>
          )}
        {orgInterview.startedAt && (
          <>
            <dt className="text-muted">Started</dt>
            <dd className="text-body tabular-nums">
              {formatDateTime(orgInterview.startedAt)}
            </dd>
          </>
        )}
        {orgInterview.completedAt && (
          <>
            <dt className="text-muted">Completed</dt>
            <dd className="text-body tabular-nums">
              {formatDateTime(orgInterview.completedAt)}
            </dd>
          </>
        )}
        {isCancelled && orgInterview.cancelledAt && (
          <>
            <dt className="text-muted">Cancelled</dt>
            <dd className="text-body tabular-nums">
              {formatDateTime(orgInterview.cancelledAt)}
              {orgInterview.cancelledBy && (
                <span className="ml-2 text-xs text-muted">
                  {orgInterview.cancelledBy === "hr"
                    ? "by the hiring team"
                    : "by proctoring"}
                </span>
              )}
            </dd>
          </>
        )}
        {isCancelled && orgInterview.cancelReason && (
          <>
            <dt className="text-muted">Reason</dt>
            <dd className="whitespace-pre-line break-words text-body">
              {orgInterview.cancelReason}
            </dd>
          </>
        )}
        {orgInterview.notes && (
          <>
            <dt className="text-muted">Notes</dt>
            <dd className="whitespace-pre-line break-words text-body">
              {orgInterview.notes}
            </dd>
          </>
        )}
      </dl>

      {audience === "hr" && violations.length > 0 && (
        <div className="mt-3 rounded-lg bg-warning-50 p-3 ring-1 ring-inset ring-warning-200">
          <p className="flex items-center gap-2 text-xs font-semibold text-warning-700">
            <ShieldAlert aria-hidden="true" className="h-4 w-4" />
            {violations.length} proctoring violation
            {violations.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-body">
            {violations.map((violation, index) => (
              <li
                key={`${violation.at}-${index}`}
                className="flex flex-wrap justify-between gap-x-3"
              >
                <span>
                  {VIOLATION_LABELS[violation.type] ?? violation.type}
                </span>
                <span className="tabular-nums text-muted">
                  {formatDateTime(violation.at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {audience === "candidate" && effective === "invited" && (
        <p className="mt-3 text-xs text-muted">
          Check your email for the interview link — it works without signing in.
        </p>
      )}

      {(showCopy || showCalendar || canCancel) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {showCopy && joinLink && (
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Copy />}
              onClick={() => navigator.clipboard?.writeText(joinLink)}
            >
              Copy candidate link
            </Button>
          )}
          {showCalendar && (
            <a
              href={orgInterview.calendarLink}
              target="_blank"
              rel="noreferrer"
              className={buttonClass({ variant: "secondary", size: "sm" })}
            >
              <CalendarPlus aria-hidden="true" />
              Add to calendar
            </a>
          )}
          {canCancel && (
            <Button
              variant="danger-soft"
              size="sm"
              leadingIcon={<XCircle aria-hidden="true" />}
              onClick={() => {
                setCancelError(null);
                setConfirmOpen(true);
              }}
            >
              Cancel invite
            </Button>
          )}
        </div>
      )}

      {canCancel && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleCancel}
          tone="danger"
          title="Cancel this interview invite?"
          description="The candidate's link stops working immediately and they're told by email that the invite was cancelled. You can invite them again later."
          confirmLabel={isCancelling ? "Cancelling…" : "Cancel invite"}
          cancelLabel="Keep invite"
          loading={isCancelling}
        >
          <div className="space-y-3">
            {cancelError && <InlineError message={cancelError} />}
            <div>
              <label htmlFor="cancel-invite-reason" className={labelClass}>
                Reason (optional, sent to the candidate)
              </label>
              <textarea
                id="cancel-invite-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                maxLength={300}
                className={`${textareaClass} resize-none`}
              />
            </div>
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
}
