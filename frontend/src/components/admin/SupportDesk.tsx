"use client";

import { useMemo, useRef, useState } from "react";
import { LifeBuoy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useServerEvent } from "@/context/RealtimeContext";
import { listSupportTickets } from "@/lib/adminApi";
import { resolveSelection, useApiResource } from "@/lib/useApiResource";
import type { ObjectId, SupportTicket } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { PortalPage } from "@/components/dashboard/primitives";
import {
  SupportThread,
  SupportTicketList,
} from "@/components/shared/SupportThread";

type StatusFilter = "all" | "open" | "resolved";

/**
 * GET /api/admin/support for the queue; each ticket opens as a live chat with
 * its author (SupportThread: shared message routes + admin resolve/reopen).
 * New tickets, replies and status changes arrive over `support:ticket`.
 */
export function SupportDesk() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [selectedId, setSelectedId] = useState<ObjectId | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const tickets = useApiResource(
    (signal) => listSupportTickets(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  useServerEvent("support:ticket", () => tickets.reload());

  const all = useMemo(() => tickets.data ?? [], [tickets.data]);
  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? all
        : all.filter((ticket) => ticket.status === statusFilter),
    [all, statusFilter],
  );
  const selected = resolveSelection(filtered, selectedId, (ticket) => ticket._id);
  const openCount = all.filter((t) => t.status === "open").length;
  const isFirstLoad = tickets.isLoading && !tickets.data;

  const patchTicket = (updated: SupportTicket) =>
    tickets.setData((current) =>
      (current ?? []).map((item) => (item._id === updated._id ? updated : item)),
    );

  const select = (ticketId: ObjectId) => {
    setSelectedId(ticketId);
    const node = detailRef.current;
    if (node && window.innerWidth < 1024) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <PortalPage>
      <PageHeader
        icon={<LifeBuoy />}
        title="Support desk"
        description={`${openCount} open ticket${openCount === 1 ? "" : "s"}. Chat with users live; they're notified of every reply.`}
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

      <div
        id={`support-panel-${statusFilter}`}
        role="tabpanel"
        aria-labelledby={`support-tab-${statusFilter}`}
      >
        {isFirstLoad ? (
          <LoadingBlock label="Loading tickets…" />
        ) : tickets.error && !tickets.data ? (
          <ErrorBlock message={tickets.error} onRetry={tickets.reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<LifeBuoy />}
            title="No tickets in this view"
            description={
              statusFilter === "open"
                ? "You're all caught up — new tickets from users appear here live."
                : "Try another status tab."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            <div className="min-w-0 self-start overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
              <div className="max-h-[70vh] overflow-y-auto">
                <SupportTicketList
                  tickets={filtered}
                  selectedId={selected?._id ?? null}
                  onSelect={select}
                  showAuthor
                />
              </div>
            </div>
            <div ref={detailRef} className="min-w-0 scroll-mt-4 lg:col-span-2">
              {selected && (
                <SupportThread
                  key={selected._id}
                  ticketId={selected._id}
                  isAdmin
                  onTicketChange={patchTicket}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </PortalPage>
  );
}
