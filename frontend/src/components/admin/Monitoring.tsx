"use client";

import {
  Activity,
  Database,
  Info,
  LifeBuoy,
  RotateCw,
  Server,
  Timer,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMonitoringSnapshot } from "@/lib/adminApi";
import { health } from "@/lib/authApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatUptime } from "@/lib/format";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatCard,
} from "@/components/ui/Feedback";
import { PanelLink, PortalPage } from "@/components/dashboard/primitives";

/** mongoose.connection.readyState values. */
const DB_STATES: Record<number, string> = {
  0: "Disconnected",
  1: "Connected",
  2: "Connecting",
  3: "Disconnecting",
};

function ServiceRow({
  icon,
  name,
  detail,
  tone,
  status,
}: {
  icon: ReactNode;
  name: string;
  detail: ReactNode;
  tone: BadgeTone;
  status: string;
}) {
  return (
    <li className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-body [&>svg]:h-5 [&>svg]:w-5"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{name}</p>
        <div className="break-words text-xs text-muted">{detail}</div>
      </div>
      <Badge tone={tone} dot>
        {status}
      </Badge>
    </li>
  );
}

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

  if (snapshot.isLoading) {
    return (
      <PortalPage>
        <LoadingBlock label="Loading system status…" />
      </PortalPage>
    );
  }
  if (snapshot.error) {
    return (
      <PortalPage>
        <ErrorBlock message={snapshot.error} onRetry={snapshot.reload} />
      </PortalPage>
    );
  }
  const data = snapshot.data;
  if (!data) return null;

  const apiStatus = liveness.isLoading
    ? "Checking…"
    : liveness.error
      ? "Unreachable"
      : "Healthy";
  const apiTone: BadgeTone = liveness.isLoading
    ? "neutral"
    : liveness.error
      ? "danger"
      : "success";
  const dbUp = data.dbState === 1;
  const dbLabel = DB_STATES[data.dbState] ?? `State ${data.dbState}`;

  return (
    <PortalPage>
      <PageHeader
        icon={<Activity />}
        title="Monitoring"
        description="Live backend status and the most recent server errors."
        action={
          <Button
            variant="secondary"
            leadingIcon={<RotateCw />}
            onClick={() => {
              snapshot.reload();
              liveness.reload();
            }}
          >
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="API"
          value={apiStatus}
          sub={liveness.error ?? liveness.data?.message ?? "GET /health"}
          icon={<Server />}
          tone={apiTone === "neutral" ? "neutral" : apiTone === "danger" ? "danger" : "success"}
        />
        <StatCard
          label="Database"
          value={dbLabel}
          sub={`readyState ${data.dbState}`}
          icon={<Database />}
          tone={dbUp ? "success" : "danger"}
        />
        <StatCard
          label="API uptime"
          value={formatUptime(data.uptimeSeconds)}
          sub="Since the process started"
          icon={<Timer />}
          tone="brand"
        />
        <StatCard
          label="Open support tickets"
          value={data.openTicketCount}
          sub="Awaiting an admin reply"
          icon={<LifeBuoy />}
          tone={data.openTicketCount > 0 ? "warning" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card
          title="Services"
          description="Current state of each backend dependency."
          className="lg:col-span-2"
        >
          <ul className="divide-y divide-line-soft">
            <ServiceRow
              icon={<Server />}
              name="API server"
              detail={liveness.error ?? liveness.data?.message ?? "GET /health"}
              tone={apiTone}
              status={apiStatus}
            />
            <ServiceRow
              icon={<Database />}
              name="Database"
              detail={`MongoDB · readyState ${data.dbState}`}
              tone={dbUp ? "success" : "danger"}
              status={dbLabel}
            />
            <ServiceRow
              icon={<Timer />}
              name="Uptime"
              detail="Since the process started"
              tone="neutral"
              status={formatUptime(data.uptimeSeconds)}
            />
            <ServiceRow
              icon={<LifeBuoy />}
              name="Support queue"
              detail={<PanelLink href="/admin/support">Open support desk</PanelLink>}
              tone={data.openTicketCount > 0 ? "warning" : "success"}
              status={`${data.openTicketCount} open`}
            />
          </ul>
        </Card>

        <Card title="Error reporting">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 [&>svg]:h-5 [&>svg]:w-5"
            >
              <Info />
            </span>
            <p className="text-sm text-body">
              Server errors are no longer written to the database — every 5xx
              used to create a document, which added up quickly whenever a
              dependency (such as Ollama) was briefly unreachable. They&apos;re
              captured in the server logs instead.
            </p>
          </div>
        </Card>
      </div>
    </PortalPage>
  );
}
