"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listActivityLogs } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { populated } from "@/lib/types";
import { formatDateTime, humanizeAction } from "@/lib/format";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { compactInputClass, smallButtonClass } from "@/components/ui/controls";

/**
 * GET /api/admin/activity-logs — capped at the 200 most recent entries by the
 * backend, filterable by `actorId` and exact `action` string.
 */
export function ActivityLog() {
  const { token } = useAuth();
  const [actionInput, setActionInput] = useState("");
  const [actorInput, setActorInput] = useState("");
  const [filter, setFilter] = useState<{ action?: string; actorId?: string }>({});

  const logs = useApiResource(
    (signal) => listActivityLogs(filter, token, signal),
    [token, filter.action, filter.actorId],
    { enabled: Boolean(token) },
  );

  const list = logs.data ?? [];

  return (
    <div className="p-8">
      <PageHeader
        title="Activity Log"
        description="Every admin action the backend records, newest first (latest 200)."
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setFilter({
            action: actionInput.trim() || undefined,
            actorId: actorInput.trim() || undefined,
          });
        }}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={actionInput}
          onChange={(event) => setActionInput(event.target.value)}
          placeholder="Exact action, e.g. user.role-change"
          className={`${compactInputClass} flex-1`}
        />
        <input
          type="text"
          value={actorInput}
          onChange={(event) => setActorInput(event.target.value)}
          placeholder="Actor user id"
          className={`${compactInputClass} flex-1`}
        />
        <button type="submit" className={smallButtonClass}>
          Filter
        </button>
      </form>

      {logs.isLoading ? (
        <LoadingBlock label="Loading activity…" />
      ) : logs.error ? (
        <ErrorBlock message={logs.error} onRetry={logs.reload} />
      ) : list.length === 0 ? (
        <EmptyState
          title="No activity recorded."
          description="Admin actions — role changes, job closures, broadcasts, settings edits — are logged here."
        />
      ) : (
        <div className="space-y-3">
          {list.map((log) => {
            const actor = populated(log.actorId);
            return (
              <div
                key={log._id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {humanizeAction(log.action)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {actor?.name ?? "Unknown actor"}
                      {actor?.email ? ` · ${actor.email}` : ""} · role{" "}
                      {log.actorRole}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Target: {log.targetType}
                      {log.targetId ? ` · ${log.targetId}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-gray-400">
                    {formatDateTime(log.createdAt)}
                  </p>
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
