"use client";

import { useAuth } from "@/context/AuthContext";
import { getReportsSummary } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUS_LABELS,
  JOB_STATUS_LABELS,
  ROLE_LABELS,
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

/** GET /api/admin/reports/summary — the four aggregates the service returns. */
export function AdminReports() {
  const { token } = useAuth();
  const summary = useApiResource(
    (signal) => getReportsSummary(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  if (summary.isLoading) return <LoadingBlock label="Loading reports…" />;
  if (summary.error) {
    return (
      <div className="p-8">
        <ErrorBlock message={summary.error} onRetry={summary.reload} />
      </div>
    );
  }
  const data = summary.data;
  if (!data) return null;

  return (
    <div className="p-8">
      <PageHeader
        title="Reports"
        description="Aggregate counts straight from the backend's report pipeline."
      />

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatCard
          label="Average match score"
          value={`${Math.round(data.averageMatchScore)}%`}
          sub="Across every application"
          icon="🎯"
        />
        <StatCard
          label="Total applications"
          value={data.applicationsByStatus.reduce((sum, b) => sum + b.count, 0)}
          sub="Sum of all status buckets"
          icon="📨"
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <BucketCard
          title="Users by role"
          buckets={data.usersByRole}
          labels={ROLE_LABELS}
          gradient="from-sky-500 to-blue-600"
        />
        <BucketCard
          title="Applications by status"
          buckets={data.applicationsByStatus}
          labels={APPLICATION_STATUS_LABELS}
          gradient="from-indigo-500 to-indigo-600"
        />
        <BucketCard
          title="Jobs by status"
          buckets={data.jobsByStatus}
          labels={JOB_STATUS_LABELS}
          gradient="from-emerald-500 to-emerald-600"
        />
      </div>
    </div>
  );
}

function BucketCard<T extends UserRole | ApplicationStatus | JobStatus>({
  title,
  buckets,
  labels,
  gradient,
}: {
  title: string;
  buckets: CountBucket<T>[];
  labels: Record<T, string>;
  gradient: string;
}) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <Card title={title}>
      {buckets.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">No data yet.</p>
      ) : (
        <div className="space-y-4">
          {buckets.map((bucket) => {
            const percent = total ? Math.round((bucket.count / total) * 100) : 0;
            return (
              <div key={String(bucket._id)}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {labels[bucket._id] ?? String(bucket._id)}
                  </span>
                  <span className="font-bold text-gray-900">
                    {bucket.count}
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      {percent}%
                    </span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="pt-2 text-xs text-gray-400">Total: {total}</p>
        </div>
      )}
    </Card>
  );
}
