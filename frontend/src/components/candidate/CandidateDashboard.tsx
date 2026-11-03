"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  FileCheck2,
  Search,
  Target,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useApplicationEvents,
  useServerEvent,
} from "@/context/RealtimeContext";
import { listMyApplications } from "@/lib/applicationsApi";
import { listOpenJobs } from "@/lib/jobsApi";
import { listMyNotifications } from "@/lib/notificationsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUS_LABELS,
  formatDate,
  formatDateTime,
  scoreColor,
  timeUntil,
} from "@/lib/format";
import {
  populated,
  type Application,
  type ApplicationStatus,
  type Notification,
} from "@/lib/types";
import { ErrorBlock } from "@/components/ui/Feedback";

type ChartRange = "Monthly" | "Weekly" | "Quarterly";
type StatusFilter = "all" | ApplicationStatus;

const EMPTY_APPLICATIONS: Application[] = [];
const EMPTY_NOTIFICATIONS: Notification[] = [];
const chartRanges: ChartRange[] = ["Monthly", "Weekly", "Quarterly"];
const statusFilters: StatusFilter[] = [
  "all",
  "pending",
  "selected",
  "rejected",
];

const statusColors: Record<ApplicationStatus, string> = {
  pending: "#f6b94a",
  selected: "#45b9a7",
  rejected: "#ef7474",
};

const statusClasses: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  selected: "bg-emerald-50 text-emerald-700",
  rejected: "bg-slate-100 text-slate-500",
};

function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 border border-[#e9eaf0] bg-white p-4 sm:p-5 ${className}`}
    >
      <div className="mb-4 flex min-h-6 items-center justify-between gap-3">
        <h2 className="text-[13px] font-bold tracking-[-0.01em] text-[#292b35]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function PanelLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-[#686b77] transition-colors hover:text-violet-700"
    >
      {children}
      <ArrowRight aria-hidden="true" className="h-3 w-3" />
    </Link>
  );
}

