"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  CalendarPlus,
  Search,
  Send,
  Sparkles,
  Star,
  Target,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useServerEvent } from "@/context/RealtimeContext";
import { toErrorMessage } from "@/lib/api";
import {
  bulkInviteToOrgInterview,
  bulkTriggerAiInterview,
  bulkUpdateStatus,
  inviteToOrgInterview,
  listApplicationsForJob,
  listMatchedApplicationsForJob,
  scheduleAiInterview,
  updateApplicationStatus,
} from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUSES,
  populated,
  type Application,
  type ApplicationStatus,
  type ObjectId,
} from "@/lib/types";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  formatDate,
  formatDateTime,
  scoreColor,
} from "@/lib/format";
import { OrgInterviewPanel } from "@/components/shared/OrgInterviewPanel";
import { PortalPage } from "@/components/dashboard/primitives";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
  SkillChips,
  StatCard,
} from "@/components/ui/Feedback";
import {
  checkboxClass,
  compactInputClass,
  inputClass,
} from "@/components/ui/controls";
import { JobPicker } from "../JobPicker";
import { useMyJobs } from "../useMyJobs";
import {
  ScheduleInterviewDialog,
  type ScheduleKind,
  type SchedulePayload,
} from "./ScheduleInterviewDialog";
import { useToast } from "@/context/ToastContext";

type DialogState = { application: Application; kind: ScheduleKind } | null;

/** Fill colour for a 0–100 score bar, matching `scoreColor`. */
function scoreBarClass(score: number): string {
  if (score >= 80) return "bg-success-400";
  if (score >= 50) return "bg-warning-400";
  return "bg-danger-400";
}

/**
 * The HR applicant review screen. Every field the Application schema stores is
 * shown, and every HR action the backend exposes is wired:
 * PATCH /:id/status, POST /:id/ai-interview, POST /:id/org-interview.
 */
