"use client";

import { useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  ExternalLink,
  Plus,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listMyJobs, setJobStatus } from "@/lib/jobsApi";
import { useApiResource } from "@/lib/useApiResource";
import { JOB_STATUS_BADGE, JOB_STATUS_LABELS, formatDate } from "@/lib/format";
import {
  Button,
  EmptyState,
  ErrorBlock,
  PageHeader,
  SkeletonCard,
  SkillChips,
} from "@/components/ui";
import { PortalPage } from "@/components/dashboard/primitives";
import { QuestionPoolButton } from "./QuestionPoolIndex";

/** GET /api/jobs/mine — everything the Job schema stores for the HR user's postings. */
export function MyJobsList() {
  const { token } = useAuth();
  const [changingJobId, setChangingJobId] = useState<string | null>(null);
  const jobs = useApiResource((signal) => listMyJobs(token, signal), [token], {
    enabled: Boolean(token),
  });

  const changeJobStatus = async (jobId: string, status: "open" | "closed") => {
    setChangingJobId(jobId);
    try {
      const updated = await setJobStatus(jobId, status, token);
      jobs.setData((current) =>
        (current ?? []).map((job) => (job._id === updated._id ? updated : job)),
      );
    } finally {
      setChangingJobId(null);
    }
  };

  return (
    <PortalPage>
      <PageHeader
        title="My jobs"
        description="Every job you've posted, newest first."
        icon={<BriefcaseBusiness />}
        action={
          <Button
            href="/recruiter/jobs/create"
            leadingIcon={<Plus aria-hidden="true" />}
          >
            Create job
          </Button>
        }
      />

      {jobs.isLoading ? (
        <div
          role="status"
          aria-label="Loading your jobs…"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6"
        >
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      ) : jobs.error ? (
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      ) : (jobs.data ?? []).length === 0 ? (
        <EmptyState
          icon={<BriefcaseBusiness />}
          title="You haven't posted any jobs yet."
          description="Post one and candidates can start applying immediately."
          action={
            <Button
              href="/recruiter/jobs/create"
              leadingIcon={<Plus aria-hidden="true" />}
            >
              Create your first job
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {(jobs.data ?? []).map((job) => (
            <article
              key={job._id}
              className="flex min-w-0 flex-col rounded-xl border border-line bg-surface shadow-xs transition-colors hover:border-brand-200"
            >
              <div className="flex-1 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:flex"
                  >
                    <BriefcaseBusiness className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-ink">
                      {job.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">
                      Posted {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <span className={JOB_STATUS_BADGE[job.status]}>
                    {JOB_STATUS_LABELS[job.status]}
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 whitespace-pre-line text-sm text-muted">
                  {job.description}
                </p>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-muted">
                    Required skills ({job.requiredSkills.length})
                  </p>
                  <SkillChips skills={job.requiredSkills} />
                </div>

                {job.jdRawText && <JdRawText text={job.jdRawText} />}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-line-soft px-5 py-3 sm:px-6">
                <Button
                  variant="soft"
                  size="sm"
                  href={`/recruiter/applicants?jobId=${job._id}`}
                  leadingIcon={<Users aria-hidden="true" />}
                >
                  View applicants
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  href={`/recruiter/reports?jobId=${job._id}`}
                  leadingIcon={<BarChart3 aria-hidden="true" />}
                >
                  Interview reports
                </Button>
                <QuestionPoolButton jobId={job._id} />
                <Button
                  variant={job.status === "open" ? "danger-soft" : "soft"}
                  size="sm"
                  onClick={() =>
                    changeJobStatus(
                      job._id,
                      job.status === "open" ? "closed" : "open",
                    )
                  }
                  loading={changingJobId === job._id}
                  disabled={changingJobId !== null}
                >
                  {job.status === "open" ? "Close opening" : "Reopen job"}
                </Button>
                {job.jdFileUrl && (
                  <a
                    href={job.jdFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    JD file
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </PortalPage>
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
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {isOpen ? "Hide" : "Show"} extracted JD text (
        {text.length.toLocaleString()} chars)
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-line-soft bg-surface-2 p-4 font-sans text-xs leading-relaxed text-body">
          {text}
        </pre>
      )}
    </div>
  );
}
