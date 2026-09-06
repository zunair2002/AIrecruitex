"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getDashboardOverview } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDateTime, humanizeAction } from "@/lib/format";
import { populated } from "@/lib/types";
import {
  Card,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatCard,
} from "@/components/ui/Feedback";

/** GET /api/admin/dashboard — every counter the service returns, plus its feed. */
export function AdminDashboard() {
  const { user, token } = useAuth();
  const overview = useApiResource(
    (signal) => getDashboardOverview(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  if (overview.isLoading) return <LoadingBlock label="Loading platform overview…" />;
  if (overview.error) {
    return (
      <div className="p-8">
        <ErrorBlock message={overview.error} onRetry={overview.reload} />
      </div>
    );
  }
  const data = overview.data;
  if (!data) return null;

  return (
    <div className="p-8">
      <PageHeader
        title="Platform Overview"
        description={
          user ? `Signed in as ${user.name}.` : "Platform-wide counts and activity."
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={data.totalUsers}
          sub={`${data.activeUsers} active`}
          icon="👥"
        />
        <StatCard
          label="Candidates"
          value={data.totalCandidates}
          sub={`${data.totalHr} HR · ${data.totalAdmins} admin`}
          icon="🎓"
          gradient="from-sky-500 to-blue-600"
        />
        <StatCard
          label="Jobs"
          value={data.totalJobs}
          sub={`${data.openJobs} open`}
          icon="💼"
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          label="Applications"
          value={data.totalApplications}
          sub={`${data.matchedApplications} above threshold`}
          icon="📨"
          gradient="from-emerald-500 to-emerald-600"
        />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatCard
          label="Interview sessions"
          value={data.totalInterviewSessions}
          sub={`${data.completedInterviews} completed`}
          icon="🎤"
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          label="Completion rate"
          value={
            data.totalInterviewSessions
              ? `${Math.round((data.completedInterviews / data.totalInterviewSessions) * 100)}%`
              : "—"
          }
          sub="Sessions finished vs started"
          icon="✅"
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      <Card
        title="Recent activity"
        action={
          <Link
            href="/admin/activity-logs"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Full log
          </Link>
        }
      >
        {data.recentActivity.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No admin actions have been recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((log) => {
              const actor = populated(log.actorId);
              return (
                <div
                  key={log._id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {humanizeAction(log.action)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {actor?.name ?? "Unknown actor"} ({log.actorRole}) ·{" "}
                      {log.targetType}
                      {log.targetId ? ` ${log.targetId}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-gray-400">
                    {formatDateTime(log.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
