"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  inviteToOrgInterview,
  listApplicationsForJob,
  updateApplicationStatus,
} from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import { populated, type Application } from "@/lib/types";
import { formatDate, initials, scoreColor } from "@/lib/format";
import { OrgInterviewPanel } from "@/components/shared/OrgInterviewPanel";
import {
  Card,
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
  primaryButtonClass,
  smallButtonClass,
} from "@/components/ui/controls";
import { JobPicker } from "../JobPicker";
import { useMyJobs } from "../useMyJobs";
import {
  ScheduleInterviewDialog,
  type SchedulePayload,
} from "../applicants/ScheduleInterviewDialog";

/**
 * "Selected" is a real value of the Application schema's `status` enum, so this
 * screen is just the selected slice of a job's applicants — no local shortlist
 * bookkeeping. Selected candidates are also the only ones the backend lets you
 * schedule an organisation interview for.
 */
export function ShortlistedList() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const { jobs, selectedJobId, setSelectedJobId, selectedJob } = useMyJobs(
    searchParams.get("jobId"),
  );

  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialogFor, setDialogFor] = useState<Application | null>(null);

  const applications = useApiResource(
    (signal) => listApplicationsForJob(selectedJobId!, token, signal),
    [selectedJobId, token],
    { enabled: Boolean(token && selectedJobId) },
  );

  const selected = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (applications.data ?? [])
      .filter((item) => item.status === "selected")
      .filter((item) => {
        if (!query) return true;
        const candidate = populated(item.candidateId);
        return (
          candidate?.name.toLowerCase().includes(query) ||
          candidate?.email.toLowerCase().includes(query)
        );
      });
  }, [applications.data, search]);

  const applyLocalUpdate = useCallback(
    (updated: Application) => {
      applications.setData((current) =>
        (current ?? []).map((item) =>
          item._id === updated._id
            ? { ...updated, candidateId: item.candidateId }
            : item,
        ),
      );
    },
    [applications],
  );

  const handleUnselect = useCallback(
    async (application: Application) => {
      setBusyId(application._id);
      setError(null);
      try {
        applyLocalUpdate(
          await updateApplicationStatus(application._id, "pending", token),
        );
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        setBusyId(null);
      }
    },
    [token, applyLocalUpdate],
  );

  const handleSchedule = useCallback(
    async (payload: SchedulePayload) => {
      if (!dialogFor) return;
      applyLocalUpdate(
        await inviteToOrgInterview(
          dialogFor._id,
          { validityDays: payload.validityDays },
          token,
        ),
      );
      setDialogFor(null);
    },
    [dialogFor, token, applyLocalUpdate],
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
        <PageHeader title="Selected Candidates" />
        <EmptyState
          title="No jobs posted yet."
          description="Post a job, then mark strong applicants as Selected to see them here."
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
        title="Selected Candidates"
        description="Applicants whose status is Selected — ready for an organisation interview."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <JobPicker
          jobs={jobs.data ?? []}
          selectedJobId={selectedJobId}
          onSelect={setSelectedJobId}
        />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email…"
          className={`${compactInputClass} flex-1`}
        />
      </div>

      {error && (
        <div className="mb-6">
          <InlineError message={error} />
        </div>
      )}

      {applications.isLoading ? (
        <LoadingBlock label="Loading candidates…" />
      ) : applications.error ? (
        <ErrorBlock message={applications.error} onRetry={applications.reload} />
      ) : selected.length === 0 ? (
        <EmptyState
          title="No selected candidates for this job yet."
          description="Review applicants and their interview reports, then set an applicant's status to Selected."
          action={
            <Link
              href={`/recruiter/applicants?jobId=${selectedJobId ?? ""}`}
              className={`${primaryButtonClass} text-sm`}
            >
              Review applicants
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {selected.map((application) => {
            const candidate = populated(application.candidateId);
            return (
              <Card key={application._id}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {initials(candidate?.name ?? "?")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-bold text-gray-900">
                          {candidate?.name ?? "Unknown candidate"}
                        </h2>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {candidate?.email ?? "—"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-lg font-bold ${scoreColor(application.matchScore)}`}
                      >
                        {application.matchScore}%
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      {selectedJob?.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Applied {formatDate(application.createdAt)}
                    </p>

                    <div className="mt-3">
                      <SkillChips
                        skills={application.resumeSnapshotSkills}
                        emptyLabel="No matched skills recorded."
                      />
                    </div>

                    {application.orgInterview?.status && (
                      <div className="mt-3">
                        <OrgInterviewPanel
                          orgInterview={application.orgInterview}
                          audience="hr"
                        />
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDialogFor(application)}
                        disabled={busyId === application._id}
                        className={smallButtonClass}
                      >
                        {application.orgInterview?.status === "invited"
                          ? "Re-send invite"
                          : "Invite to org interview"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnselect(application)}
                        disabled={busyId === application._id}
                        className={dangerButtonClass}
                      >
                        {busyId === application._id
                          ? "Saving…"
                          : "Move back to pending"}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {dialogFor && (
        <ScheduleInterviewDialog
          kind="org"
          candidateName={populated(dialogFor.candidateId)?.name ?? "Candidate"}
          jobTitle={selectedJob?.title ?? "This job"}
          onCancel={() => setDialogFor(null)}
          onSubmit={handleSchedule}
        />
      )}
    </div>
  );
}
