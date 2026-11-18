"use client";

import { useCallback, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  Lock,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  closeJob,
  deleteJob,
  listAllApplications,
  listAllJobs,
} from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { populated, type ObjectId } from "@/lib/types";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  ORG_INTERVIEW_STATUS_BADGE,
  ORG_INTERVIEW_STATUS_LABELS,
  JOB_STATUS_BADGE,
  JOB_STATUS_LABELS,
  formatDate,
  scoreColor,
} from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Tabs } from "@/components/ui/Tabs";
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
import { inputClass } from "@/components/ui/controls";
import {
  stackedItemClass,
  tableClass,
  tableScrollClass,
  tdClass,
  thClass,
  trClass,
  numericCellClass,
} from "@/components/ui/table";
import { PortalPage } from "@/components/dashboard/primitives";

type Tab = "jobs" | "applications";

/**
 * GET /api/admin/content/jobs + /applications, with the two job mutations the
 * backend exposes: PATCH /jobs/:jobId/close and DELETE /jobs/:jobId.
 */
export function ContentManagement() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>("jobs");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<ObjectId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: ObjectId;
    title: string;
  } | null>(null);

  const jobs = useApiResource((signal) => listAllJobs(token, signal), [token], {
    enabled: Boolean(token),
  });
  const applications = useApiResource(
    (signal) => listAllApplications(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  const runMutation = useCallback(
    async (jobId: ObjectId, action: () => Promise<unknown>) => {
      setBusyId(jobId);
      setError(null);
      try {
        await action();
        jobs.reload();
        applications.reload();
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        setBusyId(null);
      }
    },
    [jobs, applications],
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    await runMutation(id, () => deleteJob(id, token));
    setPendingDelete(null);
  };

  const query = search.trim().toLowerCase();

  const filteredJobs = useMemo(() => {
    const list = jobs.data ?? [];
    if (!query) return list;
    return list.filter((job) => {
      const hr = populated(job.hrId);
      return (
        job.title.toLowerCase().includes(query) ||
        hr?.name.toLowerCase().includes(query) ||
        hr?.email.toLowerCase().includes(query)
      );
    });
  }, [jobs.data, query]);

  const filteredApplications = useMemo(() => {
    const list = applications.data ?? [];
    if (!query) return list;
    return list.filter((application) => {
      const candidate = populated(application.candidateId);
      const job = populated(application.jobId);
      return (
        candidate?.name.toLowerCase().includes(query) ||
        candidate?.email.toLowerCase().includes(query) ||
        job?.title.toLowerCase().includes(query)
      );
    });
  }, [applications.data, query]);

  const openJobs = (jobs.data ?? []).filter((job) => job.status === "open").length;
  const matchedApps = (applications.data ?? []).filter((a) => a.matched).length;
  const dash = (ready: boolean, value: number) => (ready ? value : "—");

  return (
    <PortalPage>
      <PageHeader
        icon={<BriefcaseBusiness />}
        title="Jobs and applications"
        description="Every job and application on the platform, across all HR accounts."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Jobs"
          value={dash(Boolean(jobs.data), jobs.data?.length ?? 0)}
          sub="Across all HR accounts"
          icon={<BriefcaseBusiness />}
          tone="info"
        />
        <StatCard
          label="Open jobs"
          value={dash(Boolean(jobs.data), openJobs)}
          sub="Accepting applications"
          icon={<BriefcaseBusiness />}
          tone="success"
        />
        <StatCard
          label="Applications"
          value={dash(Boolean(applications.data), applications.data?.length ?? 0)}
          sub="Submitted by candidates"
          icon={<ClipboardList />}
          tone="brand"
        />
        <StatCard
          label="Matched"
          value={dash(Boolean(applications.data), matchedApps)}
          sub="At or above the threshold"
          icon={<ClipboardList />}
          tone="warning"
        />
      </div>

      <div className="space-y-4">
        <Tabs
          ariaLabel="Content type"
          idPrefix="content"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "jobs", label: "Jobs", count: jobs.data?.length ?? 0 },
            {
              id: "applications",
              label: "Applications",
              count: applications.data?.length ?? 0,
            },
          ]}
        />

        <div className="relative w-full sm:max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              tab === "jobs"
                ? "Search job title or HR owner…"
                : "Search candidate or job…"
            }
            aria-label={tab === "jobs" ? "Search jobs" : "Search applications"}
            className={`${inputClass} pl-9`}
          />
        </div>

        {error && <InlineError message={error} />}
      </div>

      <div
        id={`content-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`content-tab-${tab}`}
      >
        {tab === "jobs" ? (
          jobs.isLoading ? (
            <LoadingBlock label="Loading jobs…" />
          ) : jobs.error ? (
            <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              icon={<BriefcaseBusiness />}
              title="No jobs found"
              description={query ? "Try a different search." : "Jobs posted by HR accounts appear here."}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredJobs.map((job) => {
                const hr = populated(job.hrId);
                const isBusy = busyId === job._id;
                return (
                  <article
                    key={job._id}
                    className="flex min-w-0 flex-col rounded-xl border border-line bg-surface p-5 shadow-xs transition-colors hover:border-brand-200 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="min-w-0 text-base font-semibold text-ink">
                        {job.title}
                      </h2>
                      <span className={JOB_STATUS_BADGE[job.status]}>
                        {JOB_STATUS_LABELS[job.status]}
                      </span>
                    </div>
                    <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-muted">
                      <Avatar name={hr?.name ?? "Unknown HR"} size="sm" tone="neutral" className="h-6! w-6! text-xs" />
                      <span className="min-w-0 truncate">
                        {hr?.name ?? "Unknown HR"}
                        {hr?.email ? ` · ${hr.email}` : ""}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="shrink-0 tabular-nums">
                        {formatDate(job.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 whitespace-pre-line text-sm text-body">
                      {job.description}
                    </p>

                    <div className="mt-4">
                      <SkillChips skills={job.requiredSkills} tone="gray" />
                    </div>

                    <div className="mt-auto pt-5">
                    <div className="flex flex-wrap items-center gap-2 border-t border-line-soft pt-4">
                      {job.status === "open" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          leadingIcon={<Lock />}
                          onClick={() =>
                            runMutation(job._id, () => closeJob(job._id, token))
                          }
                          disabled={isBusy}
                        >
                          Close job
                        </Button>
                      )}
                      <Button
                        variant="danger-soft"
                        size="sm"
                        leadingIcon={<Trash2 />}
                        onClick={() =>
                          setPendingDelete({ id: job._id, title: job.title })
                        }
                        disabled={isBusy}
                      >
                        Delete job
                      </Button>
                      {job.jdFileUrl && (
                        <a
                          href={job.jdFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonClass({
                            variant: "ghost",
                            size: "sm",
                            className: "ml-auto",
                          })}
                        >
                          <FileText aria-hidden="true" />
                          JD file
                        </a>
                      )}
                    </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )
        ) : applications.isLoading ? (
          <LoadingBlock label="Loading applications…" />
        ) : applications.error ? (
          <ErrorBlock
            message={applications.error}
            onRetry={applications.reload}
          />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={<ClipboardList />}
            title="No applications found"
            description={query ? "Try a different search." : "Applications appear here once candidates apply."}
          />
        ) : (
          <Card padding="none">
            <div className={`hidden md:block ${tableScrollClass}`}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>Candidate</th>
                    <th scope="col" className={thClass}>Job</th>
                    <th scope="col" className={`${thClass} ${numericCellClass}`}>Match</th>
                    <th scope="col" className={thClass}>Status</th>
                    <th scope="col" className={thClass}>Interviews</th>
                    <th scope="col" className={thClass}>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => {
                    const candidate = populated(application.candidateId);
                    const job = populated(application.jobId);
                    const orgStatus = application.orgInterview?.status;
                    return (
                      <tr key={application._id} className={trClass}>
                        <td className={tdClass}>
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar name={candidate?.name ?? "Unknown"} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">
                                {candidate?.name ?? "Unknown"}
                              </p>
                              <p className="max-w-56 truncate text-xs text-muted">
                                {candidate?.email ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={`${tdClass} text-body`}>
                          {job?.title ?? "Job deleted"}
                        </td>
                        <td className={`${tdClass} ${numericCellClass}`}>
                          <span className={`font-semibold ${scoreColor(application.matchScore)}`}>
                            {application.matchScore}%
                          </span>
                          <p className="whitespace-nowrap text-xs text-muted">
                            {application.matched ? "Matched" : "Below threshold"}
                          </p>
                        </td>
                        <td className={tdClass}>
                          <span className={APPLICATION_STATUS_BADGE[application.status]}>
                            {APPLICATION_STATUS_LABELS[application.status]}
                          </span>
                        </td>
                        <td className={tdClass}>
                          <InterviewBadges
                            aiScheduled={application.aiInterview.scheduled}
                            orgStatus={orgStatus}
                          />
                        </td>
                        <td className={`${tdClass} whitespace-nowrap text-muted tabular-nums`}>
                          {formatDate(application.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line-soft md:hidden">
              {filteredApplications.map((application) => {
                const candidate = populated(application.candidateId);
                const job = populated(application.jobId);
                return (
                  <li key={application._id} className={`${stackedItemClass} space-y-3`}>
                    <div className="flex items-start gap-3">
                      <Avatar name={candidate?.name ?? "Unknown"} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">
                          {candidate?.name ?? "Unknown"}
                        </p>
                        <p className="text-sm text-body">
                          {job?.title ?? "Job deleted"}
                        </p>
                        <p className="text-xs text-muted">
                          Applied {formatDate(application.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`font-display text-lg font-semibold tabular-nums ${scoreColor(application.matchScore)}`}>
                          {application.matchScore}%
                        </p>
                        <p className="text-xs text-muted">
                          {application.matched ? "Matched" : "Below threshold"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={APPLICATION_STATUS_BADGE[application.status]}>
                        {APPLICATION_STATUS_LABELS[application.status]}
                      </span>
                      <InterviewBadges
                        aiScheduled={application.aiInterview.scheduled}
                        orgStatus={application.orgInterview?.status}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        tone="danger"
        title="Delete this job?"
        description={`“${pendingDelete?.title ?? ""}” will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete job"
        loading={pendingDelete !== null && busyId === pendingDelete.id}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </PortalPage>
  );
}

function InterviewBadges({
  aiScheduled,
  orgStatus,
}: {
  aiScheduled: boolean;
  orgStatus?: keyof typeof ORG_INTERVIEW_STATUS_LABELS;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge tone={aiScheduled ? "brand" : "neutral"}>
        AI {aiScheduled ? "scheduled" : "—"}
      </Badge>
      {orgStatus ? (
        <span className={ORG_INTERVIEW_STATUS_BADGE[orgStatus]}>
          Org · {ORG_INTERVIEW_STATUS_LABELS[orgStatus]}
        </span>
      ) : (
        <Badge tone="neutral">Org —</Badge>
      )}
    </div>
  );
}
