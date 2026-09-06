"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { createSupportTicket } from "@/lib/supportApi";
import { SUPPORT_STATUS_BADGE, SUPPORT_STATUS_LABELS, formatDateTime } from "@/lib/format";
import type { SupportTicket } from "@/lib/types";
import {
  Card,
  InlineError,
  InlineSuccess,
  PageHeader,
} from "@/components/ui/Feedback";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/controls";

/**
 * POST /api/support/tickets. The backend has no "list my tickets" route, so
 * tickets raised in this session are shown back here after they're created;
 * the admin's reply arrives as a notification.
 */
export function SupportForm() {
  const { token } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState<SupportTicket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const ticket = await createSupportTicket(
        { subject: subject.trim(), message: message.trim() },
        token,
      );
      setSubmitted((current) => [ticket, ...current]);
      setSubject("");
      setMessage("");
      setSuccess("Ticket submitted. You'll be notified when an admin replies.");
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = subject.trim().length > 0 && message.trim().length > 0;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Support"
          description="Raise a ticket with the platform admins. Replies arrive in your notifications."
        />

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <InlineError message={error} />}
            {success && <InlineSuccess message={success} />}

            <div>
              <label htmlFor="support-subject" className={labelClass}>
                Subject
              </label>
              <input
                id="support-subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. My resume won't parse"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="support-message" className={labelClass}>
                Message
              </label>
              <textarea
                id="support-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                placeholder="Describe what happened and what you expected…"
                className={`${inputClass} resize-none`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={primaryButtonClass}
            >
              {isSubmitting ? "Submitting…" : "Submit ticket"}
            </button>
          </form>
        </Card>

        {submitted.length > 0 && (
          <Card title="Submitted this session" className="mt-6">
            <div className="space-y-3">
              {submitted.map((ticket) => (
                <div
                  key={ticket._id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {ticket.subject}
                    </p>
                    <span className={SUPPORT_STATUS_BADGE[ticket.status]}>
                      {SUPPORT_STATUS_LABELS[ticket.status]}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                    {ticket.message}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {formatDateTime(ticket.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
