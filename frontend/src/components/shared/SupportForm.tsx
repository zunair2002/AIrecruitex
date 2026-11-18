"use client";

import { useRef, useState } from "react";
import { LifeBuoy, Plus, Send, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useServerEvent } from "@/context/RealtimeContext";
import { toErrorMessage } from "@/lib/api";
import { createSupportTicket, listMySupportTickets } from "@/lib/supportApi";
import { resolveSelection, useApiResource } from "@/lib/useApiResource";
import type { ObjectId, SupportTicket } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { PortalPage } from "@/components/dashboard/primitives";
import {
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import {
  helpTextClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/ui/controls";
import { SupportThread, SupportTicketList } from "./SupportThread";

/** Scroll the detail pane into view on phones, where it stacks below the list. */
function revealOnSmallScreens(node: HTMLElement | null) {
  if (node && typeof window !== "undefined" && window.innerWidth < 1024) {
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Candidate + HR support. GET /api/support/tickets lists "my tickets"; each
 * ticket opens as a live chat with the admins (see SupportThread), and
 * POST /api/support/tickets starts a new one.
 */
export function SupportForm() {
  const { token } = useAuth();
  const [selectedId, setSelectedId] = useState<ObjectId | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  const tickets = useApiResource(
    (signal) => listMySupportTickets(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  // A reply or status change on any of my tickets re-sorts / re-badges the list.
  useServerEvent("support:ticket", () => tickets.reload());

  const list = tickets.data ?? [];
  const selected = resolveSelection(list, selectedId, (ticket) => ticket._id);
  const isFirstLoad = tickets.isLoading && !tickets.data;
  const showForm = isComposing || (!isFirstLoad && !tickets.error && list.length === 0);
  const openCount = list.filter((ticket) => ticket.status === "open").length;

  const upsert = (ticket: SupportTicket) =>
    tickets.setData((current) => [
      ticket,
      ...(current ?? []).filter((item) => item._id !== ticket._id),
    ]);

  const select = (ticketId: ObjectId) => {
    setSelectedId(ticketId);
    setIsComposing(false);
    revealOnSmallScreens(detailRef.current);
  };

  return (
    <PortalPage>
      <PageHeader
        icon={<LifeBuoy />}
        title="Support"
        description="Chat with the platform admins. Replies arrive here live and in your notifications."
        action={
          !showForm || list.length > 0 ? (
            <Button
              leadingIcon={<Plus />}
              onClick={() => {
                setIsComposing(true);
                revealOnSmallScreens(detailRef.current);
              }}
            >
              New ticket
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card
          title="My tickets"
          description={
            list.length
              ? `${openCount} open · ${list.length - openCount} resolved`
              : undefined
          }
          padding="none"
          className="self-start"
        >
          {isFirstLoad ? (
            <LoadingBlock label="Loading tickets…" />
          ) : tickets.error ? (
            <div className="px-5 pb-5">
              <ErrorBlock message={tickets.error} onRetry={tickets.reload} />
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              bare
              icon={<LifeBuoy />}
              title="No tickets yet"
              description="Open one and an admin will reply here."
            />
          ) : (
            <div className="max-h-[70vh] overflow-y-auto border-t border-line-soft">
              <SupportTicketList
                tickets={list}
                selectedId={isComposing ? null : selected?._id ?? null}
                onSelect={select}
              />
            </div>
          )}
        </Card>

        <div ref={detailRef} className="min-w-0 scroll-mt-4 lg:col-span-2">
          {showForm ? (
            <NewTicketForm
              onCancel={list.length > 0 ? () => setIsComposing(false) : undefined}
              onCreated={(ticket) => {
                upsert(ticket);
                setSelectedId(ticket._id);
                setIsComposing(false);
              }}
            />
          ) : selected ? (
            <SupportThread
              key={selected._id}
              ticketId={selected._id}
              onTicketChange={upsert}
            />
          ) : isFirstLoad ? (
            <div className="rounded-xl border border-line bg-surface shadow-xs">
              <LoadingBlock label="Loading conversation…" />
            </div>
          ) : null}
        </div>
      </div>
    </PortalPage>
  );
}

function NewTicketForm({
  onCreated,
  onCancel,
}: {
  onCreated: (ticket: SupportTicket) => void;
  onCancel?: () => void;
}) {
  const { token } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = subject.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const ticket = await createSupportTicket(
        { subject: subject.trim(), message: message.trim() },
        token,
      );
      setSubject("");
      setMessage("");
      onCreated(ticket);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      title="New ticket"
      description="Tell us what happened — an admin will pick it up and chat with you here."
      action={
        onCancel ? (
          <Button variant="ghost" size="sm" leadingIcon={<X />} onClick={onCancel}>
            Cancel
          </Button>
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <InlineError message={error} />}

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
            maxLength={5000}
            placeholder="Describe what happened and what you expected…"
            className={`${textareaClass} resize-y`}
            required
          />
          <p className={helpTextClass}>
            Include the job title or page you were on, if it applies.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-line-soft pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">Both fields are required.</p>
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
  );
}
