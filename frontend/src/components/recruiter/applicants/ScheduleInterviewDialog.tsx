"use client";

import { useState } from "react";
import { toErrorMessage } from "@/lib/api";
import { toDateTimeLocalValue, fromDateTimeLocalValue } from "@/lib/format";
import { InlineError } from "@/components/ui/Feedback";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
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
 *   POST /:id/ai-interview        -> { dateTime, message? }   (a booked slot)
 *   POST /:id/org-interview-invite -> { validityDays? }        (an emailed link)
 *
 * The organisational interview is no longer a slot: the candidate receives a
 * token link and takes it whenever they like inside the validity window, so the
 * only thing to choose is how long that window is.
 */
export function ScheduleInterviewDialog({
  kind,
  candidateName,
  jobTitle,
  count,
  onCancel,
  onSubmit,
}: {
  kind: ScheduleKind;
  candidateName: string;
  jobTitle: string;
  /** Set when acting on several applicants at once. */
  count?: number;
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (kind === "ai" && !dateTime) {
      setError("Pick a date and time.");
      return;
    }
    if (kind === "org" && (!Number.isFinite(validityDays) || validityDays <= 0)) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900">
          {kind === "ai"
            ? "Schedule AI interview"
            : "Invite to organisational interview"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {count && count > 1
            ? `${count} applicants · ${jobTitle}`
            : `${candidateName} · ${jobTitle}`}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && <InlineError message={error} />}

          {kind === "ai" ? (
            <>
              <div>
                <label htmlFor="schedule-datetime" className={labelClass}>
                  Date &amp; time <span className="text-red-500">*</span>
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
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Scheduling creates the candidate&apos;s interview session and a
                  30-minute Google Calendar link.
                </p>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="schedule-validity" className={labelClass}>
                Link valid for <span className="text-red-500">*</span>
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                {VALIDITY_PRESETS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setValidityDays(days)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                      validityDays === days
                        ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {days} day{days === 1 ? "" : "s"}
                  </button>
                ))}
              </div>
              <input
                id="schedule-validity"
                type="number"
                min={1}
                max={60}
                value={validityDays}
                onChange={(event) => setValidityDays(Number(event.target.value))}
                className={inputClass}
                required
              />
              <p className="mt-2 text-xs text-gray-400">
                The candidate is emailed a private link and can take the interview
                any time inside this window. Questions come from the job&apos;s
                question pool, drawn at random per candidate.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={isSaving} className={primaryButtonClass}>
              {isSaving
                ? kind === "ai"
                  ? "Scheduling…"
                  : "Sending invite…"
                : kind === "ai"
                  ? "Schedule"
                  : "Send invite"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
