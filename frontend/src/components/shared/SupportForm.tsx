"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, LifeBuoy, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { createSupportTicket } from "@/lib/supportApi";
import {
  SUPPORT_STATUS_BADGE,
  SUPPORT_STATUS_LABELS,
  formatDateTime,
} from "@/lib/format";
import type { SupportTicket } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { PortalPage } from "@/components/dashboard/primitives";
import {
  Card,
  InlineError,
  InlineSuccess,
  PageHeader,
} from "@/components/ui/Feedback";
import {
  helpTextClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/ui/controls";

const NEXT_STEPS = [
  {
    title: "Your ticket reaches the admins",
    description: "It lands in the platform support queue straight away.",
  },
  {
    title: "An admin looks into it",
    description: "They review the details and reply on the ticket.",
  },
  {
    title: "The reply arrives as a notification",
    description: "You'll see it in your notifications inbox, live.",
  },
];

/**
 * POST /api/support/tickets. The backend has no "list my tickets" route, so
 * tickets raised in this session are shown back here after they're created;
 * the admin's reply arrives as a notification.
 */
export function SupportForm() {
  const { token } = useAuth();
  const pathname = usePathname() ?? "";
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

  const notificationsHref = pathname.startsWith("/recruiter")
    ? "/recruiter/notifications"
    : "/candidate/notifications";

  return (
    <PortalPage>
      <PageHeader
        icon={<LifeBuoy />}
        title="Support"
        description="Raise a ticket with the platform admins. Replies arrive in your notifications."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="min-w-0 space-y-4 lg:col-span-2 lg:space-y-6">
          <Card
            title="New ticket"
            description="Tell us what happened — the more detail, the faster the fix."
          >
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
                  rows={7}
                  placeholder="Describe what happened and what you expected…"
                  className={`${textareaClass} resize-y`}
                  required
                />
                <p className={helpTextClass}>
                  Include the job title or page you were on, if it applies.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-line-soft pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted">
                  Both fields are required.
                </p>
                <Button
                  type="submit"
                  disabled={!isValid}
                  loading={isSubmitting}
                  leadingIcon={<Send />}
                >
                  {isSubmitting ? "Submitting…" : "Submit ticket"}
                </Button>
              </div>
            </form>
          </Card>

          {submitted.length > 0 && (
            <Card
              title="Submitted this session"
              description="Replies arrive as notifications."
            >
              <ul className="space-y-3">
                {submitted.map((ticket) => (
                  <li
                    key={ticket._id}
                    className="rounded-lg border border-line-soft bg-surface-2 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 break-words text-sm font-semibold text-ink">
                        {ticket.subject}
                      </p>
                      <span className={`shrink-0 ${SUPPORT_STATUS_BADGE[ticket.status]}`}>
                        {SUPPORT_STATUS_LABELS[ticket.status]}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line break-words text-sm text-body">
                      {ticket.message}
                    </p>
                    <p className="mt-2 text-xs tabular-nums text-muted">
                      {formatDateTime(ticket.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <aside className="min-w-0">
          <Card title="What happens next">
            <ol className="space-y-5">
              {NEXT_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold tabular-nums text-brand-700 ring-1 ring-inset ring-brand-600/20"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-t border-line-soft pt-5">
              <Button
                href={notificationsHref}
                variant="secondary"
                fullWidth
                leadingIcon={<Bell />}
              >
                View notifications
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </PortalPage>
  );
}
