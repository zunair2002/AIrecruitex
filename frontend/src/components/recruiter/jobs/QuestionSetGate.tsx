"use client";

import { ListChecks } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listMyJobs } from "@/lib/jobsApi";
import { useApiResource } from "@/lib/useApiResource";
import type { ObjectId } from "@/lib/types";
import { ErrorBlock, LoadingBlock, PageHeader } from "@/components/ui/Feedback";
import { QuestionSetPanel } from "./QuestionSetPanel";

/**
 * Resolves the job title for the heading. The question-set endpoints are scoped
 * to jobs the caller owns, so a job id that isn't in /jobs/mine would 403 anyway.
 */
export function QuestionSetGate({ jobId }: { jobId: ObjectId }) {
  const { token } = useAuth();
  const jobs = useApiResource((signal) => listMyJobs(token, signal), [token], {
    enabled: Boolean(token),
  });

  const job = (jobs.data ?? []).find((item) => item._id === jobId);

  return (
    <>
      <PageHeader
        title="Organisational interview questions"
        description={
          job
            ? `${job.title} · asked when you invite a selected candidate to the organisational interview.`
            : "These questions are asked when you invite a selected candidate to the organisational interview."
        }
        icon={<ListChecks />}
        backHref="/recruiter/jobs"
        backLabel="Back to my jobs"
      />
      {jobs.isLoading ? (
        <LoadingBlock label="Loading job…" />
      ) : jobs.error ? (
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      ) : !job ? (
        <ErrorBlock message="That job isn't one of yours, or no longer exists." />
      ) : (
        <QuestionSetPanel jobId={job._id} jobTitle={job.title} />
      )}
    </>
  );
}
