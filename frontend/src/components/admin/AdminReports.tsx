"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  Target,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getReportsSummary } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUS_LABELS,
  BADGE_DOTS,
  JOB_STATUS_LABELS,
  ROLE_LABELS,
  statusTone,
} from "@/lib/format";
import type {
  ApplicationStatus,
  CountBucket,
  JobStatus,
  UserRole,
} from "@/lib/types";
import {
  Card,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatCard,
} from "@/components/ui/Feedback";
import { EmptyLine, PortalPage } from "@/components/dashboard/primitives";

const ROLE_COLORS: Record<string, string> = {
  candidate: "bg-chart-1",
  hr: "bg-chart-2",
  admin: "bg-chart-3",
};

const sum = (buckets: CountBucket<string>[]) =>
  buckets.reduce((total, bucket) => total + bucket.count, 0);

/** GET /api/admin/reports/summary — the four aggregates the service returns. */
export function AdminReports() {
  const { token } = useAuth();
  const summary = useApiResource(
    (signal) => getReportsSummary(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  if (summary.isLoading) {
    return (
      <PortalPage>
        <LoadingBlock label="Loading reports…" />
      </PortalPage>
    );
  }
  if (summary.error) {
    return (
      <PortalPage>
        <ErrorBlock message={summary.error} onRetry={summary.reload} />
      </PortalPage>
    );
  }
  const data = summary.data;
  if (!data) return null;

  return (
    <PortalPage>
      <PageHeader
        icon={<BarChart3 />}
        title="Reports"
        description="Aggregate counts straight from the backend's report pipeline."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Average match score"
          value={`${Math.round(data.averageMatchScore)}%`}
          sub="Across every application"
          icon={<Target />}
          tone="brand"
        />
        <StatCard
          label="Total applications"
          value={sum(data.applicationsByStatus)}
          sub="Sum of all status buckets"
          icon={<ClipboardList />}
          tone="warning"
        />
        <StatCard
          label="Total users"
          value={sum(data.usersByRole)}
          sub="Every role combined"
          icon={<Users />}
          tone="info"
        />
        <StatCard
          label="Total jobs"
          value={sum(data.jobsByStatus)}
          sub="Open and closed"
          icon={<BriefcaseBusiness />}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <BucketCard
          title="Users by role"
          buckets={data.usersByRole}
          labels={ROLE_LABELS}
          colorFor={(id) => ROLE_COLORS[id] ?? "bg-chart-6"}
        />
        <BucketCard
          title="Applications by status"
          buckets={data.applicationsByStatus}
          labels={APPLICATION_STATUS_LABELS}
          colorFor={(id) => BADGE_DOTS[statusTone(id)]}
        />
        <BucketCard
          title="Jobs by status"
          buckets={data.jobsByStatus}
          labels={JOB_STATUS_LABELS}
          colorFor={(id) => BADGE_DOTS[statusTone(id, "job")]}
        />
      </div>
    </PortalPage>
  );
}

function BucketCard<T extends UserRole | ApplicationStatus | JobStatus>({
  title,
  buckets,
  labels,
  colorFor,
}: {
  title: string;
  buckets: CountBucket<T>[];
  labels: Record<T, string>;
  colorFor: (id: string) => string;
  gradient?: string;
}) {
  const total = buckets.reduce((acc, bucket) => acc + bucket.count, 0);

  return (
    <Card
      title={title}
      description={
        <span className="tabular-nums">
          {total} total
        </span>
      }
    >
      {buckets.length === 0 ? (
        <EmptyLine>No data yet.</EmptyLine>
      ) : (
        <ul className="space-y-4">
          {buckets.map((bucket) => {
            const percent = total ? Math.round((bucket.count / total) * 100) : 0;
            const color = colorFor(String(bucket._id));
            return (
              <li key={String(bucket._id)}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-body">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`}
                    />
                    <span className="truncate">
                      {labels[bucket._id] ?? String(bucket._id)}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink">
                    {bucket.count}
                    <span className="ml-1.5 text-xs font-normal text-muted">
                      {percent}%
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
