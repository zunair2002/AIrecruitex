"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CalendarDays, Search, Send, Star, Undo2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  inviteToOrgInterview,
  listApplicationsForJob,
  updateApplicationStatus,
} from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import { populated, type Application } from "@/lib/types";
import { formatDate, scoreColor } from "@/lib/format";
import { OrgInterviewPanel } from "@/components/shared/OrgInterviewPanel";
import { PortalPage } from "@/components/dashboard/primitives";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
  SkillChips,
} from "@/components/ui/Feedback";
import { inputClass } from "@/components/ui/controls";
import { JobPicker } from "../JobPicker";
import { useMyJobs } from "../useMyJobs";
import {
  ScheduleInterviewDialog,
  type SchedulePayload,
} from "../applicants/ScheduleInterviewDialog";
import { useToast } from "@/context/ToastContext";

/**
 * "Selected" is a real value of the Application schema's `status` enum, so this
 * screen is just the selected slice of a job's applicants — no local shortlist
 * bookkeeping. Selected candidates are also the only ones the backend lets you
 * schedule an organisation interview for.
 */
export function ShortlistedList() {
  const { token } = useAuth();
  const { toast } = useToast();
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
      toast({
        title: "Interview invite sent",
        detail: "The candidate has been emailed a private interview link.",
      });
      setDialogFor(null);
    },
    [dialogFor, token, applyLocalUpdate, toast],
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
        <PageHeader title="Selected candidates" icon={<Star />} />
        <EmptyState
          icon={<Star />}
          title="No jobs posted yet."
          description="Post a job, then mark strong applicants as Selected to see them here."
          action={<Button href="/recruiter/jobs/create">Create job</Button>}
        />
      </PortalPage>
    );
  }

  return (
    <PortalPage>
      <PageHeader
        title="Selected candidates"
        icon={<Star />}
        description="Applicants whose status is Selected — ready for an organisation interview."
      />

      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-xs sm:flex-row sm:flex-wrap sm:items-center">
        <div className="min-w-0 [&_select]:w-full sm:[&_select]:w-auto">
          <JobPicker
            jobs={jobs.data ?? []}
            selectedJobId={selectedJobId}
            onSelect={setSelectedJobId}
          />
        </div>
        <div className="relative w-full sm:min-w-56 sm:flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search selected candidates by name or email"
            className={`${inputClass} pl-9`}
          />
        </div>
        {!applications.isLoading && !applications.error && (
          <p className="text-sm text-muted sm:ml-auto">
            <span className="font-semibold tabular-nums text-ink">
              {selected.length}
            </span>{" "}
            selected
          </p>
        )}
      </div>

      {error && <InlineError message={error} />}

      {applications.isLoading ? (
        <LoadingBlock label="Loading candidates…" />
      ) : applications.error ? (
        <ErrorBlock
          message={applications.error}
          onRetry={applications.reload}
        />
      ) : selected.length === 0 ? (
        <EmptyState
          icon={<Star />}
          title="No selected candidates for this job yet."
          description="Review applicants and their interview reports, then set an applicant's status to Selected."
          action={
            <Button href={`/recruiter/applicants?jobId=${selectedJobId ?? ""}`}>
              Review applicants
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-2">
          {selected.map((application) => {
            const candidate = populated(application.candidateId);
            const isBusy = busyId === application._id;
            return (
              <article
                key={application._id}
                className="flex min-w-0 flex-col rounded-xl border border-line bg-surface shadow-xs transition-colors hover:border-brand-200"
              >
                <div className="flex-1 p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <Avatar name={candidate?.name ?? "?"} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-semibold text-ink">
                            {candidate?.name ?? "Unknown candidate"}
                          </h2>
                          <p className="mt-0.5 truncate text-sm text-muted">
                            {candidate?.email ?? "—"}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className={`font-display text-2xl font-semibold tabular-nums leading-none ${scoreColor(application.matchScore)}`}
                          >
                            {application.matchScore}%
                          </p>
                          <p className="mt-1 text-xs text-muted">Match</p>
                        </div>
                      </div>
                      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                        <span className="font-medium text-body">
                          {selectedJob?.title}
                        </span>
                        <span aria-hidden="true" className="text-subtle">
                          ·
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                          <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                          Applied {formatDate(application.createdAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-muted">
                      Matched skills
                    </p>
                    <SkillChips
                      skills={application.resumeSnapshotSkills}
                      emptyLabel="No matched skills recorded."
                    />
                  </div>

                  {application.orgInterview?.status && (
                    <div className="mt-4">
                      <OrgInterviewPanel
                        orgInterview={application.orgInterview}
                        audience="hr"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-line-soft bg-surface-2/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <Button
                    variant="danger-soft"
                    size="sm"
                    onClick={() => handleUnselect(application)}
                    disabled={isBusy}
                    leadingIcon={<Undo2 aria-hidden="true" />}
                    className="max-sm:h-10"
                  >
                    {isBusy ? "Saving…" : "Move back to pending"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setDialogFor(application)}
                    disabled={isBusy}
                    leadingIcon={<Send aria-hidden="true" />}
                    className="max-sm:h-10"
                  >
                    {application.orgInterview?.status === "invited"
                      ? "Re-send invite"
                      : "Invite to org interview"}
                  </Button>
                </div>
              </article>
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
    </PortalPage>
  );
}
