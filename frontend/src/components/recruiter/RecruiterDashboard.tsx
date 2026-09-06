"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { listMyJobs } from "@/lib/jobsApi";
import { listApplicationsForJob } from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  JOB_STATUS_BADGE,
  JOB_STATUS_LABELS,
  formatDate,
  scoreColor,
} from "@/lib/format";
import { populated, type Application, type Job } from "@/lib/types";
import {
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatCard,
} from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";

type JobWithApplications = { job: Job; applications: Application[] };

/**
 * The backend has no HR-wide aggregate endpoint, so the pipeline is assembled
 * from GET /api/jobs/mine plus GET /api/applications/job/:jobId per job — the
 * same data the applicants screen shows, counted.
 */
export function RecruiterDashboard() {
  const { user, token } = useAuth();
  const jobs = useApiResource(
    (signal) => listMyJobs(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  // One applicants request per job — the backend scopes applicants to a job, so
  // there is no single endpoint that returns an HR user's whole pipeline.
  const pipeline = useApiResource<JobWithApplications[]>(
    async (signal) =>
      Promise.all(
        (jobs.data ?? []).map(async (job) => {
          try {
            return {
              job,
              applications: await listApplicationsForJob(job._id, token, signal),
            };
          } catch {
            // One unreadable job shouldn't blank the whole dashboard.
            return { job, applications: [] as Application[] };
          }
        }),
      ),
    [jobs.data, token],
    { enabled: Boolean(token && jobs.data) },
  );

  const rows = useMemo(() => pipeline.data ?? [], [pipeline.data]);
  const isLoadingApplications = pipeline.isLoading;

  const summary = useMemo(() => {
    const all = rows.flatMap((row) => row.applications);
    return {
      totalJobs: rows.length,
      openJobs: rows.filter((row) => row.job.status === "open").length,
      totalApplicants: all.length,
      matched: all.filter((item) => item.matched).length,
      selected: all.filter((item) => item.status === "selected").length,
      pending: all.filter((item) => item.status === "pending").length,
      aiInterviews: all.filter((item) => item.aiInterview.scheduled).length,
      recent: [...all]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    };
  }, [rows]);

  if (jobs.isLoading) return <LoadingBlock label="Loading your dashboard…" />;
  if (jobs.error) {
    return (
      <div className="p-8">
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        title="HR Dashboard"
        description={
          user
            ? `Welcome back, ${user.name}. Here's your hiring pipeline.`
            : "Here's your hiring pipeline."
        }
        action={
          <Link href="/recruiter/jobs/create" className={`${primaryButtonClass} text-sm`}>
            Create job
          </Link>
        }
      />

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard
          label="Jobs posted"
          value={summary.totalJobs}
          sub={`${summary.openJobs} open`}
          icon="💼"
        />
        <StatCard
          label="Applicants"
          value={summary.totalApplicants}
          sub={`${summary.pending} pending review`}
          icon="👥"
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          label="Above match threshold"
          value={summary.matched}
          sub={`${summary.aiInterviews} AI interviews scheduled`}
          icon="🎯"
          gradient="from-sky-500 to-blue-600"
        />
        <StatCard
          label="Selected"
          value={summary.selected}
          sub="Ready for an org interview"
          icon="⭐"
          gradient="from-emerald-500 to-emerald-600"
        />
      </div>

      {(jobs.data ?? []).length === 0 ? (
        <EmptyState
          title="You haven't posted any jobs yet."
          description="Post your first job and candidates can start applying right away."
          action={
            <Link href="/recruiter/jobs/create" className={`${primaryButtonClass} text-sm`}>
              Create your first job
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card
            title="Your job postings"
            action={
              <Link
                href="/recruiter/jobs"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View all
              </Link>
            }
          >
            <div className="space-y-3">
              {rows.slice(0, 5).map(({ job, applications }) => (
                <Link
                  key={job._id}
                  href={`/recruiter/applicants?jobId=${job._id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isLoadingApplications
                        ? "Counting applicants…"
                        : `${applications.length} applicant${applications.length === 1 ? "" : "s"}`}{" "}
                      · {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <span className={JOB_STATUS_BADGE[job.status]}>
                    {JOB_STATUS_LABELS[job.status]}
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          <Card
            title="Recent applicants"
            action={
              <Link
                href="/recruiter/applicants"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Review
              </Link>
            }
          >
            {isLoadingApplications ? (
              <LoadingBlock label="Loading applicants…" />
            ) : summary.recent.length === 0 ? (
              <EmptyState
                title="No applicants yet."
                description="They'll appear here as candidates apply to your jobs."
              />
            ) : (
              <div className="space-y-3">
                {summary.recent.map((application) => {
                  const candidate = populated(application.candidateId);
                  const job = rows.find((row) =>
                    row.applications.some((item) => item._id === application._id),
                  )?.job;
                  return (
                    <div
                      key={application._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {candidate?.name ?? "Unknown candidate"}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {job?.title ?? "—"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-bold ${scoreColor(application.matchScore)}`}
                        >
                          {application.matchScore}% match
                        </p>
                        <span
                          className={APPLICATION_STATUS_BADGE[application.status]}
                        >
                          {APPLICATION_STATUS_LABELS[application.status]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
