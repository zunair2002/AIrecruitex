"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listMyApplications } from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUSES,
  populated,
  type Application,
  type ApplicationStatus,
} from "@/lib/types";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  formatDate,
  formatDateTime,
  scoreColor,
} from "@/lib/format";
import {
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  SkillChips,
} from "@/components/ui/Feedback";
import { compactInputClass, primaryButtonClass } from "@/components/ui/controls";

const ALL = "all";

export function MyApplications() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | typeof ALL>(ALL);

  const applications = useApiResource(
    (signal) => listMyApplications(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  const filtered = useMemo(() => {
    const list = applications.data ?? [];
    return statusFilter === ALL
      ? list
      : list.filter((item) => item.status === statusFilter);
  }, [applications.data, statusFilter]);

  return (
    <div className="p-8">
      <PageHeader
        title="My Applications"
        description="Match score, HR decision, and any interview HR has scheduled for you."
        action={
          <Link href="/candidate/jobs" className={`${primaryButtonClass} text-sm`}>
            Browse jobs
          </Link>
        }
      />

      {applications.isLoading ? (
        <LoadingBlock label="Loading your applications…" />
      ) : applications.error ? (
        <ErrorBlock message={applications.error} onRetry={applications.reload} />
      ) : (applications.data ?? []).length === 0 ? (
        <EmptyState
          title="You haven't applied to any jobs yet."
          description="Upload your resume, then apply from the job board — your match score is computed on apply."
          action={
            <Link href="/candidate/jobs" className={`${primaryButtonClass} text-sm`}>
              Browse open jobs
            </Link>
          }
        />
      ) : (
        <>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ApplicationStatus | typeof ALL)
            }
            className={`${compactInputClass} mb-6`}
          >
            <option value={ALL}>All statuses</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {APPLICATION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <div className="space-y-5">
            {filtered.map((application) => (
              <ApplicationCard key={application._id} application={application} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-gray-500">
              No {APPLICATION_STATUS_LABELS[statusFilter as ApplicationStatus]?.toLowerCase()}{" "}
              applications.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const job = populated(application.jobId);
  const { aiInterview, orgInterview } = application;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900">
            {job?.title ?? "Job no longer available"}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Applied {formatDate(application.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-2xl font-bold ${scoreColor(application.matchScore)}`}>
              {application.matchScore}%
            </p>
            <p className="text-xs text-gray-500">Match score</p>
          </div>
          <span className={APPLICATION_STATUS_BADGE[application.status]}>
            {APPLICATION_STATUS_LABELS[application.status]}
          </span>
        </div>
      </div>

      {job?.description && (
        <p className="mt-4 line-clamp-3 whitespace-pre-line text-sm text-gray-600">
          {job.description}
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Shortlisting
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {application.matched
              ? "Met the match threshold"
              : "Below the match threshold"}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
            Matched skills ({application.resumeSnapshotSkills.length})
          </p>
          <SkillChips
            skills={application.resumeSnapshotSkills}
            emptyLabel="None of the required skills were found in your resume."
          />
        </div>
      </div>

      {aiInterview.scheduled && (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
            AI interview scheduled
          </p>
          <p className="mt-2 text-sm text-indigo-900">
            {formatDateTime(aiInterview.dateTime)}
          </p>
          {aiInterview.message && (
            <p className="mt-2 text-sm text-indigo-800">{aiInterview.message}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            {application.interviewSessionId && (
              <Link
                href={`/candidate/interview/session/${application.interviewSessionId}`}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Open AI interview
              </Link>
            )}
            {aiInterview.calendarLink && (
              <a
                href={aiInterview.calendarLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-indigo-200 bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
              >
                Add to Google Calendar
              </a>
            )}
          </div>
        </div>
      )}

      {orgInterview.scheduled && (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            On-site / organisation interview
          </p>
          <p className="mt-2 text-sm text-emerald-900">
            {formatDateTime(orgInterview.dateTime)}
          </p>
          {orgInterview.location && (
            <p className="mt-1 text-sm text-emerald-900">
              Location: {orgInterview.location}
            </p>
          )}
          {orgInterview.notes && (
            <p className="mt-2 text-sm text-emerald-800">{orgInterview.notes}</p>
          )}
        </div>
      )}
    </Card>
  );
}
