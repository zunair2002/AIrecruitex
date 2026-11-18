"use client";

import { useMemo, useState } from "react";
import { CircleCheck, LifeBuoy, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { listSupportTickets, resolveSupportTicket } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { populated, type ObjectId } from "@/lib/types";
import {
  SUPPORT_STATUS_BADGE,
  SUPPORT_STATUS_LABELS,
  formatDateTime,
} from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { labelClass, textareaClass } from "@/components/ui/controls";
import { PortalPage } from "@/components/dashboard/primitives";

type StatusFilter = "all" | "open" | "resolved";

/**
 * GET /api/admin/support + PATCH /:ticketId/resolve. Resolving requires a reply,
 * which the backend also pushes to the ticket author as a notification.
 */
export function SupportDesk() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<ObjectId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tickets = useApiResource(
    (signal) => listSupportTickets(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  const filtered = useMemo(() => {
    const list = tickets.data ?? [];
    return statusFilter === "all"
      ? list
      : list.filter((ticket) => ticket.status === statusFilter);
  }, [tickets.data, statusFilter]);

  const handleResolve = async (ticketId: ObjectId) => {
    const reply = (replies[ticketId] ?? "").trim();
    if (!reply) {
      setError("A reply is required to resolve a ticket.");
      return;
    }
    setBusyId(ticketId);
    setError(null);
    try {
      const updated = await resolveSupportTicket(ticketId, reply, token);
      tickets.setData((current) =>
        (current ?? []).map((item) =>
          item._id === updated._id ? { ...updated, userId: item.userId } : item,
        ),
      );
      setReplies((current) => ({ ...current, [ticketId]: "" }));
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const all = tickets.data ?? [];
  const openCount = all.filter((t) => t.status === "open").length;

  return (
    <PortalPage>
      <PageHeader
        icon={<LifeBuoy />}
        title="Support desk"
        description={`${openCount} open ticket${openCount === 1 ? "" : "s"}. Resolving a ticket notifies its author.`}
      />

      <Tabs
        ariaLabel="Ticket status"
        idPrefix="support"
        value={statusFilter}
        onChange={setStatusFilter}
        tabs={[
          { id: "open", label: "Open", count: openCount },
          { id: "resolved", label: "Resolved", count: all.length - openCount },
          { id: "all", label: "All tickets", count: all.length },
        ]}
      />

      {error && <InlineError message={error} />}

      <div
        id={`support-panel-${statusFilter}`}
        role="tabpanel"
        aria-labelledby={`support-tab-${statusFilter}`}
      >
        {tickets.isLoading ? (
          <LoadingBlock label="Loading tickets…" />
        ) : tickets.error ? (
          <ErrorBlock message={tickets.error} onRetry={tickets.reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<LifeBuoy />}
            title="No tickets in this view"
            description={
              statusFilter === "open"
                ? "You're all caught up — new tickets from users appear here."
                : "Try another status tab."
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((ticket) => {
              const author = populated(ticket.userId);
              const replyId = `ticket-reply-${ticket._id}`;
              const isBusy = busyId === ticket._id;
              return (
                <article
                  key={ticket._id}
                  className="min-w-0 rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={author?.name ?? "Unknown user"} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <h2 className="min-w-0 text-base font-semibold text-ink">
                          {ticket.subject}
                        </h2>
                        <span className={`${SUPPORT_STATUS_BADGE[ticket.status]} self-start`}>
                          {SUPPORT_STATUS_LABELS[ticket.status]}
                        </span>
                      </div>
                      <p className="mt-1 break-words text-xs text-muted">
                        {author?.name ?? "Unknown user"}
                        {author?.email ? ` · ${author.email}` : ""} ·{" "}
                        <span className="tabular-nums">
                          {formatDateTime(ticket.createdAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-line break-words rounded-lg bg-surface-2 p-4 text-sm text-body ring-1 ring-inset ring-line-soft">
                    {ticket.message}
                  </p>

                  {ticket.adminReply ? (
                    <div className="mt-4 rounded-lg bg-brand-50 p-4 ring-1 ring-inset ring-brand-600/15">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-brand-700">
                        <CircleCheck aria-hidden="true" className="h-4 w-4" />
                        Admin reply
                      </p>
                      <p className="mt-1.5 whitespace-pre-line break-words text-sm text-body">
                        {ticket.adminReply}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label htmlFor={replyId} className={labelClass}>
                        Reply
                      </label>
                      <textarea
                        id={replyId}
                        value={replies[ticket._id] ?? ""}
                        onChange={(event) =>
                          setReplies((current) => ({
                            ...current,
                            [ticket._id]: event.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Write the reply the user will receive…"
                        className={`${textareaClass} min-h-24 resize-y`}
                      />
                      <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted">
                          The author is notified when you resolve the ticket.
                        </p>
                        <Button
                          onClick={() => handleResolve(ticket._id)}
                          loading={isBusy}
                          leadingIcon={<Send />}
                        >
                          {isBusy ? "Resolving…" : "Reply & resolve"}
                        </Button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PortalPage>
  );
}