function RangeTabs({
  value,
  onChange,
}: {
  value: ChartRange;
  onChange: (range: ChartRange) => void;
}) {
  return (
    <div
      aria-label="Activity chart range"
      className="flex items-center rounded border border-[#ececf1] p-0.5"
    >
      {chartRanges.map((range) => (
        <button
          key={range}
          type="button"
          aria-pressed={value === range}
          onClick={() => onChange(range)}
          className={`rounded px-2 py-1 text-[9px] transition-colors sm:px-2.5 ${
            value === range
              ? "bg-[#f0efff] font-semibold text-[#6658d9]"
              : "text-[#858793] hover:text-[#454752]"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <article className="flex min-h-[76px] items-center justify-between gap-3 border border-[#ececf1] bg-white px-3 py-3 sm:px-4">
      <div className="min-w-0">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.07em] text-[#898b96]">
          {label}
        </p>
        <p className="mt-1 text-[19px] font-bold leading-none tracking-[-0.04em] text-[#292b35]">
          {value}
        </p>
        <p className="mt-1 truncate text-[9px] text-[#9698a2]">{detail}</p>
      </div>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center ${iconClass}`}>
        {icon}
      </span>
    </article>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-full bg-[#f7f8fa] p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px] animate-pulse space-y-4">
        <div className="h-8 bg-white" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-20 bg-white" />
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="h-64 bg-white" />
          <div className="h-64 bg-white" />
        </div>
      </div>
    </div>
  );
}

function getActivityBuckets(applications: Application[], range: ChartRange) {
  const now = new Date();
  const buckets = Array.from({ length: 6 }, (_, index) => {
    let start: Date;
    let end: Date;
    let label: string;

    if (range === "Weekly") {
      const currentWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      currentWeek.setDate(currentWeek.getDate() - ((currentWeek.getDay() + 6) % 7));
      start = new Date(currentWeek);
      start.setDate(start.getDate() - (5 - index) * 7);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      label = start.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    } else if (range === "Quarterly") {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const quarterStartMonth = (currentQuarter - (5 - index)) * 3;
      start = new Date(now.getFullYear(), quarterStartMonth, 1);
      end = new Date(now.getFullYear(), quarterStartMonth + 3, 1);
      label = `Q${Math.floor(start.getMonth() / 3) + 1} ${String(start.getFullYear()).slice(-2)}`;
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      end = new Date(now.getFullYear(), now.getMonth() - 4 + index, 1);
      label = start.toLocaleDateString(undefined, { month: "short" });
    }

    const bucketApplications = applications.filter((application) => {
      const appliedAt = new Date(application.createdAt);
      return (
        !Number.isNaN(appliedAt.getTime()) &&
        appliedAt >= start &&
        appliedAt < end
      );
    }).length;
    const matched = applications.filter((application) => {
      const appliedAt = new Date(application.createdAt);
      return (
        application.matched &&
        !Number.isNaN(appliedAt.getTime()) &&
        appliedAt >= start &&
        appliedAt < end
      );
    }).length;
    const selected = applications.filter((application) => {
      const appliedAt = new Date(application.createdAt);
      return (
        application.status === "selected" &&
        !Number.isNaN(appliedAt.getTime()) &&
        appliedAt >= start &&
        appliedAt < end
      );
    }).length;
    return { label, count: bucketApplications, matched, selected };
  });

  return buckets;
}

export function CandidateDashboard() {
  const { user, token } = useAuth();
  const [chartRange, setChartRange] = useState<ChartRange>("Monthly");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const enabled = Boolean(token);

  const applications = useApiResource(
    (signal) => listMyApplications(token, signal),
    [token],
    { enabled },
  );
  const jobs = useApiResource(
    (signal) => listOpenJobs(token, signal),
    [token],
    { enabled },
  );
  const notifications = useApiResource(
    (signal) => listMyNotifications(token, signal),
    [token],
    { enabled },
  );

  useApplicationEvents(() => applications.reload());
  useServerEvent("admin:notification", () => notifications.reload());

  const applicationList = applications.data ?? EMPTY_APPLICATIONS;
  const notificationList = notifications.data ?? EMPTY_NOTIFICATIONS;

  const summary = useMemo(() => {
    const scored = applicationList.filter(
      (application) => typeof application.matchScore === "number",
    );
    return {
      total: applicationList.length,
      matched: applicationList.filter((application) => application.matched)
        .length,
      selected: applicationList.filter(
        (application) => application.status === "selected",
      ).length,
      pending: applicationList.filter(
        (application) => application.status === "pending",
      ).length,
      averageMatch: scored.length
        ? Math.round(
            scored.reduce((sum, application) => sum + application.matchScore, 0) /
              scored.length,
          )
        : 0,
      upcoming: applicationList.filter(
        (application) =>
          application.aiInterview.scheduled ||
          application.orgInterview?.status === "invited",
      ),
    };
  }, [applicationList]);

  const statusSummary = useMemo(
    () =>
      (["pending", "selected", "rejected"] as const).map((status) => ({
        status,
        count: applicationList.filter(
          (application) => application.status === status,
        ).length,
      })),
    [applicationList],
  );

  const activityBuckets = useMemo(
    () => getActivityBuckets(applicationList, chartRange),
    [applicationList, chartRange],
  );

  const filteredApplications = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return applicationList.filter((application) => {
      const title = populated(application.jobId)?.title ?? "Job removed";
      const matchesStatus =
        statusFilter === "all" || application.status === statusFilter;
      const matchesSearch = !normalizedSearch || title.toLocaleLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [applicationList, search, statusFilter]);

  const unreadCount = notificationList.filter(
    (notification) => !notification.read,
  ).length;

  if (applications.isLoading) {
    return <DashboardLoading />;
  }

  const maxActivity = Math.max(
    ...activityBuckets.flatMap((bucket) => [
      bucket.count,
      bucket.matched,
      bucket.selected,
    ]),
    1,
  );
  const getChartPoints = (key: "count" | "matched" | "selected") =>
    activityBuckets
      .map((bucket, index) => {
        const x = 20 + index * 84;
        const y = 124 - (bucket[key] / maxActivity) * 86;
        return `${x},${y}`;
      })
      .join(" ");
  const statusTotal = statusSummary.reduce((sum, item) => sum + item.count, 0);
  const circumference = 2 * Math.PI * 39;
  let segmentOffset = 0;
  const recentNotifications = notificationList.slice(0, 5);

  return (
    <div className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div className="mx-auto max-w-[1500px] space-y-3">
        <header className="flex min-h-8 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e9eaf0] bg-white text-[#767985]">
              <BriefcaseBusiness aria-hidden="true" className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-semibold text-[#30323b]">
                Dashboard
              </h1>
              <p className="hidden text-[10px] text-[#999ba4] sm:block">
                {user ? `Welcome back, ${user.name}` : "Your candidate overview"}
              </p>
            </div>
          </div>
          <Link
            href="/candidate/jobs"
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded bg-[#6b5ce7] px-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#5849d1]"
          >
            <span aria-hidden="true" className="text-sm leading-none">+</span>
            Find jobs
          </Link>
        </header>

        {applications.error && (
          <ErrorBlock
            message={applications.error}
            onRetry={applications.reload}
          />
        )}

        <section
          aria-label="Application overview"
          className="grid grid-cols-2 gap-2.5 xl:grid-cols-4"
        >
          <MetricCard
            label="Applications"
            value={String(summary.total)}
            detail={`${summary.pending} awaiting response`}
            icon={<FileCheck2 aria-hidden="true" className="h-4 w-4" />}
            iconClass="bg-[#f0efff] text-[#6b5ce7]"
          />
          <MetricCard
            label="Matched applications"
            value={String(summary.matched)}
            detail={`${summary.averageMatch}% average match`}
            icon={<Target aria-hidden="true" className="h-4 w-4" />}
            iconClass="bg-[#eaf7f5] text-[#46aa9e]"
          />
          <MetricCard
            label="Selected by employers"
            value={String(summary.selected)}
            detail={`${summary.upcoming.length} interview${summary.upcoming.length === 1 ? "" : "s"} scheduled`}
            icon={<Check aria-hidden="true" className="h-4 w-4" />}
            iconClass="bg-[#edf7ee] text-[#50a66d]"
          />
          <MetricCard
            label="Open jobs"
            value={String(jobs.data?.length ?? 0)}
            detail={
              unreadCount
                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "No new notifications"
            }
            icon={<BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />}
            iconClass="bg-[#fff4e8] text-[#e29a42]"
          />
        </section>

        <section className="grid gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(285px,1fr)]">
          <Panel
            title="Application Overview"
            action={
              <RangeTabs value={chartRange} onChange={setChartRange} />
            }
          >
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-[18px] font-bold tracking-tight text-[#30323b]">
                {summary.total}
              </span>
              <span className="text-[9px] text-[#92949d]">
                applications submitted
              </span>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-5 pt-1">
                {[0, 1, 2, 3].map((line) => (
                  <div
                    key={line}
                    className="border-t border-dashed border-[#eef0f4]"
                  />
                ))}
              </div>
              <svg
                role="img"
                aria-label={`${chartRange} application activity chart`}
                viewBox="0 0 440 142"
                className="relative h-[138px] w-full overflow-visible"
                preserveAspectRatio="none"
              >
                <polyline
                  points={getChartPoints("count")}
                  fill="none"
                  stroke="#7163df"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={getChartPoints("matched")}
                  fill="none"
                  stroke="#65c4cf"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={getChartPoints("selected")}
                  fill="none"
                  stroke="#b8bbc4"
                  strokeWidth="1.4"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {activityBuckets.map((bucket, index) => {
                  const x = 20 + index * 84;
                  const y = 124 - (bucket.count / maxActivity) * 86;
                  return (
                    <circle
                      key={`${bucket.label}-${index}`}
                      cx={x}
                      cy={y}
                      r="2.5"
                      fill="white"
                      stroke="#7163df"
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                    >
                      <title>
                        {bucket.label}: {bucket.count} application
                        {bucket.count === 1 ? "" : "s"}
                      </title>
                    </circle>
                  );
                })}
              </svg>
              <div className="grid grid-cols-6 text-center text-[9px] text-[#92949d]">
                {activityBuckets.map((bucket, index) => (
                  <span key={`${bucket.label}-${index}`}>{bucket.label}</span>
                ))}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#f0f0f3] pt-2.5 text-[9px] text-[#777a85]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-[#7163df]" />
                Applications
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-[#65c4cf]" />
                Profile matches
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full border-t border-dashed border-[#b8bbc4]" />
                Selected
              </span>
            </div>
          </Panel>

          <Panel
            title="Application Status"
            action={
              <span className="inline-flex items-center gap-1 rounded border border-[#ececf1] px-2 py-1 text-[9px] text-[#858792]">
                All applications
                <ChevronDown aria-hidden="true" className="h-3 w-3" />
              </span>
            }
          >
            <div className="flex min-h-[190px] flex-col items-center justify-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
              <div className="relative h-[132px] w-[132px] shrink-0">
                <svg
                  role="img"
                  aria-label={`Application status breakdown, ${statusTotal} total`}
                  viewBox="0 0 100 100"
                  className="h-full w-full -rotate-90"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="39"
                    fill="none"
                    stroke="#f0f1f5"
                    strokeWidth="11"
                  />
                  {statusSummary.map(({ status, count }) => {
                    const length = statusTotal
                      ? (count / statusTotal) * circumference
                      : 0;
                    const circle = (
                      <circle
                        key={status}
                        cx="50"
                        cy="50"
                        r="39"
                        fill="none"
                        stroke={statusColors[status]}
                        strokeWidth="11"
                        strokeDasharray={`${length} ${circumference - length}`}
                        strokeDashoffset={-segmentOffset}
                        strokeLinecap="butt"
                      />
                    );
                    segmentOffset += length;
                    return circle;
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[21px] font-bold text-[#30323b]">
                    {statusTotal}
                  </span>
                  <span className="text-[9px] text-[#9698a1]">Applications</span>
                </div>
              </div>
              <div className="w-full max-w-[195px] space-y-2.5">
                {statusSummary.map(({ status, count }) => {
                  const percent = statusTotal
                    ? Math.round((count / statusTotal) * 100)
                    : 0;
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between gap-3 border-b border-[#f2f2f5] pb-2 last:border-0"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-[10px] text-[#666974]">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: statusColors[status] }}
                        />
                        {APPLICATION_STATUS_LABELS[status]}
                      </span>
                      <span className="shrink-0 text-[9px] text-[#888a94]">
                        {percent}%
                        <span className="ml-1.5 font-semibold text-[#42444e]">
                          {count}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(285px,1fr)]">
          <Panel
            title="Recent Applications"
            action={
              <PanelLink href="/candidate/applications">View all</PanelLink>
            }
          >
            <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div
                role="tablist"
                aria-label="Filter applications by status"
                className="flex min-w-0 items-center gap-0.5 overflow-x-auto border-b border-[#eeeeF2]"
              >
                {statusFilters.map((filter) => {
                  const count =
                    filter === "all"
                      ? applicationList.length
                      : statusSummary.find((item) => item.status === filter)
                          ?.count ?? 0;
                  const label =
                    filter === "all"
                      ? "All"
                      : APPLICATION_STATUS_LABELS[filter];
                  return (
                    <button
                      key={filter}
                      id={`application-filter-${filter}`}
                      type="button"
                      role="tab"
                      aria-selected={statusFilter === filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`shrink-0 border-b-2 px-2 py-2 text-[9px] transition-colors ${
                        statusFilter === filter
                          ? "border-[#6b5ce7] font-semibold text-[#5b4ed1]"
                          : "border-transparent text-[#898b95] hover:text-[#50525d]"
                      }`}
                    >
                      {label}
                      <span className="ml-1 text-[8px] text-[#a3a5ad]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <label className="flex h-7 w-full items-center gap-1.5 border border-[#e9eaf0] px-2 sm:max-w-[165px]">
                <Search
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0 text-[#9a9ca5]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search applications"
                  className="min-w-0 flex-1 bg-transparent text-[9px] text-[#42444e] outline-none placeholder:text-[#a3a5ad]"
                  aria-label="Search applications by job title"
                />
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[510px] table-fixed border-collapse text-left">
                <thead>
                  <tr className="border-y border-[#f0f0f3] text-[8px] font-semibold uppercase tracking-[0.05em] text-[#999ba4]">
                    <th className="w-[39%] py-2 pr-2">Position</th>
                    <th className="w-[20%] py-2 pr-2">Applied</th>
                    <th className="w-[19%] py-2 pr-2">Status</th>
                    <th className="w-[22%] py-2 text-right">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.slice(0, 5).map((application) => (
                    <ApplicationTableRow
                      key={application._id}
                      application={application}
                    />
                  ))}
                </tbody>
              </table>
              {filteredApplications.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-[11px] font-medium text-[#626570]">
                    {applicationList.length
                      ? "No applications match your search."
                      : "No applications yet."}
                  </p>
                  {!applicationList.length && (
                    <Link
                      href="/candidate/jobs"
                      className="mt-1 inline-block text-[10px] font-semibold text-[#6658d9] hover:text-[#5143c3]"
                    >
                      Browse open jobs
                    </Link>
                  )}
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title="Tasks & Follow-ups"
            action={
              <PanelLink href="/candidate/interview/result">
                View all
              </PanelLink>
            }
          >
            {summary.upcoming.length === 0 ? (
              <div className="flex min-h-[190px] flex-col items-center justify-center px-3 text-center">
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f3ff] text-[#7668de]">
                  <CalendarDays aria-hidden="true" className="h-4 w-4" />
                </span>
                <p className="text-[11px] font-semibold text-[#454752]">
                  Nothing to follow up yet
                </p>
                <p className="mt-1 max-w-[210px] text-[9px] leading-4 text-[#92949d]">
                  Interview invitations and scheduled steps will appear here.
                </p>
                <Link
                  href="/candidate/jobs"
                  className="mt-3 inline-flex h-7 items-center gap-1 rounded bg-[#6b5ce7] px-2.5 text-[9px] font-semibold text-white hover:bg-[#5849d1]"
                >
                  Browse jobs <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#f1f1f4]">
                {summary.upcoming.slice(0, 4).map((application) => (
                  <InterviewFollowUp
                    key={application._id}
                    application={application}
                  />
                ))}
              </div>
            )}
          </Panel>
        </section>

        <Panel
          title="Recent Activity"
          action={
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1 text-[9px] text-[#8a8c96] sm:inline-flex">
                <ArrowDownRight aria-hidden="true" className="h-3 w-3" />
                Latest updates
              </span>
              <PanelLink href="/candidate/notifications">View all</PanelLink>
            </div>
          }
        >
          {notifications.error ? (
            <ErrorBlock
              message={notifications.error}
              onRetry={notifications.reload}
            />
          ) : recentNotifications.length === 0 ? (
            <div className="flex items-center gap-3 py-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5f5f8] text-[#858792]">
                <Bell aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold text-[#50525d]">
                  You’re all caught up
                </p>
                <p className="mt-0.5 text-[9px] text-[#999ba4]">
                  New account and application updates appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[440px] table-fixed border-collapse text-left">
                <thead>
                  <tr className="border-y border-[#f0f0f3] text-[8px] font-semibold uppercase tracking-[0.05em] text-[#999ba4]">
                    <th className="w-[63%] py-2 pr-3">Update</th>
                    <th className="w-[20%] py-2 pr-2">Type</th>
                    <th className="w-[17%] py-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentNotifications.map((notification) => (
                    <ActivityTableRow
                      key={notification._id}
                      notification={notification}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {jobs.error && <ErrorBlock message={jobs.error} onRetry={jobs.reload} />}
      </div>
    </div>
  );
}

function ApplicationTableRow({ application }: { application: Application }) {
  const job = populated(application.jobId);
  return (
    <tr className="border-b border-[#f3f3f6] last:border-0">
      <td className="py-2.5 pr-2">
        <p className="truncate text-[10px] font-semibold text-[#454752]">
          {job?.title ?? "Job removed"}
        </p>
      </td>
      <td className="py-2.5 pr-2 text-[9px] text-[#858792]">
        {formatDate(application.createdAt)}
      </td>
      <td className="py-2.5 pr-2">
        <span
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-medium ${statusClasses[application.status]}`}
        >
          <Circle
            aria-hidden="true"
            className="h-1.5 w-1.5 fill-current stroke-none"
          />
          {APPLICATION_STATUS_LABELS[application.status]}
        </span>
      </td>
      <td className="py-2.5 text-right">
        <span
          className={`text-[9px] font-semibold tabular-nums ${scoreColor(application.matchScore)}`}
        >
          {application.matchScore}%
        </span>
      </td>
    </tr>
  );
}

function InterviewFollowUp({ application }: { application: Application }) {
  const job = populated(application.jobId);
  return (
    <div className="flex items-start gap-2.5 py-3 first:pt-1">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4f3ff] text-[#7465dd]">
        {application.aiInterview.scheduled ? (
          <CalendarDays aria-hidden="true" className="h-3 w-3" />
        ) : (
          <Clock3 aria-hidden="true" className="h-3 w-3" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold text-[#4a4c56]">
          {job?.title ?? "Job removed"}
        </p>
        {application.aiInterview.scheduled && (
          <p className="mt-1 truncate text-[9px] text-[#858792]">
            AI interview · {formatDateTime(application.aiInterview.dateTime)}
          </p>
        )}
        {application.orgInterview?.status === "invited" && (
          <p className="mt-1 truncate text-[9px] text-[#858792]">
            Organisation interview ·{" "}
            {timeUntil(application.orgInterview.expiresAt)}
          </p>
        )}
        {application.interviewSessionId && (
          <Link
            href={`/candidate/interview/session/${application.interviewSessionId}`}
            className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold text-[#6658d9] hover:text-[#5143c3]"
          >
            Open interview <ArrowRight className="h-2.5 w-2.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

function ActivityTableRow({ notification }: { notification: Notification }) {
  return (
    <tr className="border-b border-[#f3f3f6] last:border-0">
      <td className="py-2.5 pr-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              notification.read ? "bg-[#d6d8df]" : "bg-[#6b5ce7]"
            }`}
          />
          <p className="truncate text-[9px] text-[#555762]">
            {notification.message}
          </p>
        </div>
      </td>
      <td className="py-2.5 pr-2 text-[9px] text-[#858792]">
        {notification.read ? "Read" : "New update"}
      </td>
      <td className="py-2.5 text-right text-[9px] text-[#858792]">
        {formatDate(notification.createdAt)}
      </td>
    </tr>
  );
}
