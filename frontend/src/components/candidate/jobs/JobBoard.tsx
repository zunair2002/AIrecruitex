"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { listOpenJobs } from "@/lib/jobsApi";
import { applyToJob, listMyApplications } from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDate } from "@/lib/format";
import { refId, type Job, type ObjectId } from "@/lib/types";
import {
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
  SkillChips,
} from "@/components/ui/Feedback";
import { compactInputClass, smallButtonClass } from "@/components/ui/controls";

export function JobBoard() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [applyingId, setApplyingId] = useState<ObjectId | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const jobs = useApiResource(
    (signal) => listOpenJobs(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  // Used to mark jobs the candidate already applied to — the backend answers a
  // repeat apply with 409, so the button is disabled up front instead.
  const applications = useApiResource(
    (signal) => listMyApplications(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  const appliedJobIds = useMemo(() => {
    const ids = new Set<string>();
    for (const application of applications.data ?? []) {
      const id = refId(application.jobId);
      if (id) ids.add(id);
    }
    return ids;
  }, [applications.data]);

  const handleApply = useCallback(
    async (jobId: ObjectId) => {
      setApplyingId(jobId);
      setApplyError(null);
      try {
        await applyToJob(jobId, token);
        applications.reload();
      } catch (error) {
        setApplyError(toErrorMessage(error));
      } finally {
        setApplyingId(null);
      }
    },
    [token, applications],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return jobs.data ?? [];
    return (jobs.data ?? []).filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.requiredSkills.some((skill) => skill.includes(query)),
    );
  }, [jobs.data, search]);

  return (
    <div className="p-8">
      <PageHeader
        title="Job Board"
        description="Every open role. Applying scores your uploaded resume against the job's required skills."
      />

      {applyError && (
        <div className="mb-6">
          <InlineError message={applyError} />
        </div>
      )}

      {jobs.isLoading ? (
        <LoadingBlock label="Loading open jobs…" />
      ) : jobs.error ? (
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      ) : (jobs.data ?? []).length === 0 ? (
        <EmptyState
          title="No open jobs right now."
          description="Check back later — HR postings appear here as soon as they go live."
        />
      ) : (
        <>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, description or skill…"
            className={`${compactInputClass} mb-6 w-full`}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                hasApplied={appliedJobIds.has(job._id)}
                isApplying={applyingId === job._id}
                onApply={() => handleApply(job._id)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-gray-500">
              No jobs match “{search}”.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function JobCard({
  job,
  hasApplied,
  isApplying,
  onApply,
}: {
  job: Job;
  hasApplied: boolean;
  isApplying: boolean;
  onApply: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
          <p className="mt-1 text-xs text-gray-500">
            Posted {formatDate(job.createdAt)}
          </p>
        </div>
        {hasApplied ? (
          <Link
            href="/candidate/applications"
            className="shrink-0 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
          >
            Applied
          </Link>
        ) : (
          <button
            type="button"
            onClick={onApply}
            disabled={isApplying}
            className={`${smallButtonClass} shrink-0`}
          >
            {isApplying ? "Applying…" : "Apply"}
          </button>
        )}
      </div>

      <p
        className={`mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600 ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {job.description}
      </p>
      {job.description.length > 220 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Required skills ({job.requiredSkills.length})
        </p>
        <SkillChips skills={job.requiredSkills} />
      </div>

      {job.jdFileUrl && (
        <a
          href={job.jdFileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Download job description
        </a>
      )}
    </Card>
  );
}
