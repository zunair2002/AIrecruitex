"use client";

import { useMemo } from "react";
import {
  BriefcaseBusiness,
  ClipboardList,
  Mic,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getDashboardOverview,
  getMonitoringSnapshot,
  getReportsSummary,
} from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUS_LABELS,
  ROLE_LABELS,
  formatDateTime,
  formatUptime,
  humanizeAction,
} from "@/lib/format";
import { populated } from "@/lib/types";
import { ErrorBlock, LoadingBlock } from "@/components/ui/Feedback";
import {
  BreakdownBar,
  Chip,
  EmptyLine,
  FeedRow,
  Field,
  HeaderAction,
  MetricCard,
  Panel,
  PanelLink,
  PortalHeader,
  PortalPage,
} from "@/components/dashboard/primitives";

/** mongoose.connection.readyState values. */
const DB_STATES: Record<number, string> = {
  0: "Disconnected",
  1: "Connected",
  2: "Connecting",
  3: "Disconnecting",
};

const ROLE_BAR_COLORS: Record<string, string> = {
  candidate: "bg-[#7163df]",
  hr: "bg-[#65c4cf]",
  admin: "bg-[#f6b94a]",
};

const STATUS_BAR_COLORS: Record<string, string> = {
  pending: "bg-[#f6b94a]",
  selected: "bg-[#45b9a7]",
  rejected: "bg-[#ef7474]",
};

/**
 * The platform overview, in the same three-column layout as the candidate and
 * HR dashboards: platform facts on the left, the audit feed in the middle, and
 * system health on the right.
 *
 * Three endpoints back it — GET /api/admin/dashboard for the counters and the
 * feed, /reports/summary for the breakdowns, /monitoring for liveness. The
 * breakdowns and health panels degrade on their own if either side call fails,
 * so one failing endpoint never blanks the page.
 */
