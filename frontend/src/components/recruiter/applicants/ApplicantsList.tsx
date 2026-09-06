"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  listApplicationsForJob,
  listMatchedApplicationsForJob,
  scheduleAiInterview,
  scheduleOrgInterview,
  updateApplicationStatus,
} from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUSES,
  populated,
  type Application,
  type ApplicationStatus,
} from "@/lib/types";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  formatDate,
  formatDateTime,
  initials,
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
  primaryButtonClass,
  smallButtonClass,
} from "@/components/ui/controls";
import { JobPicker } from "../JobPicker";
import { useMyJobs } from "../useMyJobs";
import {
  ScheduleInterviewDialog,
  type ScheduleKind,
  type SchedulePayload,
} from "./ScheduleInterviewDialog";

type DialogState = { application: Application; kind: ScheduleKind } | null;

/**
 * The HR applicant review screen. Every field the Application schema stores is
 * shown, and every HR action the backend exposes is wired:
 *   PATCH /:id/status, POST /:id/ai-interview, POST /:id/org-interview.
 */
export function ApplicantsList() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const { jobs, selectedJobId, setSelectedJobId, selectedJob } = useMyJobs(
    searchParams.get("jobId"),
  );

  const [search, setSearch] = useState("");
  const [matchedOnly, setMatchedOnly] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);

  const applications = useApiResource(
    (signal) =>
      matchedOnly
        ? listMatchedApplicationsForJob(selectedJobId!, token, signal)
        : listApplicationsForJob(selectedJobId!, token, signal),
    [selectedJobId, token, matchedOnly],
    { enabled: Boolean(token && selectedJobId) },
  );

  const applyLocalUpdate = useCallback(
    (updated: Application) => {
      applications.setData((current) =>
        (current ?? []).map((item) =>
          item._id === updated._id
            ? // The PATCH/POST responses aren't populated, so keep the
              // candidate ref we already have to avoid blanking the row.
              { ...updated, candidateId: item.candidateId }
            : item,
        ),
      );
    },
    [applications],
  );

  const handleStatusChange = useCallback(
    async (application: Application, status: ApplicationStatus) => {
      setBusyId(application._id);
      setActionError(null);
      try {
        applyLocalUpdate(
          await updateApplicationStatus(application._id, status, token),
        );
      } catch (error) {
        setActionError(toErrorMessage(error));
      } finally {
        setBusyId(null);
      }
    },
    [token, applyLocalUpdate],
  );

  const handleSchedule = useCallback(
    async (payload: SchedulePayload) => {
      if (!dialog) return;
      const { application, kind } = dialog;
      const updated =
        kind === "ai"
          ? await scheduleAiInterview(
              application._id,
              { dateTime: payload.dateTime, message: payload.message },
              token,
            )
          : await scheduleOrgInterview(
              application._id,
              {
                dateTime: payload.dateTime,
                location: payload.location,
                notes: payload.notes,
              },
              token,
            );
      applyLocalUpdate(updated);
      setDialog(null);
    },
    [dialog, token, applyLocalUpdate],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = applications.data ?? [];
    if (!query) return list;
    return list.filter((application) => {
      const candidate = populated(application.candidateId);
      return (
        candidate?.name.toLowerCase().includes(query) ||
        candidate?.email.toLowerCase().includes(query)
      );
    });
  }, [applications.data, search]);

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
        <PageHeader title="Applicants" />
        <EmptyState
          title="No jobs posted yet."
          description="Applicants appear once you post a job and candidates apply to it."
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
        title="Applicants"
        description="Ranked by match score — the share of the job's required skills found in each resume."
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
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={matchedOnly}
            onChange={(event) => setMatchedOnly(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Matched only
        </label>
      </div>

      {actionError && (
        <div className="mb-6">
          <InlineError message={actionError} />
        </div>
      )}

      {applications.isLoading ? (
        <LoadingBlock label="Loading applicants…" />
      ) : applications.error ? (
        <ErrorBlock message={applications.error} onRetry={applications.reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            matchedOnly
              ? "No applicants met the match threshold for this job yet."
              : "No applicants for this job yet."
          }
          description="Candidates appear here as soon as they apply."
        />
      ) : (
        <div className="space-y-5">
          {filtered.map((application) => (
            <ApplicantCard
              key={application._id}
              application={application}
              jobTitle={selectedJob?.title ?? "This job"}
              isBusy={busyId === application._id}
              onStatusChange={(status) => handleStatusChange(application, status)}
              onSchedule={(kind) => setDialog({ application, kind })}
            />
          ))}
        </div>
      )}

      {dialog && (
        <ScheduleInterviewDialog
          kind={dialog.kind}
          candidateName={
            populated(dialog.application.candidateId)?.name ?? "Candidate"
          }
          jobTitle={selectedJob?.title ?? "This job"}
          onCancel={() => setDialog(null)}
          onSubmit={handleSchedule}
        />
      )}
    </div>
  );
}

