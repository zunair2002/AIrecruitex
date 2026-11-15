"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listMyJobs } from "@/lib/jobsApi";
import { useApiResource } from "@/lib/useApiResource";
import { JOB_STATUS_BADGE, JOB_STATUS_LABELS, formatDate } from "@/lib/format";
import {
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  SkillChips,
} from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";

/** GET /api/jobs/mine — everything the Job schema stores for the HR user's postings. */
export function MyJobsList() {
  const { token } = useAuth();
  const jobs = useApiResource((signal) => listMyJobs(token, signal), [token], {
    enabled: Boolean(token),
  });

  return (
    <div className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <PageHeader
        title="My Jobs"
        description="Every job you've posted, newest first."
        action={
          <Link
            href="/recruiter/jobs/create"
            className={`${primaryButtonClass} text-sm`}
          >
            Create job
          </Link>
        }
      />

      {jobs.isLoading ? (
        <LoadingBlock label="Loading your jobs…" />
      ) : jobs.error ? (
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      ) : (jobs.data ?? []).length === 0 ? (
        <EmptyState
          title="You haven't posted any jobs yet."
          description="Post one and candidates can start applying immediately."
          action={
            <Link
              href="/recruiter/jobs/create"
              className={`${primaryButtonClass} text-sm`}
            >
              Create your first job
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {(jobs.data ?? []).map((job) => (
            <Card key={job._id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#292b35]">
                    {job.title}
                  </h2>
                  <p className="mt-1 text-xs text-[#898b96]">
                    Posted {formatDate(job.createdAt)}
                  </p>
                </div>
                <span className={JOB_STATUS_BADGE[job.status]}>
                  {JOB_STATUS_LABELS[job.status]}
                </span>
              </div>

              <p className="mt-4 line-clamp-3 whitespace-pre-line text-sm text-[#686b77]">
                {job.description}
              </p>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#898b96]">
                  Required skills ({job.requiredSkills.length})
                </p>
                <SkillChips skills={job.requiredSkills} />
              </div>

              {job.jdRawText && <JdRawText text={job.jdRawText} />}

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link
                  href={`/recruiter/applicants?jobId=${job._id}`}
                  className="text-sm font-semibold text-brand hover:text-brand-dark"
                >
                  View applicants →
                </Link>
                <Link
                  href={`/recruiter/reports?jobId=${job._id}`}
                  className="text-sm font-semibold text-brand hover:text-brand-dark"
                >
                  Interview reports →
                </Link>
                <Link
                  href={`/recruiter/jobs/${job._id}/questions`}
                  className="text-sm font-semibold text-brand hover:text-brand-dark"
                >
                  Question pool →
                </Link>
                {job.jdFileUrl && (
                  <a
                    href={job.jdFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-[#898b96] hover:text-[#292b35]"
                  >
                    JD file
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The text the backend extracted from the uploaded JD file (`jdRawText`).
 * It's what required skills are suggested from, so it's worth being able to
 * check — but it's long and unformatted, hence collapsed by default.
 */
function JdRawText({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="text-xs font-semibold text-brand hover:text-brand-dark"
      >
        {isOpen ? "Hide" : "Show"} extracted JD text (
        {text.length.toLocaleString()} chars)
      </button>
      {isOpen && (
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-[#f8f8fb] p-4 text-xs leading-relaxed text-[#686b77]">
          {text}
        </pre>
      )}
    </div>
  );
}