export function AdminDashboard() {
  const { user, token } = useAuth();
  const enabled = { enabled: Boolean(token) };

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
        className: ROLE_BAR_COLORS[bucket._id] ?? "bg-[#b8bbc4]",
      })),
    [reports.data],
  );

  const statusRows = useMemo(
    () =>
      (reports.data?.applicationsByStatus ?? []).map((bucket) => ({
        label: APPLICATION_STATUS_LABELS[bucket._id] ?? bucket._id,
        value: bucket.count,
        className: STATUS_BAR_COLORS[bucket._id] ?? "bg-[#b8bbc4]",
      })),
    [reports.data],
  );

  if (overview.isLoading) {
    return <LoadingBlock label="Loading platform overview…" />;
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
  const roleTotal = roleRows.reduce((sum, row) => sum + row.value, 0);
  const statusTotal = statusRows.reduce((sum, row) => sum + row.value, 0);
  const dbUp = monitoring.data?.dbState === 1;

  return (
    <PortalPage>
      <PortalHeader
        icon={<ShieldCheck aria-hidden="true" />}
        title="Overview"
        subtitle={
          user ? `Signed in as ${user.name}` : "Platform-wide counts and activity"
        }
        action={<HeaderAction href="/admin/users">User management</HeaderAction>}
      />

      {/* ---- metrics ---- */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          label="Total users"
          value={String(data.totalUsers)}
          detail={`${data.activeUsers} active`}
          icon={<Users aria-hidden="true" className="h-4 w-4 text-violet-600" />}
          iconClass="bg-violet-50"
        />
        <MetricCard
          label="Jobs"
          value={String(data.totalJobs)}
          detail={`${data.openJobs} open`}
          icon={
            <BriefcaseBusiness
              aria-hidden="true"
              className="h-4 w-4 text-sky-600"
            />
          }
          iconClass="bg-sky-50"
        />
        <MetricCard
          label="Applications"
          value={String(data.totalApplications)}
          detail={`${data.matchedApplications} above threshold`}
          icon={
            <ClipboardList
              aria-hidden="true"
              className="h-4 w-4 text-amber-600"
            />
          }
          iconClass="bg-amber-50"
        />
        <MetricCard
          label="Interviews"
          value={String(data.totalInterviewSessions)}
          detail={`${data.completedInterviews} completed · ${completionRate}%`}
          icon={<Mic aria-hidden="true" className="h-4 w-4 text-emerald-600" />}
          iconClass="bg-emerald-50"
        />
      </div>

      {/* ---- three columns ---- */}
      <div className="grid gap-3 lg:grid-cols-12">
        {/* left: platform facts */}
        <div className="space-y-3 lg:col-span-3">
          <Panel title="Platform" aside>
            <div className="space-y-3.5">
              <Field label="Candidates">{data.totalCandidates}</Field>
              <Field label="HR accounts">{data.totalHr}</Field>
              <Field label="Admin accounts">{data.totalAdmins}</Field>
              <Field label="Active accounts">
                {data.activeUsers} of {data.totalUsers}
              </Field>
              <Field label="Average match score">
                {reports.data
                  ? `${Math.round(reports.data.averageMatchScore)}%`
                  : "—"}
              </Field>
            </div>
          </Panel>

          <Panel title="Users by role" aside>
            {roleTotal === 0 ? (
              <EmptyLine>No users yet.</EmptyLine>
            ) : (
              <BreakdownBar rows={roleRows} total={roleTotal} />
            )}
          </Panel>
        </div>

        {/* centre: audit feed */}
        <div className="lg:col-span-6">
          <Panel
            title="Recent activity"
            action={<PanelLink href="/admin/activity-logs">Full log</PanelLink>}
          >
            {data.recentActivity.length === 0 ? (
              <EmptyLine>
                No admin actions recorded yet — role changes, job closures,
                broadcasts and settings edits appear here.
              </EmptyLine>
            ) : (
              <div>
                {data.recentActivity.map((log) => {
                  const actor = populated(log.actorId);
                  return (
                    <FeedRow
                      key={log._id}
                      icon={
                        <ScrollText
                          aria-hidden="true"
                          className="h-3.5 w-3.5 text-violet-600"
                        />
                      }
                      iconClass="bg-violet-50"
                      title={humanizeAction(log.action)}
                      meta={formatDateTime(log.createdAt)}
                      detail={
                        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                          <span>{actor?.name ?? "Unknown actor"}</span>
                          <Chip>{log.actorRole}</Chip>
                          <span className="text-[#9698a2]">
                            {log.targetType}
                          </span>
                        </span>
                      }
                    />
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* right: health + application mix */}
        <div className="space-y-3 lg:col-span-3">
          <Panel title="System health" aside>
            {monitoring.error ? (
              <EmptyLine>Status unavailable.</EmptyLine>
            ) : monitoring.isLoading ? (
              <EmptyLine>Checking…</EmptyLine>
            ) : (
              <div className="space-y-3.5">
                <Field label="Database">
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${
                        dbUp ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {DB_STATES[monitoring.data?.dbState ?? -1] ?? "Unknown"}
                  </span>
                </Field>
                <Field label="API uptime">
                  {formatUptime(monitoring.data?.uptimeSeconds ?? 0)}
                </Field>
                <Field label="Open support tickets">
                  {monitoring.data?.openTicketCount ?? 0}
                </Field>
              </div>
            )}
            <div className="mt-3 border-t border-[#f1f1f5] pt-2.5">
              <PanelLink href="/admin/monitoring">Monitoring</PanelLink>
            </div>
          </Panel>

          <Panel title="Applications" aside>
            {statusTotal === 0 ? (
              <EmptyLine>No applications yet.</EmptyLine>
            ) : (
              <BreakdownBar rows={statusRows} total={statusTotal} />
            )}
          </Panel>

          <Panel title="Interviews" aside>
            <div className="space-y-3.5">
              <Field label="Sessions started">
                {data.totalInterviewSessions}
              </Field>
              <Field label="Completed">{data.completedInterviews}</Field>
              <Field label="Completion rate">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f3f3f6]">
                    <span
                      className="block h-full bg-[#7163df]"
                      style={{ width: `${completionRate}%` }}
                    />
                  </span>
                  {completionRate}%
                </span>
              </Field>
            </div>
          </Panel>
        </div>
      </div>

      {/* A failing side endpoint must not hide that it failed. */}
      {reports.error && (
        <ErrorBlock message={reports.error} onRetry={reports.reload} />
      )}
    </PortalPage>
  );
}
