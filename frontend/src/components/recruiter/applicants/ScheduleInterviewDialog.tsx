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
  dateTime: string;
  message?: string;
  location?: string;
  notes?: string;
};

/**
 * Collects exactly the fields each backend scheduling endpoint accepts:
 *   POST /:applicationId/ai-interview  -> { dateTime, message? }
 *   POST /:applicationId/org-interview -> { dateTime, location?, notes? }
 */
export function ScheduleInterviewDialog({
  kind,
  candidateName,
  jobTitle,
  onCancel,
  onSubmit,
}: {
  kind: ScheduleKind;
  candidateName: string;
  jobTitle: string;
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
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dateTime) {
      setError("Pick a date and time.");
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
          : {
              dateTime: fromDateTimeLocalValue(dateTime),
              location: location.trim() || undefined,
              notes: notes.trim() || undefined,
            },
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
          {kind === "ai" ? "Schedule AI interview" : "Schedule organisation interview"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {candidateName} · {jobTitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && <InlineError message={error} />}

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

          {kind === "ai" ? (
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
          ) : (
            <>
              <div>
                <label htmlFor="schedule-location" className={labelClass}>
                  Location
                </label>
                <input
                  id="schedule-location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. Head office, 3rd floor — or a meeting link"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="schedule-notes" className={labelClass}>
                  Notes
                </label>
                <textarea
                  id="schedule-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder="Anything the candidate should bring or prepare."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={isSaving} className={primaryButtonClass}>
              {isSaving ? "Scheduling…" : "Schedule"}
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
