"use client";

import { CalendarClock, CalendarPlus, Copy } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/Button";
import {
  ORG_INTERVIEW_STATUS_BADGE,
  ORG_INTERVIEW_STATUS_LABELS,
  formatDateTime,
  isInviteExpired,
  timeUntil,
} from "@/lib/format";
import type { OrgInterview } from "@/lib/types";

/**
 * The organisational-interview invite, as both HR and the candidate see it.
 *
 * It's no longer a booked slot: HR sends a token link valid for a window, and
 * the candidate takes it whenever they like inside that window. `joinLink` is
 * passed only on HR's side — the candidate gets theirs by email.
 */
export function OrgInterviewPanel({
  orgInterview,
  joinLink,
  audience,
}: {
  orgInterview: OrgInterview;
  joinLink?: string;
  audience: "hr" | "candidate";
}) {
  const status = orgInterview.status;
  if (!status) return null;

  // The backend sweeps expired invites on a schedule, so a still-"invited"
  // record can be past its window; treat that as expired in the UI.
  const expired =
    status === "expired" ||
    (status === "invited" && isInviteExpired(orgInterview.expiresAt));
  const effective = expired ? "expired" : status;

  const showCopy = Boolean(joinLink) && effective === "invited";
  const showCalendar =
    Boolean(orgInterview.calendarLink) && effective === "invited";

  return (
    <div
      className={`rounded-xl border p-4 ${
        effective === "completed"
          ? "border-brand-200 bg-brand-50/60"
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
        {orgInterview.expiresAt && effective !== "completed" && (
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
        {orgInterview.completedAt && (
          <>
            <dt className="text-muted">Completed</dt>
            <dd className="text-body tabular-nums">
              {formatDateTime(orgInterview.completedAt)}
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

      {audience === "candidate" && effective === "invited" && (
        <p className="mt-3 text-xs text-muted">
          Check your email for the interview link — it works without signing in.
        </p>
      )}

      {(showCopy || showCalendar) && (
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
        </div>
      )}
    </div>
  );
}
