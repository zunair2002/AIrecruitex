"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, LifeBuoy, RotateCcw, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useServerEvent } from "@/context/RealtimeContext";
import { toErrorMessage } from "@/lib/api";
import { getSupportTicket, postSupportMessage } from "@/lib/supportApi";
import { reopenSupportTicket, resolveSupportTicket } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  SUPPORT_STATUS_BADGE,
  SUPPORT_STATUS_LABELS,
  formatDateTime,
} from "@/lib/format";
import {
  populated,
  type ObjectId,
  type SupportMessage,
  type SupportTicket,
} from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
} from "@/components/ui/Feedback";

/* ---------------------------------------------------------------- helpers */

/** "14:05" today, "Nov 18, 14:05" otherwise. */
function formatMessageTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return time;
  const day = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === today.getFullYear() ? {} : { year: "numeric" }),
  });
  return `${day}, ${time}`;
}

function lastMessageOf(ticket: SupportTicket): SupportMessage | null {
  return ticket.messages?.length
    ? ticket.messages[ticket.messages.length - 1]
    : null;
}

function authorName(message: SupportMessage): string | null {
  return populated(message.authorId)?.name ?? null;
}

function authorIdOf(message: SupportMessage): ObjectId | null {
  const author = message.authorId;
  if (!author) return null;
  return typeof author === "string" ? author : author._id;
}

/* ------------------------------------------------------------ ticket list */

/**
 * The left-hand list of tickets. `showAuthor` adds the author's name (admin
 * desk); the preview line is the latest chat message.
 */
