"use client";

import { useState } from "react";
import { CalendarClock, Info, ListChecks, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { getQuestionSet } from "@/lib/jobsApi";
import { useApiResource } from "@/lib/useApiResource";
import type { ObjectId } from "@/lib/types";
import { toDateTimeLocalValue, fromDateTimeLocalValue } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { InlineError } from "@/components/ui/Feedback";
import {
  helpTextClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/ui/controls";

export type ScheduleKind = "ai" | "org";

export type SchedulePayload = {
  /** AI interview only — a fixed slot. */
  dateTime?: string;
  message?: string;
  /** Org interview only — how long the emailed invite link stays usable. */
  validityDays?: number;
};

const VALIDITY_PRESETS = [1, 2, 3, 7];

/**
 * Collects exactly what each backend endpoint accepts:
 * POST /:id/ai-interview -> { dateTime, message? } (a booked slot)
 * POST /:id/org-interview-invite -> { validityDays? } (an emailed link)
 *
 * The organisational interview is no longer a slot: the candidate receives a
 * token link and takes it whenever they like inside the validity window, so the
 * only thing to choose is how long that window is.
 *
 * Its questions come from the job's question pool, so when `jobId` is passed
 * an org invite is blocked (with a link to upload one) until the pool exists —
 * the backend enforces the same rule with a 409.
 */
export function ScheduleInterviewDialog({
  kind,
  candidateName,
  jobTitle,
  count,
  jobId,
  onCancel,
  onSubmit,
}: {
  kind: ScheduleKind;
  candidateName: string;
  jobTitle: string;
  /** Set when acting on several applicants at once. */
  count?: number;
  /** Org invites: checks the job's question pool before allowing the invite. */
  jobId?: ObjectId;
  onCancel: () => void;
  onSubmit: (payload: SchedulePayload) => Promise<void>;
}) {
  const [dateTime, setDateTime] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(0, 0, 0);
    return toDateTimeLocalValue(tomorrow);
  });
  const [message, setMessage] = useState("");
  const [validityDays, setValidityDays] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { token } = useAuth();
  const checkPool = kind === "org" && Boolean(jobId);
  const pool = useApiResource(
    (signal) => getQuestionSet(jobId as ObjectId, token, signal),
    [jobId, token],
    { enabled: checkPool && Boolean(token) },
  );
  const poolSize = pool.data?.questions?.length ?? 0;
  // Only block once we know for sure there's no pool; a failed check falls
  // through to the backend, which enforces the same rule.
  const missingPool =
    checkPool && !pool.isLoading && !pool.error && poolSize === 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (kind === "ai" && !dateTime) {
      setError("Pick a date and time.");
      return;
    }
    if (
      kind === "org" &&
      (!Number.isFinite(validityDays) || validityDays <= 0)
    ) {
      setError("Validity must be a positive number of days.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(
        kind === "ai"
          ? {
              dateTime: fromDateTimeLocalValue(dateTime),
              message: message.trim() || undefined,
            }
          : { validityDays },
      );
    } catch (err) {
      setError(toErrorMessage(err));
      setIsSaving(false);
    }
  };

  const isBulk = Boolean(count && count > 1);

  return (
    <Dialog
      open
      onClose={onCancel}
      dismissible={!isSaving}
      onSubmit={handleSubmit}
      title={
        kind === "ai"
          ? isBulk
            ? "Trigger AI interviews"
            : "Schedule AI interview"
          : "Invite to organisational interview"
      }
      description={
        isBulk
          ? `${count} applicants · ${jobTitle}`
          : `${candidateName} · ${jobTitle}`
      }
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSaving}
            disabled={missingPool || (checkPool && pool.isLoading)}
            leadingIcon={
              kind === "ai" ? (
                <CalendarClock aria-hidden="true" />
              ) : (
                <Send aria-hidden="true" />
              )
            }
          >
            {isSaving
              ? kind === "ai"
                ? "Scheduling…"
                : "Sending invite…"
              : kind === "ai"
                ? "Schedule"
                : "Send invite"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <InlineError message={error} />}

        {missingPool && jobId && (
          <div className="flex flex-col gap-3 rounded-lg bg-warning-50 p-3 text-sm text-warning-700 ring-1 ring-inset ring-warning-200 sm:flex-row sm:items-center sm:justify-between">
            <p>
              This job has no question pool yet. Upload the interview questions
              file before inviting candidates.
            </p>
            <Button
              variant="secondary"
              size="sm"
              href={`/recruiter/jobs/${jobId}/questions`}
              leadingIcon={<ListChecks aria-hidden="true" />}
              className="shrink-0"
            >
              Upload question pool
            </Button>
          </div>
        )}

        {kind === "ai" ? (
          <>
            <div>
              <label htmlFor="schedule-datetime" className={labelClass}>
                Date &amp; time <span className="text-rose-600">*</span>
              </label>
              <input
                id="schedule-datetime"
                type="datetime-local"
                value={dateTime}
                onChange={(event) => setDateTime(event.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="schedule-message" className={labelClass}>
                Message to candidate
              </label>
              <textarea
                id="schedule-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="Shown to the candidate and used as the calendar event description."
                className={`${textareaClass} resize-none`}
              />
            </div>
            <p className="flex items-start gap-2 rounded-lg bg-surface-2 px-3 py-2.5 text-xs text-muted ring-1 ring-inset ring-line-soft">
              <Info aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-subtle" />
              <span>
                Scheduling creates the candidate&apos;s interview session and a
                30-minute Google Calendar link.
              </span>
            </p>
          </>
        ) : (
          <div>
            <label htmlFor="schedule-validity" className={labelClass}>
              Link valid for <span className="text-rose-600">*</span>
            </label>
            <div
              role="group"
              aria-label="Validity presets"
              className="mb-3 grid grid-cols-4 gap-2"
            >
              {VALIDITY_PRESETS.map((days) => {
                const isActive = validityDays === days;
                return (
                  <button
                    key={days}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setValidityDays(days)}
                    className={`h-10 rounded-lg border px-2 text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? "border-brand-300 bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20"
                        : "border-line bg-white text-body shadow-xs hover:bg-surface-2"
                    }`}
                  >
                    {days} day{days === 1 ? "" : "s"}
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <input
                id="schedule-validity"
                type="number"
                min={1}
                max={60}
                value={validityDays}
                onChange={(event) =>
                  setValidityDays(Number(event.target.value))
                }
                className={`${inputClass} pr-14 tabular-nums`}
                required
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted"
              >
                days
              </span>
            </div>
            <p className={helpTextClass}>
              The candidate is emailed a private link and can take the
              interview any time inside this window. Questions come from the
              job&apos;s question pool, drawn at random per candidate
              {poolSize > 0
                ? ` (${pool.data?.questionsPerInterview || poolSize} of ${poolSize}).`
                : "."}
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
