"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getApplicationReport,
  listApplicationsForJob,
} from "@/lib/applicationsApi";
import { resolveSelection, useApiResource } from "@/lib/useApiResource";
import { populated, type ObjectId } from "@/lib/types";
import { formatDateTime, scoreColor } from "@/lib/format";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";
import { JobPicker } from "../JobPicker";
import { useMyJobs } from "../useMyJobs";
import { InterviewReportDetail } from "./InterviewReportCard";

/**
 * GET /api/applications/job/:jobId to find applicants with an
 * `interviewSessionId`, then GET /api/applications/:applicationId/report for
 * the full application + interview session pair.
 */
export function InterviewReportsList() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const { jobs, selectedJobId, setSelectedJobId, selectedJob } = useMyJobs(
    searchParams.get("jobId"),
  );

  const [requestedApplicationId, setSelectedApplicationId] =
    useState<ObjectId | null>(searchParams.get("applicationId"));

  const applications = useApiResource(
    (signal) => listApplicationsForJob(selectedJobId!, token, signal),
    [selectedJobId, token],
    { enabled: Boolean(token && selectedJobId) },
  );

  // Only applicants HR has actually scheduled an AI interview for have a report.
  const interviewed = useMemo(
    () => (applications.data ?? []).filter((item) => item.interviewSessionId),
    [applications.data],
  );

  const selectedApplicationId =
    resolveSelection(
      interviewed,
      requestedApplicationId,
      (item) => item._id,
    )?._id ?? null;

  const report = useApiResource(
    (signal) => getApplicationReport(selectedApplicationId!, token, signal),
    [selectedApplicationId, token],
    { enabled: Boolean(token && selectedApplicationId) },
  );

  if (jobs.isLoading) return <LoadingBlock label="Loading your jobs…" />;
  if (jobs.error) {
    return (
      <div className="p-8">
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      </div>
    );
  }

  if ((jobs.data ?? []).length === 0) {
    return (
      <div className="p-8">
        <PageHeader title="Interview Reports" />
        <EmptyState
          title="No jobs posted yet."
          description="Reports appear once you schedule AI interviews for applicants on your jobs."
          action={
            <Link href="/recruiter/jobs/create" className={`${primaryButtonClass} text-sm`}>
              Create job
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Interview Reports"
        description="The AI interviewer's per-question scores and overall verdict for each applicant."
      />

      <div className="mb-6">
        <JobPicker
          jobs={jobs.data ?? []}
          selectedJobId={selectedJobId}
          onSelect={setSelectedJobId}
        />
      </div>

      {applications.isLoading ? (
        <LoadingBlock label="Loading applicants…" />
      ) : applications.error ? (
        <ErrorBlock message={applications.error} onRetry={applications.reload} />
      ) : interviewed.length === 0 ? (
        <EmptyState
          title="No AI interviews scheduled for this job yet."
          description="Schedule an AI interview from the Applicants screen — the report appears here as the candidate answers."
          action={
            <Link
              href={`/recruiter/applicants?jobId=${selectedJobId ?? ""}`}
              className={`${primaryButtonClass} text-sm`}
            >
              Go to applicants
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            {interviewed.map((application) => {
              const candidate = populated(application.candidateId);
              const isActive = application._id === selectedApplicationId;
              return (
                <button
                  key={application._id}
                  type="button"
                  onClick={() => setSelectedApplicationId(application._id)}
                  className={`w-full rounded-xl border p-5 text-left transition-all ${
                    isActive
                      ? "border-indigo-300 bg-indigo-50 shadow-sm"
                      : "border-gray-100 bg-white hover:border-indigo-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {candidate?.name ?? "Unknown candidate"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDateTime(application.aiInterview.dateTime)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-bold ${scoreColor(application.matchScore)}`}
                    >
                      {application.matchScore}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {report.isLoading ? (
              <LoadingBlock label="Loading report…" />
            ) : report.error ? (
              <ErrorBlock message={report.error} onRetry={report.reload} />
            ) : report.data ? (
              <InterviewReportDetail
                report={report.data}
                jobTitle={selectedJob?.title ?? "This job"}
                onStatusChanged={applications.reload}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
