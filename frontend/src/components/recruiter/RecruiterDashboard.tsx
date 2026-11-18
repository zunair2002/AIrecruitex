"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  Mic,
  Plus,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listMyJobs } from "@/lib/jobsApi";
import { listApplicationsForJob } from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  BADGE_DOTS,
  JOB_STATUS_BADGE,
  JOB_STATUS_LABELS,
  formatDate,
  formatDateTime,
} from "@/lib/format";
import { populated, type Application, type Job } from "@/lib/types";
import {
  Avatar,
  Badge,
  Button,
  ErrorBlock,
  LoadingBlock,
  PageSkeleton,
  scoreTone,
} from "@/components/ui";
import {
  CountTabs,
  EmptyLine,
  Panel,
  PanelLink,
  PortalPage,
} from "@/components/dashboard/primitives";
import {
  DashboardHero,
  HeroButton,
  HeroMeter,
} from "@/components/dashboard/DashboardHero";

type JobWithApplications = { job: Job; applications: Application[] };
type FeedTab = "applicants" | "interviews" | "selected";

/** Status → chart colour, shared by the donut, its legend and the job bars. */
const STATUS_SERIES = [
  { key: "pending", label: "Pending", swatch: "bg-chart-3", stroke: "var(--color-chart-3)" },
  { key: "selected", label: "Selected", swatch: "bg-chart-2", stroke: "var(--color-chart-2)" },
  { key: "rejected", label: "Rejected", swatch: "bg-chart-4", stroke: "var(--color-chart-4)" },
] as const;

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

const percent = (value: number, total: number) =>
  total ? Math.round((value / total) * 100) : 0;

/**
 * The HR overview: a hero with the headline numbers, then the hiring funnel,
 * the applicants waiting on a decision and the activity feed, next to upcoming
 * interviews, the job list and the status breakdown.
 *
 * The backend has no HR-wide aggregate endpoint, so the pipeline is assembled
 * from GET /api/jobs/mine plus GET /api/applications/job/:jobId per job.
 */
