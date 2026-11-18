"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  ClipboardList,
  LifeBuoy,
  Megaphone,
  Mic,
  ScrollText,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { greetingFor } from "@/lib/greeting";
import {
  getDashboardOverview,
  getMonitoringSnapshot,
  getReportsSummary,
} from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUS_LABELS,
  BADGE_DOTS,
  ROLE_LABELS,
  formatUptime,
  statusTone,
} from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card, EmptyState, ErrorBlock } from "@/components/ui/Feedback";
import {
  BreakdownBar,
  EmptyLine,
  PanelLink,
  PortalPage,
} from "@/components/dashboard/primitives";
import {
  DashboardHero,
  HeroButton,
  HeroMeter,
} from "@/components/dashboard/DashboardHero";
import { ActivityItem } from "./ActivityLog";

/** mongoose.connection.readyState values. */
const DB_STATES: Record<number, string> = {
  0: "Disconnected",
  1: "Connected",
  2: "Connecting",
  3: "Disconnecting",
};

const ROLE_BAR_COLORS: Record<string, string> = {
  candidate: "bg-chart-1",
  hr: "bg-chart-2",
  admin: "bg-chart-3",
};

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** A small status dot; pulses while the service is up. */
function StatusDot({ up }: { up: boolean }) {
  return (
    <span aria-hidden="true" className="relative flex h-2.5 w-2.5 shrink-0">
      {up && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60 motion-safe:animate-ping" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          up ? "bg-brand-500" : "bg-brand-200"
        }`}
      />
    </span>
  );
}

/**
 * The platform overview: a hero with the headline numbers, then the readable
 * audit timeline beside system health, the support queue and the user /
 * application breakdowns.
 *
 * Three endpoints back it — GET /api/admin/dashboard for the counters and the
 * feed, /reports/summary for the breakdowns, /monitoring for liveness. The
 * breakdowns and health panels degrade on their own if either side call fails,
 * so one failing endpoint never blanks the page.
 */
export function AdminDashboard() {
  const { user, token } = useAuth();
  const enabled = { enabled: Boolean(token) };
  // Computed once per mount: "Hello" on the first session after sign-up,
  // "Welcome back" afterwards (see greetingFor).
  const [greeting] = useState(() =>
    user?.name?.trim() ? greetingFor(user) : null,
  );

  const overview = useApiResource(
    (signal) => getDashboardOverview(token, signal),
    [token],
    enabled,
  );
  const reports = useApiResource(
    (signal) => getReportsSummary(token, signal),
    [token],
    enabled,
  );
  const monitoring = useApiResource(
    (signal) => getMonitoringSnapshot(token, signal),
    [token],
    enabled,
  );

  const data = overview.data;

  const roleRows = useMemo(
    () =>
      (reports.data?.usersByRole ?? []).map((bucket) => ({
        label: ROLE_LABELS[bucket._id] ?? bucket._id,
        value: bucket.count,
        className: ROLE_BAR_COLORS[bucket._id] ?? "bg-chart-6",
      })),
    [reports.data],
  );

  const statusRows = useMemo(
    () =>
      (reports.data?.applicationsByStatus ?? []).map((bucket) => ({
        label: APPLICATION_STATUS_LABELS[bucket._id] ?? bucket._id,
        value: bucket.count,
        className: BADGE_DOTS[statusTone(bucket._id)],
      })),
    [reports.data],
  );

  if (overview.isLoading) {
    return (
      <PortalPage>
        <PageSkeleton label="Loading platform overview…" />
      </PortalPage>
    );
  }

  if (overview.error) {
    return (
      <PortalPage>
        <ErrorBlock message={overview.error} onRetry={overview.reload} />
      </PortalPage>
    );
  }

  if (!data) return null;

  const completionRate = data.totalInterviewSessions
    ? Math.round((data.completedInterviews / data.totalInterviewSessions) * 100)
    : 0;
  const activeRate = data.totalUsers
    ? Math.round((data.activeUsers / data.totalUsers) * 100)
    : 0;
  const roleTotal = roleRows.reduce((sum, row) => sum + row.value, 0);
  const statusTotal = statusRows.reduce((sum, row) => sum + row.value, 0);
  const dbUp = monitoring.data?.dbState === 1;
  const dbLabel = DB_STATES[monitoring.data?.dbState ?? -1] ?? "Unknown";
  const openTickets = monitoring.data?.openTicketCount;

  const healthSummary = monitoring.isLoading
    ? "Checking system status"
    : monitoring.error
      ? "System status unavailable"
      : dbUp
        ? "All systems operational"
        : `Database ${dbLabel.toLowerCase()}`;
  const ticketSummary =
    openTickets === undefined
      ? ""
      : ` · ${openTickets} support ticket${openTickets === 1 ? "" : "s"} open`;

  return (
    <PortalPage>
      <DashboardHero
        eyebrow={`Admin console · ${todayLabel()}`}
        title="Platform overview"
        description={`${greeting ? `${greeting}. ` : ""}${healthSummary}${ticketSummary}.`}
        actions={
          <>
            <HeroButton href="/admin/users" icon={<Users aria-hidden="true" />}>
              Manage users
            </HeroButton>
            <HeroButton
              href="/admin/notifications"
              variant="ghost"
              icon={<Megaphone aria-hidden="true" />}
            >
              Broadcast
            </HeroButton>
          </>
        }
        aside={
          <HeroMeter
            value={activeRate}
            label="Active accounts"
            caption={`${data.activeUsers} of ${data.totalUsers} users can sign in`}
          />
        }
        stats={[
          {
            label: "Users",
            value: data.totalUsers,
            detail: `${data.totalCandidates} candidates · ${data.totalHr} HR`,
            icon: <Users aria-hidden="true" />,
          },
          {
            label: "Jobs",
            value: data.totalJobs,
            detail: `${data.openJobs} open now`,
            icon: <BriefcaseBusiness aria-hidden="true" />,
            trend: data.openJobs > 0 ? "up" : "neutral",
          },
          {
            label: "Applications",
            value: data.totalApplications,
            detail: `${data.matchedApplications} above threshold`,
            icon: <ClipboardList aria-hidden="true" />,
          },
          {
            label: "Interviews",
            value: data.totalInterviewSessions,
            detail: `${completionRate}% completed`,
            icon: <Mic aria-hidden="true" />,
            trend: completionRate >= 50 ? "up" : "down",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* ---- main: readable audit timeline ---- */}
        <Card
          title="Recent activity"
          description="What people did across the platform, newest first."
          action={<PanelLink href="/admin/activity-logs">Full log</PanelLink>}
          className="lg:col-span-2"
        >
          {data.recentActivity.length === 0 ? (
            <EmptyState
              bare
              icon={<ScrollText />}
              title="No activity yet"
              description="Role changes, job closures, broadcasts and settings edits appear here."
            />
          ) : (
            <ul className="-my-4 divide-y divide-line-soft">
              {data.recentActivity.map((log) => (
                <li key={log._id}>
                  <ActivityItem log={log} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ---- side column ---- */}
        <div className="order-first grid grid-cols-1 content-start gap-4 sm:grid-cols-2 lg:order-none lg:grid-cols-1 lg:gap-6">
          <Card
            title="System health"
            action={<PanelLink href="/admin/monitoring">Details</PanelLink>}
          >
            {monitoring.error ? (
              <EmptyLine>Status unavailable.</EmptyLine>
            ) : monitoring.isLoading ? (
              <EmptyLine>Checking…</EmptyLine>
            ) : (
              <>
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ring-1 ring-inset ${
                    dbUp
                      ? "bg-success-50 ring-success-200"
                      : "bg-danger-50 ring-danger-200"
                  }`}
                >
                  <StatusDot up={dbUp} />
                  <p
                    className={`text-sm font-medium ${
                      dbUp ? "text-success-700" : "text-danger-700"
                    }`}
                  >
                    {dbUp ? "All systems operational" : "Database needs attention"}
                  </p>
                </div>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5 text-body">
                      <StatusDot up={dbUp} />
                      Database
                    </span>
                    <span className="font-medium text-ink">{dbLabel}</span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5 text-body">
                      <StatusDot up />
                      API uptime
                    </span>
                    <span className="font-medium tabular-nums text-ink">
                      {formatUptime(monitoring.data?.uptimeSeconds ?? 0)}
                    </span>
                  </li>
                </ul>
              </>
            )}
          </Card>

          <Card title="Support queue">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-3xl font-semibold tracking-tight tabular-nums text-ink">
                  {openTickets ?? "—"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {openTickets === 0
                    ? "No tickets waiting — all caught up."
                    : `Open ticket${openTickets === 1 ? "" : "s"} awaiting a reply`}
                </p>
              </div>
              <span
                aria-hidden="true"
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5 ${
                  openTickets ? "bg-brand-50 text-brand-500" : "bg-brand-50 text-brand-600"
                }`}
              >
                <LifeBuoy />
              </span>
            </div>
            <Button
              href="/admin/support"
              variant={openTickets ? "primary" : "secondary"}
              fullWidth
              trailingIcon={<ArrowRight />}
              className="mt-5"
            >
              {openTickets ? "Reply to tickets" : "Open support desk"}
            </Button>
          </Card>

          <Card
            title="Users by role"
            action={<PanelLink href="/admin/reports">Reports</PanelLink>}
          >
            {roleTotal === 0 ? (
              <EmptyLine>No users yet.</EmptyLine>
            ) : (
              <BreakdownBar rows={roleRows} total={roleTotal} />
            )}
          </Card>

          <Card
            title="Applications by status"
            description={
              reports.data ? (
                <span className="tabular-nums">
                  Average match score {Math.round(reports.data.averageMatchScore)}%
                </span>
              ) : undefined
            }
          >
            {statusTotal === 0 ? (
              <EmptyLine>No applications yet.</EmptyLine>
            ) : (
              <BreakdownBar rows={statusRows} total={statusTotal} />
            )}
          </Card>
        </div>
      </div>

      {/* A failing side endpoint must not hide that it failed. */}
      {reports.error && (
        <ErrorBlock message={reports.error} onRetry={reports.reload} />
      )}
    </PortalPage>
  );
}
