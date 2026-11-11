"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Mic,
  Star,
  Target,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listMyJobs } from "@/lib/jobsApi";
import { listApplicationsForJob } from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDate, formatDateTime, initials } from "@/lib/format";
import { populated, type Application, type Job } from "@/lib/types";
import { ErrorBlock } from "@/components/ui/Feedback";
import {
  BreakdownBar,
  Chip,
  CountTabs,
  EmptyLine,
  Field,
  FeedRow,
  MetricCard,
  Panel,
  PanelLink,
} from "@/components/dashboard/primitives";

type JobWithApplications = { job: Job; applications: Application[] };
type FeedTab = "applicants" | "interviews" | "selected";

/**
 * The HR overview, laid out in three columns: pipeline facts on the left, the
 * applicant feed in the middle, and the job list on the right.
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

  if (jobs.isLoading) return <DashboardLoading />;
  if (jobs.error) {
    return (
      <div className="p-6">
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f7f8fa] p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-4">
        {/* ---- header ---- */}
        <header className="flex flex-wrap items-center justify-between gap-3 border border-[#e9eaf0] bg-white px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-[13px] font-bold text-brand-dark">
              {initials(user?.name ?? "HR")}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[17px] font-bold tracking-[-0.02em] text-[#292b35]">
                {user?.name ?? "HR Dashboard"}
              </h1>
              <p className="truncate text-[11px] text-[#898b96]">
                Hiring overview · {summary.totalJobs} job
                {summary.totalJobs === 1 ? "" : "s"} ·{" "}
                {summary.totalApplicants} applicant
                {summary.totalApplicants === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/recruiter/applicants"
              className="inline-flex items-center gap-1.5 rounded border border-[#e9eaf0] px-3 py-2 text-[11px] font-medium text-[#686b77] transition-colors hover:text-[#292b35]"
            >
              <ClipboardList aria-hidden="true" className="h-3.5 w-3.5" />
              Review applicants
            </Link>
            <Link
              href="/recruiter/jobs/create"
              className="inline-flex items-center gap-1.5 rounded bg-brand px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Create job
            </Link>
          </div>
        </header>

        {/* ---- metrics ---- */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            label="Jobs posted"
            value={String(summary.totalJobs)}
            detail={`${summary.openJobs} open`}
            icon={<BriefcaseBusiness aria-hidden="true" className="h-4 w-4 text-violet-600" />}
            iconClass="bg-violet-50"
          />
          <MetricCard
            label="Applicants"
            value={String(summary.totalApplicants)}
            detail={`${summary.pending} awaiting review`}
            icon={<UserRound aria-hidden="true" className="h-4 w-4 text-sky-600" />}
            iconClass="bg-sky-50"
          />
          <MetricCard
            label="Above threshold"
            value={String(summary.matched)}
            detail={`${summary.averageMatch}% average match`}
            icon={<Target aria-hidden="true" className="h-4 w-4 text-amber-600" />}
            iconClass="bg-amber-50"
          />
          <MetricCard
            label="Selected"
            value={String(summary.selected)}
            detail={`${summary.orgInvites} invited to interview`}
            icon={<Star aria-hidden="true" className="h-4 w-4 text-emerald-600" />}
            iconClass="bg-emerald-50"
          />
        </div>

        {/* ---- three columns ---- */}
        <div className="grid gap-3 lg:grid-cols-12">
          {/* left: pipeline facts */}
          <div className="space-y-3 lg:col-span-3">
            <Panel title="Pipeline" aside>
              <div className="space-y-3.5">
                <Field label="Open roles">
                  {summary.openJobs} of {summary.totalJobs}
                </Field>
                <Field label="Average match score">
                  {summary.averageMatch}%
                </Field>
                <Field label="AI interviews scheduled">
                  {summary.aiInterviews}
                </Field>
                <Field label="Org interview invites">{summary.orgInvites}</Field>
              </div>
            </Panel>

            <Panel title="Applicant status" aside>
              {summary.totalApplicants === 0 ? (
                <EmptyLine>No applicants yet.</EmptyLine>
              ) : (
                <BreakdownBar
                  total={summary.totalApplicants}
                  rows={[
                    { label: "Pending", value: summary.pending, className: "bg-amber-400" },
                    { label: "Selected", value: summary.selected, className: "bg-emerald-500" },
                    { label: "Rejected", value: summary.rejected, className: "bg-slate-300" },
                  ]}
                />
              )}
            </Panel>
          </div>

          {/* centre: applicant feed */}
          <div className="lg:col-span-6">
            <Panel
              title="Activity"
              action={<PanelLink href="/recruiter/applicants">View all</PanelLink>}
            >
              <CountTabs<FeedTab>
                value={tab}
                onChange={setTab}
                tabs={[
                  { id: "applicants", label: "Applicants", count: summary.totalApplicants },
                  {
                    id: "interviews",
                    label: "Interviews",
                    count: summary.aiInterviews + summary.orgInvites,
                  },
                  { id: "selected", label: "Selected", count: summary.selected },
                ]}
              />

              {pipeline.isLoading ? (
                <EmptyLine>Loading applicants…</EmptyLine>
              ) : feed.length === 0 ? (
                <EmptyLine>
                  {tab === "applicants"
                    ? "No applicants yet."
                    : tab === "interviews"
                      ? "No interviews scheduled."
                      : "No candidates selected yet."}
                </EmptyLine>
              ) : (
                <div className="mt-1">
                  {feed.slice(0, 8).map((application) => {
                    const candidate = populated(application.candidateId);
                    const job = jobOf(application);
                    return (
                      <FeedRow
                        key={application._id}
                        icon={
                          tab === "interviews" ? (
                            <Mic aria-hidden="true" className="h-3.5 w-3.5 text-violet-600" />
                          ) : tab === "selected" ? (
                            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <UserRound aria-hidden="true" className="h-3.5 w-3.5 text-sky-600" />
                          )
                        }
                        iconClass={
                          tab === "interviews"
                            ? "bg-violet-50"
                            : tab === "selected"
                              ? "bg-emerald-50"
                              : "bg-sky-50"
                        }
                        title={candidate?.name ?? "Unknown candidate"}
                        meta={formatDate(application.createdAt)}
                        detail={
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate">{job?.title ?? "—"}</span>
                            <Chip
                              tone={
                                application.status === "selected"
                                  ? "emerald"
                                  : application.status === "rejected"
                                    ? "rose"
                                    : "amber"
                              }
                            >
                              {application.status}
                            </Chip>
                            {application.aiInterview.scheduled && (
                              <Chip tone="brand">
                                AI · {formatDateTime(application.aiInterview.dateTime)}
                              </Chip>
                            )}
                            {application.orgInterview?.status === "invited" && (
                              <Chip tone="brand">Org invite sent</Chip>
                            )}
                          </span>
                        }
                        trailing={
                          <span className="text-[13px] font-bold tracking-[-0.03em] text-[#292b35]">
                            {application.matchScore}%
                          </span>
                        }
                      />
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>

          {/* right: jobs */}
          <div className="space-y-3 lg:col-span-3">
            <Panel
              title="Your jobs"
              aside
              action={<PanelLink href="/recruiter/jobs">All</PanelLink>}
            >
              {rows.length === 0 ? (
                <EmptyLine>No jobs posted yet.</EmptyLine>
              ) : (
                <div className="space-y-2.5">
                  {rows.slice(0, 6).map(({ job, applications }) => (
                    <Link
                      key={job._id}
                      href={`/recruiter/applicants?jobId=${job._id}`}
                      className="block border border-[#f1f1f5] p-2.5 transition-colors hover:border-[#e0d6ea] hover:bg-[#faf9fc]"
                    >
                      <p className="truncate text-[12px] font-semibold text-[#292b35]">
                        {job.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#9698a2]">
                        <span>
                          {applications.length} applicant
                          {applications.length === 1 ? "" : "s"}
                        </span>
                        <Chip tone={job.status === "open" ? "emerald" : "neutral"}>
                          {job.status}
                        </Chip>
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Upcoming interviews" aside>
              {summary.aiInterviews === 0 && summary.orgInvites === 0 ? (
                <EmptyLine>Nothing scheduled.</EmptyLine>
              ) : (
                <div className="space-y-2.5">
                  {summary.all
                    .filter((a) => a.aiInterview.scheduled)
                    .slice(0, 4)
                    .map((application) => {
                      const candidate = populated(application.candidateId);
                      return (
                        <div
                          key={application._id}
                          className="flex items-start gap-2"
                        >
                          <CalendarClock
                            aria-hidden="true"
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-medium text-[#292b35]">
                              {candidate?.name ?? "Candidate"}
                            </p>
                            <p className="text-[10px] text-[#9698a2]">
                              {formatDateTime(application.aiInterview.dateTime)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-full bg-[#f7f8fa] p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px] animate-pulse space-y-4">
        <div className="h-16 bg-white" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-20 bg-white" />
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="h-64 bg-white lg:col-span-3" />
          <div className="h-64 bg-white lg:col-span-6" />
          <div className="h-64 bg-white lg:col-span-3" />
        </div>
      </div>
    </div>
  );
}
