"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getApplicationReport,
  listApplicationsForJob,
} from "@/lib/applicationsApi";
import { resolveSelection, useApiResource } from "@/lib/useApiResource";
import { populated, type ObjectId } from "@/lib/types";
import { formatDateTime, scoreColor } from "@/lib/format";
import { PortalPage } from "@/components/dashboard/primitives";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
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
    resolveSelection(interviewed, requestedApplicationId, (item) => item._id)
      ?._id ?? null;

  const report = useApiResource(
    (signal) => getApplicationReport(selectedApplicationId!, token, signal),
    [selectedApplicationId, token],
    { enabled: Boolean(token && selectedApplicationId) },
  );

  if (jobs.isLoading) return <LoadingBlock label="Loading your jobs…" />;
  if (jobs.error) {
    return (
      <PortalPage>
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      </PortalPage>
    );
  }

  if ((jobs.data ?? []).length === 0) {
    return (
      <PortalPage>
        <PageHeader title="Interview reports" icon={<FileText />} />
        <EmptyState
          icon={<FileText />}
          title="No jobs posted yet."
          description="Reports appear once you schedule AI interviews for applicants on your jobs."
          action={<Button href="/recruiter/jobs/create">Create job</Button>}
        />
      </PortalPage>
    );
  }

  return (
    <PortalPage>
      <PageHeader
        title="Interview reports"
        icon={<FileText />}
        description="The AI interviewer's per-question scores and overall verdict for each applicant."
      />

      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0 [&_select]:w-full sm:[&_select]:w-auto">
          <JobPicker
            jobs={jobs.data ?? []}
            selectedJobId={selectedJobId}
            onSelect={setSelectedJobId}
          />
        </div>
        {!applications.isLoading && !applications.error && (
          <p className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink">
              {interviewed.length}
            </span>{" "}
            interviewed applicant{interviewed.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {applications.isLoading ? (
        <LoadingBlock label="Loading applicants…" />
      ) : applications.error ? (
        <ErrorBlock
          message={applications.error}
          onRetry={applications.reload}
        />
      ) : interviewed.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No AI interviews scheduled for this job yet."
          description="Schedule an AI interview from the Applicants screen — the report appears here as the candidate answers."
          action={
            <Button href={`/recruiter/applicants?jobId=${selectedJobId ?? ""}`}>
              Go to applicants
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
          <nav
            aria-label="Interviewed applicants"
            className="min-w-0 rounded-xl border border-line bg-surface p-2 shadow-xs lg:sticky lg:top-6"
          >
            <p className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider text-muted">
              Candidates
            </p>
            <ul className="space-y-1">
              {interviewed.map((application) => {
                const candidate = populated(application.candidateId);
                const isActive = application._id === selectedApplicationId;
                return (
                  <li key={application._id}>
                    <button
                      type="button"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => setSelectedApplicationId(application._id)}
                      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        isActive
                          ? "bg-brand-50 ring-1 ring-inset ring-brand-600/15"
                          : "hover:bg-surface-2"
                      }`}
                    >
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand-600"
                        />
                      )}
                      <Avatar name={candidate?.name ?? "?"} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm font-semibold ${isActive ? "text-brand-800" : "text-ink"}`}
                        >
                          {candidate?.name ?? "Unknown candidate"}
                        </span>
                        <span className="block truncate text-xs tabular-nums text-muted">
                          {formatDateTime(application.aiInterview.dateTime)}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-sm font-semibold tabular-nums ${scoreColor(application.matchScore)}`}
                      >
                        {application.matchScore}%
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0">
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
    </PortalPage>
  );
}