export function RecruiterDashboard() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState<FeedTab>("applicants");

  const jobs = useApiResource((signal) => listMyJobs(token, signal), [token], {
    enabled: Boolean(token),
  });

  const pipeline = useApiResource<JobWithApplications[]>(
    async (signal) =>
      Promise.all(
        (jobs.data ?? []).map(async (job) => {
          try {
            return {
              job,
              applications: await listApplicationsForJob(job._id, token, signal),
            };
          } catch {
            // One unreadable job shouldn't blank the whole dashboard.
            return { job, applications: [] as Application[] };
          }
        }),
      ),
    [jobs.data, token],
    { enabled: Boolean(token && jobs.data) },
  );

  const rows = useMemo(() => pipeline.data ?? [], [pipeline.data]);

  const summary = useMemo(() => {
    const all = rows.flatMap((row) => row.applications);
    const scored = all.filter((a) => typeof a.matchScore === "number");
    return {
      totalJobs: rows.length,
      openJobs: rows.filter((r) => r.job.status === "open").length,
      totalApplicants: all.length,
      matched: all.filter((a) => a.matched).length,
      pending: all.filter((a) => a.status === "pending").length,
      selected: all.filter((a) => a.status === "selected").length,
      rejected: all.filter((a) => a.status === "rejected").length,
      aiInterviews: all.filter((a) => a.aiInterview.scheduled).length,
      orgInvites: all.filter((a) => a.orgInterview?.status === "invited").length,
      averageMatch: scored.length
        ? Math.round(
            scored.reduce((sum, a) => sum + a.matchScore, 0) / scored.length,
          )
        : 0,
      all,
    };
  }, [rows]);

  const jobOf = (application: Application) =>
    rows.find((row) =>
      row.applications.some((a) => a._id === application._id),
    )?.job;

  const feed = useMemo(() => {
    const byNewest = (a: Application, b: Application) =>
      b.createdAt.localeCompare(a.createdAt);
    if (tab === "interviews") {
      return summary.all
        .filter(
          (a) => a.aiInterview.scheduled || a.orgInterview?.status === "invited",
        )
        .sort(byNewest);
    }
    if (tab === "selected") {
      return summary.all.filter((a) => a.status === "selected").sort(byNewest);
    }
    return [...summary.all].sort(byNewest);
  }, [summary.all, tab]);

  if (jobs.isLoading) {
    return (
      <PortalPage>
        <PageSkeleton label="Loading dashboard…" />
      </PortalPage>
    );
  }
  if (jobs.error) {
    return (
      <PortalPage>
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      </PortalPage>
    );
  }

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const waiting = summary.all
    .filter((a) => a.status === "pending" && a.matched)
    .sort((a, b) => b.matchScore - a.matchScore);
  const interviews = summary.aiInterviews + summary.orgInvites;
  const upcoming = summary.all
    .filter((a) => a.aiInterview.scheduled)
    .slice(0, 4);
  const statusCounts = {
    pending: summary.pending,
    selected: summary.selected,
    rejected: summary.rejected,
  };
  const funnel = [
    { label: "Applied", hint: "All applications", value: summary.totalApplicants, fill: "bg-brand-700" },
    { label: "Matched", hint: "Above the match threshold", value: summary.matched, fill: "bg-brand-600" },
    { label: "AI interviewed", hint: "AI interview scheduled", value: summary.aiInterviews, fill: "bg-brand-500" },
    { label: "Selected", hint: "Moved to selected", value: summary.selected, fill: "bg-brand-400" },
  ];

  const description = pipeline.isLoading
    ? "Pulling together your hiring pipeline…"
    : waiting.length > 0
      ? `${plural(waiting.length, "matched applicant")} ${waiting.length === 1 ? "is" : "are"} waiting for a decision across ${plural(summary.openJobs, "open role")}.`
      : `You're all caught up: no matched applicants are waiting for a decision.`;

  return (
    <PortalPage>
      <DashboardHero
        eyebrow="HR dashboard"
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description={description}
        actions={
          <>
            <HeroButton
              href="/recruiter/jobs/create"
              icon={<Plus aria-hidden="true" />}
            >
              Create job
            </HeroButton>
            <HeroButton
              href="/recruiter/applicants"
              variant="ghost"
              icon={<ClipboardList aria-hidden="true" />}
            >
              Review applicants
            </HeroButton>
          </>
        }
        aside={
          <HeroMeter
            value={summary.averageMatch}
            label="Average match"
            caption={`Across ${plural(summary.totalApplicants, "applicant")} · ${summary.matched} above threshold`}
          />
        }
        stats={[
          {
            label: "Open jobs",
            value: summary.openJobs,
            detail: `${summary.totalJobs} posted in total`,
            icon: <BriefcaseBusiness aria-hidden="true" />,
          },
          {
            label: "Applicants",
            value: summary.totalApplicants,
            detail: `${summary.pending} awaiting review`,
            icon: <Users aria-hidden="true" />,
            trend: summary.pending > 0 ? "down" : "neutral",
          },
          {
            label: "Interviews",
            value: interviews,
            detail: `${summary.aiInterviews} AI · ${plural(summary.orgInvites, "org invite")}`,
            icon: <Mic aria-hidden="true" />,
          },
          {
            label: "Selected",
            value: summary.selected,
            detail: `${percent(summary.selected, summary.totalApplicants)}% of applicants`,
            icon: <Star aria-hidden="true" />,
            trend: summary.selected > 0 ? "up" : "neutral",
          },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-6">
        {/* ---------------- main column ---------------- */}
        <div className="min-w-0 space-y-4 lg:col-span-2 lg:space-y-6">
          <Panel
            title="Hiring funnel"
            description="How applicants move from application to offer, across all your jobs."
            action={<PanelLink href="/recruiter/applicants">View applicants</PanelLink>}
          >
            {pipeline.isLoading ? (
              <LoadingBlock variant="skeleton" rows={4} label="Loading pipeline…" />
            ) : (
              <>
                <ol className="space-y-4">
                  {funnel.map((stage, index) => {
                    const share = percent(stage.value, summary.totalApplicants);
                    const previous = index > 0 ? funnel[index - 1].value : null;
                    return (
                      <li
                        key={stage.label}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[9.5rem_minmax(0,1fr)_7rem]"
                      >
                        <div className="col-start-1 row-start-1 min-w-0">
                          <p className="text-sm font-semibold text-ink">{stage.label}</p>
                          <p className="truncate text-xs text-muted">{stage.hint}</p>
                        </div>
                        <div
                          role="img"
                          aria-label={`${stage.label}: ${stage.value} of ${summary.totalApplicants} applicants`}
                          className="col-span-2 col-start-1 row-start-2 h-10 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-inset ring-line-soft sm:col-span-1 sm:col-start-2 sm:row-start-1"
                        >
                          <div
                            className={`flex h-full items-center justify-end rounded-lg px-3 transition-[width] duration-700 ${stage.fill}`}
                            style={{ width: `${stage.value > 0 ? Math.max(share, 3) : 0}%` }}
                          >
                            {share >= 20 && (
                              <span className="text-xs font-semibold tabular-nums text-white/90">
                                {share}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-start-2 row-start-1 text-right sm:col-start-3">
                          <p className="font-display text-xl font-semibold leading-tight tracking-tight tabular-nums text-ink">
                            {stage.value}
                          </p>
                          <p className="text-xs text-muted tabular-nums">
                            {previous === null
                              ? "applicants"
                              : `${percent(stage.value, previous)}% conversion`}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-6 flex items-start gap-3 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800 ring-1 ring-inset ring-brand-600/10">
                  <TrendingUp aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold tabular-nums">
                      {percent(summary.selected, summary.totalApplicants)}%
                    </span>{" "}
                    of applicants have been selected so far, with an average
                    match of{" "}
                    <span className="font-semibold tabular-nums">
                      {summary.averageMatch}%
                    </span>
                    .
                  </span>
                </p>
              </>
            )}
          </Panel>

          <Panel
            title="Needs your attention"
            description="Matched applicants still waiting for a decision, best match first."
            action={
              waiting.length > 0 ? (
                <Badge tone="warning" dot>
                  <span className="tabular-nums">{waiting.length} waiting</span>
                </Badge>
              ) : undefined
            }
          >
            {pipeline.isLoading ? (
              <LoadingBlock variant="skeleton" rows={3} label="Loading applicants…" />
            ) : waiting.length === 0 ? (
              <EmptyLine>Every matched applicant has a decision.</EmptyLine>
            ) : (
              <ul className="-mx-5 -mb-5 divide-y divide-line-soft border-t border-line-soft sm:-mx-6 sm:-mb-6">
                {waiting.slice(0, 5).map((application) => {
                  const candidate = populated(application.candidateId);
                  const job = jobOf(application);
                  const name = candidate?.name ?? "Unknown candidate";
                  return (
                    <li
                      key={application._id}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2/60 sm:gap-4 sm:px-6"
                    >
                      <Avatar name={name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{name}</p>
                        <p className="truncate text-sm text-muted">
                          {job?.title ?? "—"}
                          <span className="hidden sm:inline">
                            {" "}· Applied {formatDate(application.createdAt)}
                          </span>
                        </p>
                      </div>
                      <Badge tone={scoreTone(application.matchScore)} className="tabular-nums">
                        {application.matchScore}%
                        <span className="sr-only sm:not-sr-only"> match</span>
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        href={
                          job
                            ? `/recruiter/applicants?jobId=${job._id}`
                            : "/recruiter/applicants"
                        }
                        aria-label={`Review ${name}`}
                      >
                        Review
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Recent activity"
            action={<PanelLink href="/recruiter/applicants">View all</PanelLink>}
          >
            <CountTabs<FeedTab>
              value={tab}
              onChange={setTab}
              tabs={[
                { id: "applicants", label: "Applicants", count: summary.totalApplicants },
                { id: "interviews", label: "Interviews", count: interviews },
                { id: "selected", label: "Selected", count: summary.selected },
              ]}
            />

            {pipeline.isLoading ? (
              <div className="pt-4">
                <LoadingBlock variant="skeleton" rows={4} label="Loading applicants…" />
              </div>
            ) : feed.length === 0 ? (
              <EmptyLine>
                {tab === "applicants"
                  ? "No applicants yet."
                  : tab === "interviews"
                    ? "No interviews scheduled."
                    : "No candidates selected yet."}
              </EmptyLine>
            ) : (
              <ul className="-mx-5 -mb-5 divide-y divide-line-soft sm:-mx-6 sm:-mb-6">
                {feed.slice(0, 6).map((application) => {
                  const candidate = populated(application.candidateId);
                  const job = jobOf(application);
                  const name = candidate?.name ?? "Unknown candidate";
                  return (
                    <li
                      key={application._id}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2/60 sm:gap-4 sm:px-6"
                    >
                      <Avatar name={name} size="md" tone="neutral" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="min-w-0 truncate text-sm font-semibold text-ink">
                            {name}
                          </p>
                          <span className={APPLICATION_STATUS_BADGE[application.status]}>
                            {APPLICATION_STATUS_LABELS[application.status]}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-muted">
                          {job?.title ?? "—"}
                          <span aria-hidden="true"> · </span>
                          {formatDate(application.createdAt)}
                        </p>
                        {(application.aiInterview.scheduled ||
                          application.orgInterview?.status === "invited") && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {application.aiInterview.scheduled && (
                              <Badge tone="brand">
                                AI interview ·{" "}
                                {formatDateTime(application.aiInterview.dateTime)}
                              </Badge>
                            )}
                            {application.orgInterview?.status === "invited" && (
                              <Badge tone="info">Org invite sent</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <MatchScore score={application.matchScore} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        {/* ---------------- side column ---------------- */}
        <div className="min-w-0 space-y-4 lg:space-y-6">
          <Panel
            title="Upcoming interviews"
            aside
            action={
              upcoming.length > 0 ? (
                <Badge tone="brand">
                  <span className="tabular-nums">{upcoming.length} scheduled</span>
                </Badge>
              ) : undefined
            }
          >
            {summary.aiInterviews === 0 && summary.orgInvites === 0 ? (
              <EmptyLine>Nothing scheduled.</EmptyLine>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((application) => {
                  const candidate = populated(application.candidateId);
                  const job = jobOf(application);
                  return (
                    <li
                      key={application._id}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2 -mx-2"
                    >
                      <DateTile value={application.aiInterview.dateTime} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {candidate?.name ?? "Candidate"}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {job?.title ?? "AI interview"}
                          <span className="sr-only">
                            {" "}· {formatDateTime(application.aiInterview.dateTime)}
                          </span>
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium tabular-nums text-body">
                        {formatTime(application.aiInterview.dateTime)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Your jobs"
            aside
            action={<PanelLink href="/recruiter/jobs">All jobs</PanelLink>}
          >
            {rows.length === 0 ? (
              <EmptyLine>No jobs posted yet.</EmptyLine>
            ) : (
              <ul className="space-y-2.5">
                {rows.slice(0, 6).map(({ job, applications }) => {
                  const counts = {
                    pending: applications.filter((a) => a.status === "pending").length,
                    selected: applications.filter((a) => a.status === "selected").length,
                    rejected: applications.filter((a) => a.status === "rejected").length,
                  };
                  return (
                    <li key={job._id}>
                      <Link
                        href={`/recruiter/applicants?jobId=${job._id}`}
                        className="block rounded-lg border border-line-soft p-3 transition-colors hover:border-brand-200 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 truncate text-sm font-medium text-ink">
                            {job.title}
                          </p>
                          <span className={JOB_STATUS_BADGE[job.status]}>
                            {JOB_STATUS_LABELS[job.status]}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted tabular-nums">
                          {plural(applications.length, "applicant")}
                        </p>
                        <div
                          aria-hidden="true"
                          className="mt-2.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-surface-3"
                        >
                          {STATUS_SERIES.map((series) =>
                            counts[series.key] > 0 ? (
                              <div
                                key={series.key}
                                className={series.swatch}
                                style={{
                                  width: `${percent(counts[series.key], applications.length)}%`,
                                }}
                              />
                            ) : null,
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Applicant status" aside>
            {summary.totalApplicants === 0 ? (
              <EmptyLine>No applicants yet.</EmptyLine>
            ) : (
              <StatusDonut counts={statusCounts} total={summary.totalApplicants} />
            )}
          </Panel>
        </div>
      </div>
    </PortalPage>
  );
}

/** "17:00" from an ISO date, or nothing when it can't be parsed. */
function formatTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** Donut of pending / selected / rejected with the total in the middle. */
function StatusDonut({
  counts,
  total,
}: {
  counts: Record<(typeof STATUS_SERIES)[number]["key"], number>;
  total: number;
}) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const visible = STATUS_SERIES.filter((series) => counts[series.key] > 0);
  const gap = visible.length > 1 ? 3 : 0;
  const segments = visible.map((series, index) => {
    const start = visible
      .slice(0, index)
      .reduce((sum, prev) => sum + (counts[prev.key] / total) * circumference, 0);
    const length = (counts[series.key] / total) * circumference;
    return { series, start, dash: Math.max(length - gap, 0.5) };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
      <div className="relative h-32 w-32 shrink-0">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={STATUS_SERIES.map(
            (series) => `${series.label}: ${counts[series.key]}`,
          ).join(", ")}
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="14"
            stroke="var(--color-surface-3)"
          />
          {segments.map(({ series, start, dash }) => (
            <circle
              key={series.key}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="14"
              stroke={series.stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-start}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold tracking-tight tabular-nums text-ink">
            {total}
          </span>
          <span className="text-xs text-muted">total</span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2.5">
        {STATUS_SERIES.map((series) => (
          <li
            key={series.key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-body">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${series.swatch}`}
              />
              <span className="truncate">{series.label}</span>
            </span>
            <span className="shrink-0 tabular-nums">
              <span className="font-semibold text-ink">{counts[series.key]}</span>
              <span className="ml-1.5 text-xs text-muted">
                {percent(counts[series.key], total)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Match score: the number, with a thin bar in its score colour. */
function MatchScore({ score }: { score: number }) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div className="w-14 shrink-0 text-right sm:w-20">
      <p className="font-display text-base font-semibold tracking-tight tabular-nums text-ink">
        {value}%<span className="sr-only"> match</span>
      </p>
      <div
        aria-hidden="true"
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className={`h-full rounded-full ${BADGE_DOTS[scoreTone(value)]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/** Month + day tile for an interview date (falls back to a calendar icon). */
function DateTile({ value }: { value?: string }) {
  const date = value ? new Date(value) : null;
  const isValid = date !== null && !Number.isNaN(date.getTime());
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/10"
    >
      {isValid && date ? (
        <>
          <span className="text-xs font-medium leading-none">
            {date.toLocaleDateString("en-GB", { month: "short" })}
          </span>
          <span className="mt-1 font-display text-lg font-semibold leading-none tabular-nums">
            {date.getDate()}
          </span>
        </>
      ) : (
        <CalendarClock className="h-5 w-5" />
      )}
    </span>
  );
}
