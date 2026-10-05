"use client";

import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  closeJob,
  deleteJob,
  listAllApplications,
  listAllJobs,
} from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { populated, type ObjectId } from "@/lib/types";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  ORG_INTERVIEW_STATUS_LABELS,
  JOB_STATUS_BADGE,
  JOB_STATUS_LABELS,
  formatDate,
  scoreColor,
} from "@/lib/format";
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
  SkillChips,
} from "@/components/ui/Feedback";
import {
  compactInputClass,
  dangerButtonClass,
  smallButtonClass,
} from "@/components/ui/controls";

type Tab = "jobs" | "applications";

/**
 * GET /api/admin/content/jobs + /applications, with the two job mutations the
 * backend exposes: PATCH /jobs/:jobId/close and DELETE /jobs/:jobId.
 */
export function ContentManagement() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>("jobs");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<ObjectId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const jobs = useApiResource(
    (signal) => listAllJobs(token, signal),
    [token],
    { enabled: Boolean(token) },
  );
  const applications = useApiResource(
    (signal) => listAllApplications(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  const runMutation = useCallback(
    async (jobId: ObjectId, action: () => Promise<unknown>) => {
      setBusyId(jobId);
      setError(null);
      try {
        await action();
        jobs.reload();
        applications.reload();
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        setBusyId(null);
      }
    },
    [jobs, applications],
  );

  const query = search.trim().toLowerCase();

  const filteredJobs = useMemo(() => {
    const list = jobs.data ?? [];
    if (!query) return list;
    return list.filter((job) => {
      const hr = populated(job.hrId);
      return (
        job.title.toLowerCase().includes(query) ||
        hr?.name.toLowerCase().includes(query) ||
        hr?.email.toLowerCase().includes(query)
      );
    });
  }, [jobs.data, query]);

  const filteredApplications = useMemo(() => {
    const list = applications.data ?? [];
    if (!query) return list;
    return list.filter((application) => {
      const candidate = populated(application.candidateId);
      const job = populated(application.jobId);
      return (
        candidate?.name.toLowerCase().includes(query) ||
        candidate?.email.toLowerCase().includes(query) ||
        job?.title.toLowerCase().includes(query)
      );
    });
  }, [applications.data, query]);

  return (
    <div className="p-8">
      <PageHeader
        title="Jobs &amp; Applications"
        description="Every job and application on the platform, across all HR accounts."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-full bg-gray-100 p-1">
          {(["jobs", "applications"] as Tab[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTab(option)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                tab === option
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {option === "jobs"
                ? `Jobs (${jobs.data?.length ?? 0})`
                : `Applications (${applications.data?.length ?? 0})`}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            tab === "jobs"
              ? "Search job title or HR owner…"
              : "Search candidate or job…"
          }
          className={`${compactInputClass} flex-1`}
        />
      </div>

      {error && (
        <div className="mb-6">
          <InlineError message={error} />
        </div>
      )}

      {tab === "jobs" ? (
        jobs.isLoading ? (
          <LoadingBlock label="Loading jobs…" />
        ) : jobs.error ? (
          <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
        ) : filteredJobs.length === 0 ? (
          <EmptyState title="No jobs found." />
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const hr = populated(job.hrId);
              return (
                <div
                  key={job._id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-bold text-gray-900">{job.title}</h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Posted by {hr?.name ?? "Unknown HR"}
                        {hr?.email ? ` (${hr.email})` : ""} ·{" "}
                        {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <span className={JOB_STATUS_BADGE[job.status]}>
                      {JOB_STATUS_LABELS[job.status]}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 whitespace-pre-line text-sm text-gray-600">
                    {job.description}
                  </p>

                  <div className="mt-3">
                    <SkillChips skills={job.requiredSkills} tone="gray" />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {job.status === "open" && (
                      <button
                        type="button"
                        onClick={() =>
                          runMutation(job._id, () => closeJob(job._id, token))
                        }
                        disabled={busyId === job._id}
                        className={smallButtonClass}
                      >
                        Close job
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Permanently delete "${job.title}"? This cannot be undone.`,
                          )
                        ) {
                          runMutation(job._id, () => deleteJob(job._id, token));
                        }
                      }}
                      disabled={busyId === job._id}
                      className={dangerButtonClass}
                    >
                      Delete job
                    </button>
                    {job.jdFileUrl && (
                      <a
                        href={job.jdFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-gray-500 hover:text-gray-800"
                      >
                        JD file
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : applications.isLoading ? (
        <LoadingBlock label="Loading applications…" />
      ) : applications.error ? (
        <ErrorBlock message={applications.error} onRetry={applications.reload} />
      ) : filteredApplications.length === 0 ? (
        <EmptyState title="No applications found." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Candidate</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Job</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Match</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Interviews</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Applied</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => {
                  const candidate = populated(application.candidateId);
                  const job = populated(application.jobId);
                  return (
                    <tr
                      key={application._id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {candidate?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {candidate?.email ?? "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {job?.title ?? "Job deleted"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold ${scoreColor(application.matchScore)}`}
                        >
                          {application.matchScore}%
                        </span>
                        <p className="text-xs text-gray-400">
                          {application.matched ? "Matched" : "Below threshold"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={APPLICATION_STATUS_BADGE[application.status]}
                        >
                          {APPLICATION_STATUS_LABELS[application.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {application.aiInterview.scheduled ? "AI ✓" : "AI —"}
                        {" · "}
                        {application.orgInterview?.status
                          ? `Org ${ORG_INTERVIEW_STATUS_LABELS[application.orgInterview.status]}`
                          : "Org —"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(application.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
