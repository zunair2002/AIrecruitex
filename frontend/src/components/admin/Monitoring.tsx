"use client";

import { useAuth } from "@/context/AuthContext";
import { getMonitoringSnapshot } from "@/lib/adminApi";
import { health } from "@/lib/authApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatUptime } from "@/lib/format";
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

      <Card title="Error reporting">
        <p className="text-sm text-gray-600">
          Server errors are no longer written to the database — every 5xx used to
          create a document, which added up quickly whenever a dependency (such as
          Ollama) was briefly unreachable. They&apos;re captured in the server logs
          instead.
        </p>
      </Card>

    </div>
  );
}
