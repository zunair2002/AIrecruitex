"use client";

import { BriefcaseBusiness, CloudUpload, ListChecks, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getQuestionSet, listMyJobs } from "@/lib/jobsApi";
import { useApiResource } from "@/lib/useApiResource";
import { JOB_STATUS_BADGE, JOB_STATUS_LABELS, formatDate } from "@/lib/format";
import type { Job, ObjectId } from "@/lib/types";
import {
  Badge,
  Button,
  EmptyState,
  ErrorBlock,
  PageHeader,
  SkeletonCard,
} from "@/components/ui";
import { PortalPage } from "@/components/dashboard/primitives";

/** GET /api/jobs/:jobId/interview-questions for one job (null = no pool yet). */
function useJobQuestionPool(jobId: ObjectId) {
  const { token } = useAuth();
  return useApiResource(
    (signal) => getQuestionSet(jobId, token, signal),
    [jobId, token],
    { enabled: Boolean(token) },
  );
}

/**
 * The job card's entry point to its question pool. Without a pool it becomes a
 * primary "Upload question pool" call to action, since organisational interview
 * invites are blocked until one exists.
 */
export function QuestionPoolButton({ jobId }: { jobId: ObjectId }) {
  const pool = useJobQuestionPool(jobId);
  const count = pool.data?.questions?.length ?? 0;
  const href = `/recruiter/jobs/${jobId}/questions`;

  if (!pool.isLoading && !pool.error && count === 0) {
    return (
      <Button
        size="sm"
        href={href}
        leadingIcon={<CloudUpload aria-hidden="true" />}
      >
        Upload question pool
      </Button>
    );
  }
  return (
    <Button
      variant="soft"
      size="sm"
      href={href}
      leadingIcon={<ListChecks aria-hidden="true" />}
    >
      Question pool{count > 0 ? ` (${count})` : ""}
    </Button>
  );
}

function PoolRow({ job }: { job: Job }) {
  const pool = useJobQuestionPool(job._id);
  const questions = pool.data?.questions ?? [];
  const perInterview = pool.data?.questionsPerInterview || questions.length;
  const hasPool = questions.length > 0;

  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
      <span
        aria-hidden="true"
        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:flex"
      >
        <BriefcaseBusiness className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink">{job.title}</p>
          <span className={JOB_STATUS_BADGE[job.status]}>
            {JOB_STATUS_LABELS[job.status]}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>Posted {formatDate(job.createdAt)}</span>
          {pool.isLoading ? (
            <Badge tone="neutral">Checking pool…</Badge>
          ) : pool.error ? (
            <Badge tone="danger">Couldn&apos;t load pool</Badge>
          ) : hasPool ? (
            <Badge tone="success" dot>
              {questions.length} question{questions.length === 1 ? "" : "s"} ·{" "}
              {perInterview} per candidate
            </Badge>
          ) : (
            <Badge tone="warning" dot>
              No pool yet · invites blocked
            </Badge>
          )}
        </div>
      </div>
      <Button
        variant={hasPool || pool.isLoading ? "secondary" : "primary"}
        size="sm"
        href={`/recruiter/jobs/${job._id}/questions`}
        leadingIcon={
          hasPool ? (
            <ListChecks aria-hidden="true" />
          ) : (
            <CloudUpload aria-hidden="true" />
          )
        }
        className="self-start sm:self-center"
      >
        {hasPool ? "View / replace pool" : "Upload pool"}
      </Button>
    </li>
  );
}

/**
 * /recruiter/question-pool — every job with its organisational interview
 * question pool status, linking to the per-job upload page.
 */
export function QuestionPoolIndex() {
  const { token } = useAuth();
  const jobs = useApiResource((signal) => listMyJobs(token, signal), [token], {
    enabled: Boolean(token),
  });

  return (
    <PortalPage>
      <PageHeader
        title="Question pool"
        description="Upload each job's interview questions file (PDF or DOCX). Organisational interviews are drawn from it, and candidates can only be invited once a job has a pool."
        icon={<ListChecks />}
      />

      {jobs.isLoading ? (
        <div role="status" aria-label="Loading your jobs…" className="space-y-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : jobs.error ? (
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      ) : (jobs.data ?? []).length === 0 ? (
        <EmptyState
          icon={<BriefcaseBusiness />}
          title="You haven't posted any jobs yet."
          description="Create a job first, then upload its interview questions here."
          action={
            <Button
              href="/recruiter/jobs/create"
              leadingIcon={<Plus aria-hidden="true" />}
            >
              Create job
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-line-soft overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
          {(jobs.data ?? []).map((job) => (
            <PoolRow key={job._id} job={job} />
          ))}
        </ul>
      )}
    </PortalPage>
  );
}
