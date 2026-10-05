"use client";

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
  const expired = status === "expired" || (status === "invited" && isInviteExpired(orgInterview.expiresAt));
  const effective = expired ? "expired" : status;

  return (
    <div
      className={`rounded-xl border p-4 ${
        effective === "completed"
          ? "border-emerald-100 bg-emerald-50"
          : effective === "expired"
            ? "border-gray-200 bg-gray-50"
            : "border-amber-100 bg-amber-50"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
          Organisational interview
        </p>
        <span className={ORG_INTERVIEW_STATUS_BADGE[effective]}>
          {ORG_INTERVIEW_STATUS_LABELS[effective]}
        </span>
      </div>

      <dl className="mt-2 space-y-1 text-sm text-gray-700">
        {orgInterview.invitedAt && (
          <div className="flex gap-2">
            <dt className="text-gray-500">Invited</dt>
            <dd>{formatDateTime(orgInterview.invitedAt)}</dd>
          </div>
        )}
        {orgInterview.expiresAt && effective !== "completed" && (
          <div className="flex gap-2">
            <dt className="text-gray-500">Valid until</dt>
            <dd>
              {formatDateTime(orgInterview.expiresAt)}
              {!expired && (
                <span className="ml-2 text-xs font-semibold text-amber-700">
                  {timeUntil(orgInterview.expiresAt)}
                </span>
              )}
            </dd>
          </div>
        )}
        {orgInterview.completedAt && (
          <div className="flex gap-2">
            <dt className="text-gray-500">Completed</dt>
            <dd>{formatDateTime(orgInterview.completedAt)}</dd>
          </div>
        )}
        {orgInterview.notes && (
          <div className="flex gap-2">
            <dt className="text-gray-500">Notes</dt>
            <dd className="whitespace-pre-line">{orgInterview.notes}</dd>
          </div>
        )}
      </dl>

      {audience === "candidate" && effective === "invited" && (
        <p className="mt-3 text-xs text-gray-600">
          Check your email for the interview link — it works without signing in.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-3">
        {joinLink && effective === "invited" && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(joinLink)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Copy candidate link
          </button>
        )}
        {orgInterview.calendarLink && effective === "invited" && (
          <a
            href={orgInterview.calendarLink}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Add to calendar
          </a>
        )}
      </div>
    </div>
  );
}
