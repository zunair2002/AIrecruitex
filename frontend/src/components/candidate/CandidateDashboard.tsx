"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  Check,
  Clock3,
  FileCheck2,
  FileText,
  Mail,
  Search,
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
import { greetingFor } from "@/lib/greeting";
import {
  APPLICATION_STATUS_LABELS,
  formatDate,
  formatDateTime,
  timeUntil,
} from "@/lib/format";
import {
  populated,
  type Application,
  type ApplicationStatus,
  type Notification,
} from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import {
  SegmentedControl,
  tabClass,
  tabCountClass,
  tabListClass,
} from "@/components/ui/Tabs";
import { Card, EmptyState, ErrorBlock } from "@/components/ui/Feedback";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { compactInputClass } from "@/components/ui/controls";
import { PanelLink, PortalPage } from "@/components/dashboard/primitives";
import {
  DashboardHero,
  HeroButton,
  HeroMeter,
} from "@/components/dashboard/DashboardHero";

type ChartRange = "Monthly" | "Weekly" | "Quarterly";
type StatusFilter = "all" | ApplicationStatus;
type SeriesKey = "count" | "selected";
type ActivityBucket = Record<SeriesKey, number> & { label: string };
type NextEvent = {
  application: Application;
  kind: "ai" | "org";
  at: Date | null;
  isFuture: boolean;
};

const EMPTY_APPLICATIONS: Application[] = [];
const EMPTY_NOTIFICATIONS: Notification[] = [];
const chartRanges: ChartRange[] = ["Monthly", "Weekly", "Quarterly"];
const chartRangeOptions = chartRanges.map((range) => ({
  value: range,
  label: range,
}));
const RANGE_SPAN: Record<ChartRange, string> = {
  Monthly: "6 months",
  Weekly: "6 weeks",
  Quarterly: "6 quarters",
};
const statusFilters: StatusFilter[] = [
  "all",
  "pending",
  "selected",
  "rejected",
];

/** Chart palette per application status (pending amber, selected teal, rejected rose). */
const STATUS_CHART: Record<ApplicationStatus, { color: string; swatch: string }> =
  {
    pending: { color: "var(--color-chart-3)", swatch: "bg-chart-3" },
    shortlisted: { color: "var(--color-chart-1)", swatch: "bg-chart-1" },
    selected: { color: "var(--color-chart-2)", swatch: "bg-chart-2" },
    rejected: { color: "var(--color-chart-4)", swatch: "bg-chart-4" },
  };

const SERIES: {
  key: SeriesKey;
  label: string;
  color: string;
  swatch: string;
  dashed?: boolean;
}[] = [
  {
    key: "count",
    label: "Applications",
    color: "var(--color-chart-1)",
    swatch: "bg-chart-1",
  },
  {
    key: "selected",
    label: "Selected",
    color: "var(--color-chart-3)",
    swatch: "bg-chart-3",
    dashed: true,
  },
];


function toDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** The nearest upcoming step for an application (future first). */
function getNextEvent(application: Application, now: number): NextEvent {
  const events: NextEvent[] = [];
  if (application.aiInterview.scheduled) {
    const at = toDate(application.aiInterview.dateTime);
    events.push({
      application,
      kind: "ai",
      at,
      isFuture: Boolean(at && at.getTime() >= now),
    });
  }
  if (application.orgInterview?.status === "invited") {
    const at = toDate(application.orgInterview.expiresAt);
    events.push({
      application,
      kind: "org",
      at,
      isFuture: Boolean(at && at.getTime() >= now),
    });
  }
  const future = events
    .filter((event) => event.isFuture)
    .sort((a, b) => (a.at?.getTime() ?? 0) - (b.at?.getTime() ?? 0));
  return future[0] ?? events[0];
}

function relativeDay(date: Date, now: number): string {
  const startOf = (value: number) => {
    const day = new Date(value);
    day.setHours(0, 0, 0, 0);
    return day.getTime();
  };
  const days = Math.round((startOf(date.getTime()) - startOf(now)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return `In ${days} days`;
  if (days === -1) return "Yesterday";
  return `${-days} days ago`;
}

function getActivityBuckets(
  applications: Application[],
  range: ChartRange,
): ActivityBucket[] {
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
    const selected = applications.filter((application) => {
      const appliedAt = new Date(application.createdAt);
      return (
        application.status === "selected" &&
        !Number.isNaN(appliedAt.getTime()) &&
        appliedAt >= start &&
        appliedAt < end
      );
    }).length;
    return { label, count: bucketApplications, selected };
  });

  return buckets;
}

