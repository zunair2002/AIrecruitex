"use client";

import { useAuth } from "@/context/AuthContext";
import { getMonitoringSnapshot } from "@/lib/adminApi";
import { health } from "@/lib/authApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDateTime, formatUptime } from "@/lib/format";
import {
  Card,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatCard,
} from "@/components/ui/Feedback";
import { secondaryButtonClass } from "@/components/ui/controls";

/** mongoose.connection.readyState values. */
const DB_STATES: Record<number, string> = {
  0: "Disconnected",
  1: "Connected",
  2: "Connecting",
  3: "Disconnecting",
};

/** GET /api/admin/monitoring. */
export function Monitoring() {
  const { token } = useAuth();
  const snapshot = useApiResource(
    (signal) => getMonitoringSnapshot(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  // GET /health — the unauthenticated liveness probe, refreshed alongside the
  // snapshot so a reachable-but-unhealthy API is distinguishable from a down one.
  const liveness = useApiResource(() => health(), [], {});

  if (snapshot.isLoading) return <LoadingBlock label="Loading system status…" />;
  if (snapshot.error) {
    return (
      <div className="p-8">
        <ErrorBlock message={snapshot.error} onRetry={snapshot.reload} />
      </div>
    );
  }
  const data = snapshot.data;
  if (!data) return null;

  return (
    <div className="p-8">
      <PageHeader
        title="Monitoring"
        description="Live backend status and the most recent server errors."
        action={
          <button
            type="button"
            onClick={() => {
              snapshot.reload();
              liveness.reload();
            }}
            className={`${secondaryButtonClass} text-sm`}
          >
            Refresh
          </button>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="API"
          value={
            liveness.isLoading
              ? "Checking…"
              : liveness.error
                ? "Unreachable"
                : "Healthy"
          }
          sub={liveness.error ?? liveness.data?.message ?? "GET /health"}
          icon={liveness.error ? "🔴" : "🟢"}
          gradient={
            liveness.error
              ? "from-red-500 to-red-600"
              : "from-emerald-500 to-emerald-600"
          }
        />
        <StatCard
          label="Database"
          value={DB_STATES[data.dbState] ?? `State ${data.dbState}`}
          sub={`readyState ${data.dbState}`}
          icon={data.dbState === 1 ? "🟢" : "🔴"}
          gradient={
            data.dbState === 1
              ? "from-emerald-500 to-emerald-600"
              : "from-red-500 to-red-600"
          }
        />
        <StatCard
          label="API uptime"
          value={formatUptime(data.uptimeSeconds)}
          sub="Since the process started"
          icon="⏱️"
        />
        <StatCard
          label="Open support tickets"
          value={data.openTicketCount}
          sub="Awaiting an admin reply"
          icon="🎫"
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      <Card title={`Recent server errors (${data.recentErrors.length})`}>
        {data.recentErrors.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No 5xx errors have been logged.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Method</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Path</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Message</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">When</th>
                </tr>
              </thead>
              <tbody>
                {data.recentErrors.map((entry) => (
                  <tr key={entry._id} className="border-b border-gray-50">
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
                        {entry.statusCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {entry.method}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {entry.path}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{entry.message}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDateTime(entry.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