function ApplicantCard({
  application,
  jobTitle,
  isBusy,
  onStatusChange,
  onSchedule,
}: {
  application: Application;
  jobTitle: string;
  isBusy: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
  onSchedule: (kind: ScheduleKind) => void;
}) {
  const candidate = populated(application.candidateId);
  const { aiInterview, orgInterview } = application;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {initials(candidate?.name ?? "?")}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-900">
              {candidate?.name ?? "Unknown candidate"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {candidate?.email ?? "—"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Applied {formatDate(application.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-2xl font-bold ${scoreColor(application.matchScore)}`}>
              {application.matchScore}%
            </p>
            <p className="text-xs text-gray-500">
              {application.matched ? "Above threshold" : "Below threshold"}
            </p>
          </div>
          <span className={APPLICATION_STATUS_BADGE[application.status]}>
            {APPLICATION_STATUS_LABELS[application.status]}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Matched skills at time of applying ({application.resumeSnapshotSkills.length})
        </p>
        <SkillChips
          skills={application.resumeSnapshotSkills}
          emptyLabel="None of the required skills were found in this resume."
        />
      </div>

      {(aiInterview.scheduled || orgInterview.scheduled) && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {aiInterview.scheduled && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                AI interview
              </p>
              <p className="mt-1 text-sm text-indigo-900">
                {formatDateTime(aiInterview.dateTime)}
              </p>
              {aiInterview.message && (
                <p className="mt-1 text-xs text-indigo-800">{aiInterview.message}</p>
              )}
              {aiInterview.calendarLink && (
                <a
                  href={aiInterview.calendarLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Calendar link
                </a>
              )}
            </div>
          )}
          {orgInterview.scheduled && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Organisation interview
              </p>
              <p className="mt-1 text-sm text-emerald-900">
                {formatDateTime(orgInterview.dateTime)}
              </p>
              {orgInterview.location && (
                <p className="mt-1 text-xs text-emerald-800">
                  {orgInterview.location}
                </p>
              )}
              {orgInterview.notes && (
                <p className="mt-1 text-xs text-emerald-800">{orgInterview.notes}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-900">Status</span>
          <select
            value={application.status}
            onChange={(event) =>
              onStatusChange(event.target.value as ApplicationStatus)
            }
            disabled={isBusy}
            className={compactInputClass}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {APPLICATION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => onSchedule("ai")}
          disabled={isBusy || !application.matched}
          className={smallButtonClass}
          title={
            application.matched
              ? undefined
              : "Only applicants above the match threshold can have an AI interview scheduled."
          }
        >
          {aiInterview.scheduled ? "Reschedule AI interview" : "Schedule AI interview"}
        </button>

        <button
          type="button"
          onClick={() => onSchedule("org")}
          disabled={isBusy || application.status !== "selected"}
          className={smallButtonClass}
          title={
            application.status === "selected"
              ? undefined
              : "Mark the candidate as Selected before scheduling an organisation interview."
          }
        >
          {orgInterview.scheduled
            ? "Reschedule org interview"
            : "Schedule org interview"}
        </button>

        {application.interviewSessionId && (
          <Link
            href={`/recruiter/reports?jobId=${
              typeof application.jobId === "string"
                ? application.jobId
                : application.jobId._id
            }&applicationId=${application._id}`}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View interview report →
          </Link>
        )}
      </div>

      <p className="sr-only">Applicant for {jobTitle}</p>
    </div>
  );
}