/**
 * Fluid line chart: the SVG stretches to its box (non-scaling strokes), the
 * dots and axis labels are HTML so they stay round and readable at any width.
 */
function ActivityChart({
  buckets,
  range,
}: {
  buckets: ActivityBucket[];
  range: ChartRange;
}) {
  const peak = Math.max(
    1,
    ...buckets.flatMap((bucket) => [bucket.count, bucket.selected]),
  );
  const yMax = Math.max(4, Math.ceil(peak / 4) * 4);
  const ticks = [4, 3, 2, 1, 0].map((step) => (yMax / 4) * step);
  const x = (index: number) => ((index + 0.5) / buckets.length) * 100;
  const y = (value: number) => 100 - (value / yMax) * 100;
  const linePoints = (key: SeriesKey) =>
    buckets.map((bucket, index) => `${x(index)},${y(bucket[key])}`).join(" ");
  const areaPath = `M${x(0)},100 L${buckets
    .map((bucket, index) => `${x(index)},${y(bucket.count)}`)
    .join(" L")} L${x(buckets.length - 1)},100 Z`;

  return (
    <div>
      <div className="flex items-start gap-3">
        <div aria-hidden="true" className="relative h-44 w-5 shrink-0 sm:h-52">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2 text-xs leading-none tabular-nums text-muted"
              style={{ top: `${y(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-44 sm:h-52">
            <svg
              role="img"
              aria-label={`${range} application activity chart`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              <defs>
                <linearGradient
                  id="candidate-activity-fill"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {ticks.map((tick) => (
                <line
                  key={tick}
                  x1="0"
                  x2="100"
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke={tick === 0 ? "var(--color-line)" : "var(--color-line-soft)"}
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? undefined : "3 4"}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path d={areaPath} fill="url(#candidate-activity-fill)" />
              {[...SERIES].reverse().map((series) => (
                <polyline
                  key={series.key}
                  points={linePoints(series.key)}
                  fill="none"
                  stroke={series.color}
                  strokeWidth={series.key === "count" ? 2.5 : 2}
                  strokeDasharray={series.dashed ? "5 5" : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {buckets.map((bucket, index) => (
              <span
                key={`${bucket.label}-${index}`}
                aria-hidden="true"
                title={`${bucket.label}: ${bucket.count} application${bucket.count === 1 ? "" : "s"}`}
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-chart-1 bg-surface shadow-xs"
                style={{ left: `${x(index)}%`, top: `${y(bucket.count)}%` }}
              />
            ))}
          </div>
          <div
            aria-hidden="true"
            className="mt-3 grid grid-cols-6 text-center text-xs text-muted"
          >
            {buckets.map((bucket, index) => (
              <span key={`${bucket.label}-${index}`} className="truncate px-0.5">
                {bucket.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ul className="sr-only">
        {buckets.map((bucket, index) => (
          <li key={`${bucket.label}-${index}`}>
            {bucket.label}: {bucket.count} applications, {bucket.selected}
            selected
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line-soft pt-4 text-sm text-body">
        {SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${series.swatch}`}
            />
            {series.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatusDonut({
  items,
  total,
}: {
  items: { status: ApplicationStatus; count: number }[];
  total: number;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const gap = items.filter((item) => item.count > 0).length > 1 ? 1.5 : 0;
  const segments = items.reduce<
    { status: ApplicationStatus; start: number; length: number }[]
  >((list, item) => {
    const previous = list[list.length - 1];
    list.push({
      status: item.status,
      start: previous ? previous.start + previous.length : 0,
      length: total ? (item.count / total) * circumference : 0,
    });
    return list;
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10 lg:flex-col lg:gap-6">
      <div className="relative aspect-square w-40 shrink-0">
        <svg
          role="img"
          aria-label={`Application status breakdown, ${total} total`}
          viewBox="0 0 100 100"
          className="h-full w-full -rotate-90"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-surface-3)"
            strokeWidth="12"
          />
          {segments.map((segment) => {
            const drawn = Math.max(segment.length - gap, 0);
            return (
              <circle
                key={segment.status}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={STATUS_CHART[segment.status].color}
                strokeWidth="12"
                strokeDasharray={`${drawn} ${circumference - drawn}`}
                strokeDashoffset={-segment.start}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-semibold tracking-tight tabular-nums text-ink">
            {total}
          </span>
          <span className="text-xs text-muted">Applications</span>
        </div>
      </div>
      <ul className="w-full max-w-xs space-y-3 lg:max-w-none">
        {items.map(({ status, count }) => {
          const percent = total ? Math.round((count / total) * 100) : 0;
          return (
            <li key={status} className="text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5 text-body">
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_CHART[status].swatch}`}
                  />
                  {APPLICATION_STATUS_LABELS[status]}
                </span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-semibold text-ink">{count}</span>
                  <span className="ml-2 text-xs text-muted">{percent}%</span>
                </span>
              </div>
              <div
                aria-hidden="true"
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3"
              >
                <div
                  className={`h-full rounded-full ${STATUS_CHART[status].swatch}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CandidateDashboard() {
  const { user, token } = useAuth();
  const [chartRange, setChartRange] = useState<ChartRange>("Monthly");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  // Reference time for "next up" countdowns, fixed for the life of the page.
  const [now] = useState(() => Date.now());
  // Computed once per mount: "Hello, Ali" on first use after signup, then
  // "Welcome back, Ali" (see lib/greeting.ts).
  const [greeting] = useState(() => greetingFor(user));
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
    return {
      total: applicationList.length,
      selected: applicationList.filter(
        (application) => application.status === "selected",
      ).length,
      pending: applicationList.filter(
        (application) => application.status === "pending",
      ).length,
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
    return (
      <PortalPage>
        <PageSkeleton label="Loading dashboard…" />
      </PortalPage>
    );
  }

  const statusTotal = statusSummary.reduce((sum, item) => sum + item.count, 0);
  const recentNotifications = notificationList.slice(0, 5);
  const recentApplications = filteredApplications.slice(0, 5);
  const periodTotal = activityBuckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const nextEvents = summary.upcoming
    .map((application) => getNextEvent(application, now))
    .sort((a, b) => {
      if (a.isFuture !== b.isFuture) return a.isFuture ? -1 : 1;
      return (a.at?.getTime() ?? Infinity) - (b.at?.getTime() ?? Infinity);
    });
  const [nextUp, ...laterEvents] = nextEvents;

  const upcomingCount = summary.upcoming.length;
  const heroSummary = [
    upcomingCount
      ? `${upcomingCount} interview${upcomingCount === 1 ? "" : "s"} coming up`
      : null,
    summary.selected
      ? `${summary.selected} application${summary.selected === 1 ? "" : "s"} selected`
      : null,
    summary.pending ? `${summary.pending} awaiting a response` : null,
  ].filter(Boolean);
  const today = new Date(now).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <PortalPage>
      <DashboardHero
        eyebrow={<span suppressHydrationWarning>{today}</span>}
        title={greeting}
        description={
          heroSummary.length
            ? heroSummary.join(" · ")
            : "Browse open roles and apply with your resume to get started."
        }
        actions={
          <>
            <HeroButton href="/candidate/jobs" icon={<Search aria-hidden="true" />}>
              Find jobs
            </HeroButton>
            <HeroButton
              href="/candidate/resume"
              variant="ghost"
              icon={<FileText aria-hidden="true" />}
            >
              Update resume
            </HeroButton>
          </>
        }
        aside={
          <HeroMeter
            value={
              summary.total
                ? ((summary.total - summary.pending) / summary.total) * 100
                : 0
            }
            label="Responses received"
            caption={`${summary.total - summary.pending} of ${summary.total} application${summary.total === 1 ? "" : "s"} have a decision from the employer`}
          />
        }
        stats={[
          {
            label: "Applications",
            value: summary.total,
            detail: `${summary.pending} awaiting response`,
            icon: <FileCheck2 />,
          },
          {
            label: "Selected",
            value: summary.selected,
            detail: `${upcomingCount} interview${upcomingCount === 1 ? "" : "s"} scheduled`,
            icon: <Check />,
            trend: summary.selected > 0 ? "up" : "neutral",
          },
          {
            label: "Open jobs",
            value: jobs.data?.length ?? 0,
            detail: unreadCount
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "No new notifications",
            icon: <BriefcaseBusiness />,
            trend: unreadCount ? "down" : "neutral",
          },
        ]}
      />

      {applications.error && (
        <ErrorBlock
          message={applications.error}
          onRetry={applications.reload}
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="min-w-0 space-y-4 lg:col-span-2 lg:space-y-6">
          <Card
            title="Next up"
            description="Your nearest interview or follow-up."
            action={
              <PanelLink href="/candidate/interview/result">View all</PanelLink>
            }
          >
            {nextUp ? (
              <>
                <NextUpHighlight event={nextUp} now={now} />
                {laterEvents.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">
                      Also coming up
                    </p>
                    <ul className="mt-2 divide-y divide-line-soft">
                      {laterEvents.slice(0, 3).map((event) => (
                        <LaterEventRow
                          key={event.application._id}
                          event={event}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                bare
                icon={<CalendarDays />}
                title="Nothing to follow up yet"
                description="Interview invitations and scheduled steps will appear here."
                action={
                  <Button
                    href="/candidate/jobs"
                    variant="secondary"
                    trailingIcon={<ArrowRight aria-hidden="true" />}
                  >
                    Browse jobs
                  </Button>
                }
              />
            )}
          </Card>

          <Card
            title="Application activity"
            description={`${periodTotal} application${periodTotal === 1 ? "" : "s"} in the last ${RANGE_SPAN[chartRange]}`}
            action={
              <SegmentedControl
                ariaLabel="Activity chart range"
                size="sm"
                options={chartRangeOptions}
                value={chartRange}
                onChange={setChartRange}
              />
            }
          >
            <ActivityChart buckets={activityBuckets} range={chartRange} />
          </Card>

          <Card
            title="Recent applications"
            className="overflow-hidden"
            action={
              <PanelLink href="/candidate/applications">View all</PanelLink>
            }
          >
            <div className="flex flex-col-reverse gap-3 border-b border-line sm:flex-row sm:items-end sm:justify-between">
              <div
                role="tablist"
                aria-label="Filter applications by status"
                className={`${tabListClass} min-w-0`}
              >
                {statusFilters.map((filter) => {
                  const isActive = statusFilter === filter;
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
                      aria-selected={isActive}
                      onClick={() => setStatusFilter(filter)}
                      className={tabClass(isActive)}
                    >
                      {label}
                      <span className={tabCountClass(isActive)}>{count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="relative w-full sm:mb-2.5 sm:w-56">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search applications"
                  className={`${compactInputClass} w-full pl-9`}
                  aria-label="Search applications by job title"
                />
              </div>
            </div>

            {recentApplications.length === 0 ? (
              <EmptyState
                bare
                icon={<FileText />}
                title={
                  applicationList.length
                    ? "No applications match your search."
                    : "No applications yet."
                }
                description={
                  applicationList.length
                    ? "Try another status or search term."
                    : "Apply to an open role and it will show up here."
                }
                action={
                  applicationList.length ? undefined : (
                    <Button href="/candidate/jobs">Browse open jobs</Button>
                  )
                }
              />
            ) : (
              <ul className="-mx-5 -mb-5 divide-y divide-line-soft sm:-mx-6 sm:-mb-6">
                {recentApplications.map((application) => (
                  <ApplicationRow
                    key={application._id}
                    application={application}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-4 lg:space-y-6">
          <Card
            title="Application status"
            description="Where all your applications stand."
          >
            <StatusDonut items={statusSummary} total={statusTotal} />
          </Card>

          <Card
            title="Recent activity"
            action={
              <PanelLink href="/candidate/notifications">View all</PanelLink>
            }
          >
            {notifications.error ? (
              <ErrorBlock
                message={notifications.error}
                onRetry={notifications.reload}
              />
            ) : recentNotifications.length === 0 ? (
              <EmptyState
                bare
                icon={<Bell />}
                title="You’re all caught up"
                description="New account and application updates appear here."
              />
            ) : (
              <ol className="relative ml-1 border-l border-line">
                {recentNotifications.map((notification) => (
                  <ActivityItem
                    key={notification._id}
                    notification={notification}
                  />
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      {jobs.error && <ErrorBlock message={jobs.error} onRetry={jobs.reload} />}
    </PortalPage>
  );
}

function DateTile({ date, size = "lg" }: { date: Date | null; size?: "lg" | "sm" }) {
  const large = size === "lg";
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 flex-col items-center justify-center rounded-xl bg-white text-brand-700 shadow-xs ring-1 ring-inset ring-brand-100 ${
        large ? "h-16 w-16 sm:h-20 sm:w-20" : "h-11 w-11"
      }`}
    >
      {date ? (
        <>
          <span
            className={`font-semibold uppercase tracking-wider text-brand-600 ${
              large ? "text-xs" : "text-xs leading-none"
            }`}
          >
            {date.toLocaleDateString(undefined, { month: "short" })}
          </span>
          <span
            className={`font-display font-semibold leading-none tabular-nums text-ink ${
              large ? "mt-1 text-2xl sm:text-3xl" : "mt-0.5 text-base"
            }`}
          >
            {date.getDate()}
          </span>
        </>
      ) : (
        <CalendarClock className={large ? "h-6 w-6" : "h-4 w-4"} />
      )}
    </span>
  );
}

function NextUpHighlight({ event, now }: { event: NextEvent; now: number }) {
  const { application, kind, at } = event;
  const job = populated(application.jobId);
  const isAi = kind === "ai";
  const when =
    isAi
      ? formatDateTime(application.aiInterview.dateTime)
      : `Respond by ${formatDate(application.orgInterview?.expiresAt)}`;
  const countdown = isAi
    ? at
      ? relativeDay(at, now)
      : null
    : timeUntil(application.orgInterview?.expiresAt);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 via-brand-50/60 to-surface p-4 ring-1 ring-inset ring-brand-100 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <DateTile date={at} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={isAi ? "brand" : "info"}>
                {isAi ? "AI interview" : "Organisation interview"}
              </Badge>
              {countdown && (
                <span className="text-xs font-medium text-muted">{countdown}</span>
              )}
            </div>
            <p className="mt-2 font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
              {job?.title ?? "Job removed"}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <Clock3 aria-hidden="true" className="h-4 w-4 shrink-0" />
              {when}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0 sm:flex-col sm:items-stretch">
          <Button
            href="/candidate/applications"
            variant="secondary"
            trailingIcon={<ArrowRight aria-hidden="true" />}
          >
            View application
          </Button>
        </div>
      </div>
      {/* Interviews are started only from the emailed link sent after HR approval. */}
      <p className="mt-4 flex items-center gap-2 border-t border-brand-100 pt-3 text-sm text-body">
        <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-700" />
        You&apos;ll receive the interview link by email.
      </p>
    </div>
  );
}

function LaterEventRow({ event }: { event: NextEvent }) {
  const { application, kind, at } = event;
  const job = populated(application.jobId);
  const isAi = kind === "ai";
  return (
    <li className="flex items-center gap-3 py-3">
      <DateTile date={at} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">
          {job?.title ?? "Job removed"}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {isAi
            ? `AI interview · ${formatDateTime(application.aiInterview.dateTime)}`
            : `Organisation interview · ${timeUntil(application.orgInterview?.expiresAt)}`}
        </p>
      </div>
      <span
        className="hidden shrink-0 items-center gap-1 text-xs text-muted sm:inline-flex"
        title="You'll receive the interview link by email"
      >
        <Mail aria-hidden="true" className="h-3.5 w-3.5" />
        Link by email
      </span>
    </li>
  );
}

function ApplicationRow({ application }: { application: Application }) {
  const job = populated(application.jobId);
  const title = job?.title ?? "Job removed";
  const status = (
    <StatusBadge
      status={application.status}
      label={APPLICATION_STATUS_LABELS[application.status]}
      dot
    />
  );
  return (
    <li className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-2/60 sm:gap-4 sm:px-6">
      <Avatar name={title} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-muted">
          Applied {formatDate(application.createdAt)}
        </p>
        <div className="mt-2 sm:hidden">{status}</div>
      </div>
      <div className="w-28 shrink-0 text-right">{status}</div>
    </li>
  );
}

function ActivityItem({ notification }: { notification: Notification }) {
  return (
    <li className="relative pb-5 pl-6 last:pb-0">
      <span
        aria-hidden="true"
        className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-surface ${
          notification.read ? "bg-line" : "bg-brand-500"
        }`}
      />
      <p
        className={`text-sm ${
          notification.read ? "text-body" : "font-medium text-ink"
        }`}
      >
        {notification.message}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <time
          dateTime={notification.createdAt}
          className="text-xs tabular-nums text-muted"
        >
          {formatDate(notification.createdAt)}
        </time>
        {notification.read ? (
          <span className="text-xs text-muted">· Read</span>
        ) : (
          <Badge tone="brand">New update</Badge>
        )}
      </div>
    </li>
  );
}
