"use client";

import { useMemo, useState } from "react";
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
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import {
  compactInputClass,
  inputClass,
  smallButtonClass,
} from "@/components/ui/controls";

/**
 * GET /api/admin/support + PATCH /:ticketId/resolve. Resolving requires a reply,
 * which the backend also pushes to the ticket author as a notification.
 */
export function SupportDesk() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">(
    "open",
  );
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
          item._id === updated._id
            ? { ...updated, userId: item.userId }
            : item,
        ),
      );
      setReplies((current) => ({ ...current, [ticketId]: "" }));
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const openCount = (tickets.data ?? []).filter((t) => t.status === "open").length;

  return (
    <div className="p-8">
      <PageHeader
        title="Support Desk"
        description={`${openCount} open ticket${openCount === 1 ? "" : "s"}. Resolving a ticket notifies its author.`}
      />

      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(event.target.value as "all" | "open" | "resolved")
        }
        className={`${compactInputClass} mb-6`}
      >
        <option value="open">Open only</option>
        <option value="resolved">Resolved only</option>
        <option value="all">All tickets</option>
      </select>

      {error && (
        <div className="mb-6">
          <InlineError message={error} />
        </div>
      )}

      {tickets.isLoading ? (
        <LoadingBlock label="Loading tickets…" />
      ) : tickets.error ? (
        <ErrorBlock message={tickets.error} onRetry={tickets.reload} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No tickets in this view." />
      ) : (
        <div className="space-y-4">
          {filtered.map((ticket) => {
            const author = populated(ticket.userId);
            return (
              <div
                key={ticket._id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900">{ticket.subject}</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {author?.name ?? "Unknown user"}
                      {author?.email ? ` · ${author.email}` : ""} ·{" "}
                      {formatDateTime(ticket.createdAt)}
                    </p>
                  </div>
                  <span className={SUPPORT_STATUS_BADGE[ticket.status]}>
                    {SUPPORT_STATUS_LABELS[ticket.status]}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-line rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                  {ticket.message}
                </p>

                {ticket.adminReply ? (
                  <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                      Admin reply
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm text-emerald-900">
                      {ticket.adminReply}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <textarea
                      value={replies[ticket._id] ?? ""}
                      onChange={(event) =>
                        setReplies((current) => ({
                          ...current,
                          [ticket._id]: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Write the reply the user will receive…"
                      className={`${inputClass} resize-none text-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => handleResolve(ticket._id)}
                      disabled={busyId === ticket._id}
                      className={`${smallButtonClass} mt-3`}
                    >
                      {busyId === ticket._id ? "Resolving…" : "Reply & resolve"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