export function ApplicantsList() {
  const { token } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { jobs, selectedJobId, setSelectedJobId, selectedJob } = useMyJobs(
    searchParams.get("jobId"),
  );

  const [search, setSearch] = useState("");
  const [matchedOnly, setMatchedOnly] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  // Ticked rows, for the backend's bulk status / AI-interview / invite endpoints.
  const [selectedIds, setSelectedIds] = useState<Set<ObjectId>>(new Set());
  const [isBulkBusy, setIsBulkBusy] = useState(false);

  const toggleSelected = useCallback((id: ObjectId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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
        toast({
          title: `Marked ${APPLICATION_STATUS_LABELS[status].toLowerCase()}`,
          detail: "The candidate is notified in real time.",
        });
      } catch (error) {
        setActionError(toErrorMessage(error));
      } finally {
        setBusyId(null);
      }
    },
    [token, applyLocalUpdate, toast],
  );

  const handleSchedule = useCallback(
    async (payload: SchedulePayload) => {
      if (!dialog) return;
      const { application, kind } = dialog;
      if (selectedIds.size > 1) {
        // Bulk: the backend applies the same action to every id in one request.
        const ids: ObjectId[] = Array.from(selectedIds);
        await (kind === "ai"
          ? bulkTriggerAiInterview(ids, token)
          : bulkInviteToOrgInterview(
              ids,
              { validityDays: payload.validityDays },
              token,
            ));
        setSelectedIds(new Set());
        applications.reload();
        toast({
          title: kind === "ai" ? "AI interviews triggered" : "Invites sent",
          detail: `${ids.length} candidate${ids.length === 1 ? "" : "s"} updated.`,
        });
      } else {
        const updated =
          kind === "ai"
            ? await scheduleAiInterview(
                application._id,
                { dateTime: payload.dateTime!, message: payload.message },
                token,
              )
            : await inviteToOrgInterview(
                application._id,
                { validityDays: payload.validityDays },
                token,
              );
        applyLocalUpdate(updated);
        toast({
          title: kind === "ai" ? "AI interview scheduled" : "Interview invite sent",
          detail:
            kind === "ai"
              ? "The candidate can start it from their applications."
              : "The candidate has been emailed a private interview link.",
        });
      }
      setDialog(null);
    },
    [dialog, token, applyLocalUpdate, selectedIds, applications, toast],
  );

  // Keeps the list honest if the candidate's own session, or another HR user,
  // changes something while this screen is open.
  useServerEvent("application:status", () => applications.reload());

  const handleBulkStatus = useCallback(
    async (status: ApplicationStatus) => {
      if (selectedIds.size === 0) return;
      setIsBulkBusy(true);
      setActionError(null);
      try {
        const ids = Array.from(selectedIds);
        await bulkUpdateStatus(ids, status, token);
        setSelectedIds(new Set());
        applications.reload();
        toast({
          title: `${ids.length} marked ${APPLICATION_STATUS_LABELS[status].toLowerCase()}`,
        });
      } catch (error) {
        setActionError(toErrorMessage(error));
      } finally {
        setIsBulkBusy(false);
      }
    },
    [selectedIds, token, applications, toast],
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

  // Display-only summary of the loaded list.
  const stats = useMemo(() => {
    const list = applications.data ?? [];
    const avg = list.length
      ? Math.round(
          list.reduce((sum, item) => sum + item.matchScore, 0) / list.length,
        )
      : 0;
    return {
      total: list.length,
      matched: list.filter((item) => item.matched).length,
      selected: list.filter((item) => item.status === "selected").length,
      interviewed: list.filter((item) => item.aiInterview.scheduled).length,
      avg,
    };
  }, [applications.data]);

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
        <PageHeader title="Applicants" icon={<Users />} />
        <EmptyState
          icon={<Users />}
          title="No jobs posted yet."
          description="Applicants appear once you post a job and candidates apply to it."
          action={<Button href="/recruiter/jobs/create">Create job</Button>}
        />
      </PortalPage>
    );
  }

  const hasList = !applications.isLoading && !applications.error;

  return (
    <PortalPage>
      <PageHeader
        title="Applicants"
        icon={<Users />}
        description="Ranked by match score — the share of the job's required skills found in each resume."
      />

      {hasList && stats.total > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label={matchedOnly ? "Matched applicants" : "Applicants"}
            value={stats.total}
            sub={`Avg. match ${stats.avg}%`}
            icon={<Users />}
          />
          <StatCard
            label="Above threshold"
            value={stats.matched}
            sub="Eligible for an AI interview"
            icon={<Target />}
            tone="info"
          />
          <StatCard
            label="AI interviews"
            value={stats.interviewed}
            sub="Scheduled or completed"
            icon={<Bot />}
            tone="warning"
          />
          <StatCard
            label="Selected"
            value={stats.selected}
            sub="Ready for an org interview"
            icon={<Star />}
            tone="success"
          />
        </div>
      )}

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
            aria-label="Search applicants by name or email"
            className={`${inputClass} pl-9`}
          />
        </div>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-1 text-sm font-medium text-body">
          <input
            type="checkbox"
            checked={matchedOnly}
            onChange={(event) => setMatchedOnly(event.target.checked)}
            className={checkboxClass}
          />
          Matched only
        </label>
      </div>

      {actionError && <InlineError message={actionError} />}

      {applications.isLoading ? (
        <LoadingBlock label="Loading applicants…" variant="skeleton" rows={4} />
      ) : applications.error ? (
        <ErrorBlock
          message={applications.error}
          onRetry={applications.reload}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={
            matchedOnly
              ? "No applicants met the match threshold for this job yet."
              : "No applicants for this job yet."
          }
          description="Candidates appear here as soon as they apply."
        />
      ) : (
        <div className="space-y-4">
          {selectedIds.size > 0 && (
            <div
              role="region"
              aria-label="Bulk actions"
              className="sticky top-16 z-20 flex flex-col gap-3 rounded-xl border border-brand-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:p-4 lg:top-4 xl:flex-row xl:items-center"
            >
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-700 px-1.5 text-xs font-semibold tabular-nums text-white">
                  {selectedIds.size}
                </span>
                <span className="text-sm font-semibold text-ink">
                  selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                  leadingIcon={<X aria-hidden="true" />}
                  className="ml-auto text-muted xl:hidden"
                >
                  Clear
                </Button>
              </div>
              <div className="-mx-3 flex min-w-0 gap-2 overflow-x-auto px-3 no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 xl:flex-1 xl:justify-end">
                {APPLICATION_STATUSES.map((status) => (
                  <Button
                    key={status}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBulkStatus(status)}
                    disabled={isBulkBusy}
                  >
                    Mark {APPLICATION_STATUS_LABELS[status].toLowerCase()}
                  </Button>
                ))}
                <Button
                  size="sm"
                  onClick={() =>
                    setDialog({ application: filtered[0], kind: "ai" })
                  }
                  disabled={isBulkBusy}
                  leadingIcon={<Bot aria-hidden="true" />}
                >
                  Trigger AI interviews
                </Button>
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() =>
                    setDialog({ application: filtered[0], kind: "org" })
                  }
                  disabled={isBulkBusy}
                  leadingIcon={<Send aria-hidden="true" />}
                >
                  Invite to org interview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                  leadingIcon={<X aria-hidden="true" />}
                  className="hidden text-muted xl:inline-flex"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          <Card
            padding="none"
            title={`${filtered.length} applicant${filtered.length === 1 ? "" : "s"}`}
            description={selectedJob?.title}
            action={
              <span className="hidden text-xs text-muted sm:inline">
                Tick applicants for bulk actions
              </span>
            }
          >
            <ul className="divide-y divide-line-soft border-t border-line-soft">
              {filtered.map((application) => (
                <ApplicantCard
                  key={application._id}
                  application={application}
                  isSelected={selectedIds.has(application._id)}
                  onToggleSelected={() => toggleSelected(application._id)}
                  jobTitle={selectedJob?.title ?? "This job"}
                  isBusy={busyId === application._id}
                  onStatusChange={(status) =>
                    handleStatusChange(application, status)
                  }
                  onSchedule={(kind) => setDialog({ application, kind })}
                />
              ))}
            </ul>
          </Card>
        </div>
      )}

      {dialog && (
        <ScheduleInterviewDialog
          kind={dialog.kind}
          candidateName={
            populated(dialog.application.candidateId)?.name ?? "Candidate"
          }
          jobTitle={selectedJob?.title ?? "This job"}
          count={selectedIds.size}
          onCancel={() => setDialog(null)}
          onSubmit={handleSchedule}
        />
      )}
    </PortalPage>
  );
}

