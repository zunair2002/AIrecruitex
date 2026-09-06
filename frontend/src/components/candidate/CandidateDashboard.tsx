"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { listMyApplications } from "@/lib/applicationsApi";
import { listOpenJobs } from "@/lib/jobsApi";
import { listMyNotifications } from "@/lib/notificationsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  formatDate,
  formatDateTime,
  scoreColor,
} from "@/lib/format";
import { populated } from "@/lib/types";
import {
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatCard,
} from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";

export function CandidateDashboard() {
  const { user, token } = useAuth();
  const enabled = Boolean(token);

  const applications = useApiResource(
    (signal) => listMyApplications(token, signal),
    [token],
    { enabled },
  );
  const jobs = useApiResource(
    (signal) => listOpenJobs(token, signal),
    [token],
    { enabled },
  );
  const notifications = useApiResource(
    (signal) => listMyNotifications(token, signal),
    [token],
    { enabled },
  );

  const summary = useMemo(() => {
    const list = applications.data ?? [];
    const scored = list.filter((item) => typeof item.matchScore === "number");
    return {
      total: list.length,
      matched: list.filter((item) => item.matched).length,
      selected: list.filter((item) => item.status === "selected").length,
      pending: list.filter((item) => item.status === "pending").length,
      averageMatch: scored.length
        ? Math.round(
            scored.reduce((sum, item) => sum + item.matchScore, 0) / scored.length,
          )
        : 0,
      upcoming: list.filter(
        (item) => item.aiInterview.scheduled || item.orgInterview.scheduled,
      ),
    };
  }, [applications.data]);

  const unread = (notifications.data ?? []).filter((n) => !n.read);

  if (applications.isLoading) {
    return <LoadingBlock label="Loading your dashboard…" />;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description={
          user
            ? `Welcome back, ${user.name}. Here's where your applications stand.`
            : "Here's where your applications stand."
        }
        action={
          <Link href="/candidate/jobs" className={`${primaryButtonClass} text-sm`}>
            Browse jobs
          </Link>
        }
      />

      {applications.error && (
        <div className="mb-6">
          <ErrorBlock message={applications.error} onRetry={applications.reload} />
        </div>
      )}

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard
          label="Applications"
          value={summary.total}
          sub={`${summary.pending} pending`}
          icon="📨"
        />
        <StatCard
          label="Above match threshold"
          value={summary.matched}
          sub={`Avg match ${summary.averageMatch}%`}
          icon="🎯"
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          label="Selected by HR"
          value={summary.selected}
          sub={`${summary.upcoming.length} interview${summary.upcoming.length === 1 ? "" : "s"} scheduled`}
          icon="⭐"
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          label="Open jobs"
          value={jobs.data?.length ?? 0}
          sub={unread.length ? `${unread.length} unread notifications` : "All caught up"}
          icon="💼"
          gradient="from-sky-500 to-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card
          title="Recent applications"
          action={
            <Link
              href="/candidate/applications"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all
            </Link>
          }
        >
          {(applications.data ?? []).length === 0 ? (
            <EmptyState
              title="No applications yet."
              description="Upload your resume and apply from the job board."
            />
          ) : (
            <div className="space-y-3">
              {(applications.data ?? []).slice(0, 5).map((application) => (
                <div
                  key={application._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {populated(application.jobId)?.title ?? "Job removed"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Applied {formatDate(application.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`text-sm font-bold ${scoreColor(application.matchScore)}`}
                    >
                      {application.matchScore}%
                    </span>
                    <span className={APPLICATION_STATUS_BADGE[application.status]}>
                      {APPLICATION_STATUS_LABELS[application.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Scheduled interviews"
          action={
            <Link
              href="/candidate/interview/result"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Past results
            </Link>
          }
        >
          {summary.upcoming.length === 0 ? (
            <EmptyState
              title="Nothing scheduled."
              description="HR schedules AI and on-site interviews from your application."
            />
          ) : (
            <div className="space-y-3">
              {summary.upcoming.map((application) => (
                <div
                  key={application._id}
                  className="rounded-xl border border-indigo-100 bg-indigo-50 p-4"
                >
                  <p className="text-sm font-semibold text-indigo-900">
                    {populated(application.jobId)?.title ?? "Job removed"}
                  </p>
                  {application.aiInterview.scheduled && (
                    <p className="mt-1 text-xs text-indigo-800">
                      AI interview · {formatDateTime(application.aiInterview.dateTime)}
                    </p>
                  )}
                  {application.orgInterview.scheduled && (
                    <p className="mt-1 text-xs text-emerald-800">
                      On-site · {formatDateTime(application.orgInterview.dateTime)}
                      {application.orgInterview.location
                        ? ` · ${application.orgInterview.location}`
                        : ""}
                    </p>
                  )}
                  {application.interviewSessionId && (
                    <Link
                      href={`/candidate/interview/session/${application.interviewSessionId}`}
                      className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Open AI interview →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
