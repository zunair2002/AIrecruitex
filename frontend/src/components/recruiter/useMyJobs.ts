"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listMyJobs } from "@/lib/jobsApi";
import { resolveSelection, useApiResource } from "@/lib/useApiResource";
import type { Job, ObjectId } from "@/lib/types";

/**
 * GET /api/jobs/mine plus the "which job am I looking at" selection that the
 * applicants, reports and selected-candidates screens all share. Every HR
 * applicant endpoint is scoped to a job the caller owns, so a job must be
 * picked before any applicant data can be fetched.
 */
export function useMyJobs(initialJobId?: string | null) {
  const { token } = useAuth();
  const jobs = useApiResource(
    (signal) => listMyJobs(token, signal),
    [token],
    { enabled: Boolean(token) },
  );
  const [requestedJobId, setSelectedJobId] = useState<ObjectId | null>(
    initialJobId ?? null,
  );

  // Derived rather than stored, so a job list arriving (or a job disappearing)
  // never needs an effect to fix up the selection.
  const selectedJob = useMemo<Job | null>(
    () => resolveSelection(jobs.data ?? [], requestedJobId, (job) => job._id),
    [jobs.data, requestedJobId],
  );

  return {
    jobs,
    selectedJobId: selectedJob?._id ?? null,
    setSelectedJobId,
    selectedJob,
  };
}