function ApplicantCard({
  application,
  jobTitle,
  isBusy,
  isSelected,
  onToggleSelected,
  onStatusChange,
  onSchedule,
}: {
  application: Application;
  jobTitle: string;
  isBusy: boolean;
  isSelected: boolean;
  onToggleSelected: () => void;
  onStatusChange: (status: ApplicationStatus) => void;
  onSchedule: (kind: ScheduleKind) => void;
}) {
  const candidate = populated(application.candidateId);
  const { aiInterview } = application;
  // Absent until HR invites — see the note on Application.orgInterview.
  const orgInterview = application.orgInterview;
  const statusId = `status-${application._id}`;
  const jobId =
    typeof application.jobId === "string"
      ? application.jobId
      : application.jobId._id;

  return (
    <li
      className={`px-4 py-5 transition-colors sm:px-6 ${
        isSelected ? "bg-brand-50/60" : "hover:bg-surface-2/60"
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <label className="-ml-2 -mr-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg sm:-mr-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelected}
            aria-label={`Select ${candidate?.name ?? "applicant"}`}
            className={checkboxClass}
          />
        </label>

        <div className="min-w-0 flex-1">
          {/* Identity · match score · status */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={candidate?.name ?? "?"} size="md" />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-ink">
                  {candidate?.name ?? "Unknown candidate"}
                </p>
                <p className="truncate text-sm text-muted">
                  {candidate?.email ?? "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:shrink-0">
              <div className="min-w-0 flex-1 md:w-52 md:flex-none">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-muted">
                    {application.matched ? "Above threshold" : "Below threshold"}
                  </span>
                  <span
                    className={`font-display text-lg font-semibold tabular-nums ${scoreColor(application.matchScore)}`}
                  >
                    {application.matchScore}%
                  </span>
                </div>
                <div
                  role="meter"
                  aria-label="Match score"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={application.matchScore}
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3"
                >
                  <div
                    className={`h-full rounded-full ${scoreBarClass(application.matchScore)}`}
                    style={{ width: `${Math.min(100, Math.max(0, application.matchScore))}%` }}
                  />
                </div>
              </div>
              <span className={APPLICATION_STATUS_BADGE[application.status]}>
                {APPLICATION_STATUS_LABELS[application.status]}
              </span>
            </div>
          </div>

          {/* Matched skills */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-muted">
              Matched skills at time of applying (
              <span className="tabular-nums">
                {application.resumeSnapshotSkills.length}
              </span>
              ) · Applied {formatDate(application.createdAt)}
            </p>
            <SkillChips
              skills={application.resumeSnapshotSkills}
              emptyLabel="None of the required skills were found in this resume."
            />
          </div>

          {/* Interviews */}
          {(aiInterview.scheduled || orgInterview?.status) && (
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {aiInterview.scheduled && (
                <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                      <Bot aria-hidden="true" className="h-4 w-4 text-brand-700" />
                      AI interview
                    </p>
                    <Badge tone="brand">Scheduled</Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-body">
                    <CalendarClock aria-hidden="true" className="h-4 w-4 text-muted" />
                    <span className="tabular-nums">
                      {formatDateTime(aiInterview.dateTime)}
                    </span>
                  </p>
                  {aiInterview.message && (
                    <p className="mt-1.5 text-sm text-muted">
                      {aiInterview.message}
                    </p>
                  )}
                  {aiInterview.calendarLink && (
                    <a
                      href={aiInterview.calendarLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      <CalendarPlus aria-hidden="true" className="h-4 w-4" />
                      Calendar link
                    </a>
                  )}
                </div>
              )}
              {orgInterview?.status && (
                <OrgInterviewPanel orgInterview={orgInterview} audience="hr" />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-3 border-t border-line-soft pt-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-2">
              <label htmlFor={statusId} className="text-sm font-medium text-body">
                Status
              </label>
              <select
                id={statusId}
                value={application.status}
                onChange={(event) =>
                  onStatusChange(event.target.value as ApplicationStatus)
                }
                disabled={isBusy}
                className={`${compactInputClass} min-w-32 flex-1 max-sm:h-10 sm:flex-none`}
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {APPLICATION_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSchedule("ai")}
                disabled={isBusy || !application.matched}
                leadingIcon={<Sparkles aria-hidden="true" />}
                className="max-sm:h-10"
                title={
                  application.matched
                    ? undefined
                    : "Only applicants above the match threshold can have an AI interview scheduled."
                }
              >
                {aiInterview.scheduled
                  ? "Reschedule AI interview"
                  : "Schedule AI interview"}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSchedule("org")}
                disabled={isBusy || application.status !== "selected"}
                leadingIcon={<Send aria-hidden="true" />}
                className="max-sm:h-10"
                title={
                  application.status === "selected"
                    ? undefined
                    : "Mark the candidate as Selected before scheduling an organisation interview."
                }
              >
                {orgInterview?.status === "invited"
                  ? "Re-send invite"
                  : orgInterview?.status === "completed"
                    ? "Invite again"
                    : "Invite to org interview"}
              </Button>
            </div>

            {application.interviewSessionId && (
              <Button
                variant="soft"
                size="sm"
                href={`/recruiter/reports?jobId=${jobId}&applicationId=${application._id}`}
                trailingIcon={<ArrowRight aria-hidden="true" />}
                className="max-sm:h-10 sm:ml-auto"
              >
                View interview report
              </Button>
            )}
          </div>
        </div>
      </div>

      <p className="sr-only">Applicant for {jobTitle}</p>
    </li>
  );
}