export function SupportTicketList({
  tickets,
  selectedId,
  onSelect,
  showAuthor = false,
}: {
  tickets: SupportTicket[];
  selectedId: ObjectId | null;
  onSelect: (ticketId: ObjectId) => void;
  showAuthor?: boolean;
}) {
  return (
    <ul className="divide-y divide-line-soft">
      {tickets.map((ticket) => {
        const isActive = ticket._id === selectedId;
        const last = lastMessageOf(ticket);
        const author = populated(ticket.userId);
        return (
          <li key={ticket._id}>
            <button
              type="button"
              onClick={() => onSelect(ticket._id)}
              aria-current={isActive ? "true" : undefined}
              className={`block w-full px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-5 ${
                isActive
                  ? "bg-brand-50 shadow-[inset_3px_0_0_var(--color-brand-600)]"
                  : "hover:bg-surface-2"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-semibold text-ink">
                  {ticket.subject}
                </p>
                <span className={`shrink-0 ${SUPPORT_STATUS_BADGE[ticket.status]}`}>
                  {SUPPORT_STATUS_LABELS[ticket.status]}
                </span>
              </div>
              {showAuthor && (
                <p className="mt-0.5 truncate text-xs font-medium text-body">
                  {author?.name ?? "Unknown user"}
                  {author?.role ? ` · ${author.role === "hr" ? "HR" : "Candidate"}` : ""}
                </p>
              )}
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-sm text-muted">
                  {last
                    ? `${last.authorRole === "admin" ? "Admin: " : ""}${last.body}`
                    : ticket.message}
                </p>
                <span className="shrink-0 text-xs tabular-nums text-subtle">
                  {formatMessageTime(ticket.lastMessageAt ?? ticket.updatedAt)}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------------------------------------------- thread */

/**
 * One ticket as a live chat. Loads `GET /api/support/tickets/:id` (author or
 * admin only), refetches whenever the server pushes `support:ticket` for this
 * ticket, and posts with `POST /:id/messages`. Admins also get resolve/reopen.
 */
export function SupportThread({
  ticketId,
  isAdmin = false,
  onTicketChange,
}: {
  ticketId: ObjectId;
  isAdmin?: boolean;
  /** Called with the fresh ticket after a send / resolve / reopen. */
  onTicketChange?: (ticket: SupportTicket) => void;
}) {
  const { token, user } = useAuth();
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const thread = useApiResource(
    (signal) => getSupportTicket(ticketId, token, signal),
    [ticketId, token],
    { enabled: Boolean(token && ticketId) },
  );

  useServerEvent("support:ticket", (event) => {
    if (event.ticketId === ticketId) thread.reload();
  });

  // Ignore the previous ticket's data while switching between tickets.
  const ticket = thread.data && thread.data._id === ticketId ? thread.data : null;
  const messages = ticket?.messages ?? [];
  const lastMessageKey = messages.length
    ? messages[messages.length - 1]._id
    : null;

  // Keep the newest message in view whenever one arrives or the ticket changes.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [ticketId, lastMessageKey]);

  const applyUpdate = (updated: SupportTicket) => {
    thread.setData(updated);
    onTicketChange?.(updated);
  };

  const send = async () => {
    const body = draft.trim();
    if (!body || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      applyUpdate(await postSupportMessage(ticketId, body, token));
      setDraft("");
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  const toggleStatus = async () => {
    if (!ticket) return;
    setIsUpdatingStatus(true);
    setError(null);
    try {
      applyUpdate(
        ticket.status === "open"
          ? await resolveSupportTicket(ticketId, undefined, token)
          : await reopenSupportTicket(ticketId, token),
      );
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!ticket) {
    return (
      <div className="min-w-0 rounded-xl border border-line bg-surface shadow-xs">
        {thread.error ? (
          <div className="p-5">
            <ErrorBlock message={thread.error} onRetry={thread.reload} />
          </div>
        ) : (
          <LoadingBlock label="Loading conversation…" />
        )}
      </div>
    );
  }

  const owner = populated(ticket.userId);
  const ownerId = typeof ticket.userId === "string" ? ticket.userId : ticket.userId._id;

  /** Admin view: admins on the right. Author view: the author on the right. */
  const isMine = (message: SupportMessage) =>
    isAdmin
      ? message.authorRole === "admin"
      : message.authorRole !== "admin" &&
        (authorIdOf(message) ?? ownerId) === ownerId;

  const labelFor = (message: SupportMessage, mine: boolean): string => {
    const name = authorName(message);
    if (mine && (!isAdmin || authorIdOf(message) === user?.id)) return "You";
    if (message.authorRole === "admin") {
      return name ? `${name} · Support team` : "Support team";
    }
    return name ?? owner?.name ?? "User";
  };

  const isAuthorOnResolved = !isAdmin && ticket.status === "resolved";

  return (
    <section
      aria-label={`Support ticket: ${ticket.subject}`}
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xs"
    >
      {/* header */}
      <header className="flex flex-col gap-3 border-b border-line-soft px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 break-words text-base font-semibold text-ink">
              {ticket.subject}
            </h2>
            <span className={SUPPORT_STATUS_BADGE[ticket.status]}>
              {SUPPORT_STATUS_LABELS[ticket.status]}
            </span>
          </div>
          <p className="mt-1 break-words text-xs text-muted">
            {isAdmin && owner
              ? `${owner.name}${owner.email ? ` · ${owner.email}` : ""} · `
              : ""}
            Opened{" "}
            <span className="tabular-nums">{formatDateTime(ticket.createdAt)}</span>
          </p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            variant={ticket.status === "open" ? "secondary" : "ghost"}
            onClick={toggleStatus}
            loading={isUpdatingStatus}
            leadingIcon={ticket.status === "open" ? <CircleCheck /> : <RotateCcw />}
            className="self-start"
          >
            {ticket.status === "open" ? "Mark resolved" : "Reopen"}
          </Button>
        )}
      </header>

      {/* messages */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="h-[min(56vh,520px)] min-h-72 space-y-4 overflow-y-auto bg-canvas px-4 py-5 sm:px-6"
      >
        {messages.map((message) => {
          const mine = isMine(message);
          const label = labelFor(message, mine);
          return (
            <div
              key={message._id}
              className={`flex items-end gap-2.5 ${mine ? "flex-row-reverse" : ""}`}
            >
              {!mine && (
                <Avatar
                  name={
                    authorName(message) ??
                    (message.authorRole === "admin" ? "Support" : owner?.name ?? "User")
                  }
                  size="sm"
                  tone={message.authorRole === "admin" ? "brand" : "neutral"}
                />
              )}
              <div
                className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%] ${
                  mine ? "items-end" : "items-start"
                }`}
              >
                <p className="mb-1 px-1 text-xs font-medium text-muted">{label}</p>
                <div
                  className={`whitespace-pre-line break-words rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    mine
                      ? "rounded-br-md bg-brand-700 text-white"
                      : "rounded-bl-md bg-surface text-body ring-1 ring-inset ring-line"
                  }`}
                >
                  {message.body}
                </div>
                <time
                  dateTime={message.createdAt}
                  title={formatDateTime(message.createdAt)}
                  className="mt-1 px-1 text-[11px] tabular-nums text-subtle"
                >
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
            </div>
          );
        })}
      </div>

      {/* composer */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
        className="border-t border-line-soft bg-surface px-4 py-3 sm:px-6 sm:py-4"
      >
        {error && (
          <div className="mb-3">
            <InlineError message={error} />
          </div>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor={`support-composer-${ticketId}`} className="sr-only">
            Message
          </label>
          <textarea
            id={`support-composer-${ticketId}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                void send();
              }
            }}
            rows={1}
            maxLength={5000}
            placeholder="Write a message…"
            className="block max-h-40 min-h-10 w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm leading-6 text-ink shadow-xs transition placeholder:text-subtle focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 [field-sizing:content]"
          />
          <Button
            type="submit"
            disabled={!draft.trim()}
            loading={isSending}
            leadingIcon={<Send />}
          >
            Send
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {isAuthorOnResolved
            ? "This ticket is resolved — sending a message reopens it."
            : "Enter to send · Shift + Enter for a new line"}
        </p>
      </form>
    </section>
  );
}

/** Right-hand placeholder when there is no ticket to show. */
export function SupportThreadEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <EmptyState
      icon={<LifeBuoy />}
      title={title}
      description={description}
      action={action}
    />
  );
}
