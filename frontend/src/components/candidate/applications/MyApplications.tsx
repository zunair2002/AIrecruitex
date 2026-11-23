"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  MessageSquareText,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Clock3,
  Info,
  LayoutList,
  Mail,
  Search,
  SearchX,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApplicationEvents } from "@/context/RealtimeContext";
import { listMyApplications } from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUS_LABELS,
  ORG_INTERVIEW_STATUS_BADGE,
  ORG_INTERVIEW_STATUS_LABELS,
  formatDate,
  formatDateTime,
  isInviteExpired,
  timeUntil,
} from "@/lib/format";
import {
  populated,
  type Application,
  type ApplicationStatus,
} from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  PageHeader,
  Skeleton,
  SkeletonCard,
  StatCard,
  StatusBadge,
  Tabs,
  iconButtonClass,
  inputClass,
} from "@/components/ui";
import { PortalPage } from "@/components/dashboard/primitives";
import { DayPicker, type DayButtonProps } from "react-day-picker";

type StatusFilter = "all" | ApplicationStatus;
type DetailTab = "overview" | "ai" | "organizational" | "job";
type InterviewCategory = "ai" | "organizational";
type InterviewDateKind =
  | "scheduled"
  | "invited"
  | "started"
  | "deadline"
  | "completed";
type MarkerKind = Exclude<InterviewDateKind, "started">;

type InterviewDate = {
  label: string;
  value: string;
  kind: InterviewDateKind;
};

type InterviewItem = {
  id: string;
  application: Application;
  category: Exclude<InterviewCategory, "all">;
  dates: InterviewDate[];
};

const EMPTY_APPLICATIONS: Application[] = [];

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
];

const detailTabs: {
  value: DetailTab;
  label: string;
  icon: ReactNode;
}[] = [
  { value: "overview", label: "Overview", icon: <LayoutList /> },
  { value: "ai", label: "AI interviews", icon: <MessageSquareText /> },
  { value: "organizational", label: "Organisational", icon: <Building2 /> },
  { value: "job", label: "Job description", icon: <FileText /> },
];

/** Calendar marker per interview date kind (dots on days + legend). */
const MARKERS: Record<MarkerKind, { label: string; dot: string }> = {
  scheduled: { label: "AI interview", dot: "bg-brand-600" },
  invited: { label: "Organisation invite", dot: "bg-brand-500" },
  deadline: { label: "Complete by", dot: "bg-brand-300" },
  completed: { label: "Completed", dot: "bg-brand-500" },
};

/** Secondary-button look that may wrap (long external-link labels on phones). */
const wrappingLinkClass =
  "inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-left text-sm font-semibold text-body shadow-xs transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 [&_svg]:size-4 [&_svg]:shrink-0";

const layoutGridClass =
  "grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]";

function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <StatusBadge status={status} label={APPLICATION_STATUS_LABELS[status]} dot />
  );
}

function DetailValue({
  label,
  icon,
  children,
}: {
  label: string;
  /** Leading glyph on the label, so the grid scans without reading. */
  icon?: ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
        {icon && (
          <span
            aria-hidden="true"
            className="[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0"
          >
            {icon}
          </span>
        )}
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-ink">
        {children}
      </dd>
    </div>
  );
}

function parseInterviewDate(value: string): Date | undefined {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function isSameCalendarDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function CalendarChevron({
  orientation,
  className,
}: {
  orientation?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
  return <Icon aria-hidden="true" className={className} />;
}

function InterviewCalendarDayButton({
  day,
  modifiers,
  className,
  children,
  ...buttonProps
}: DayButtonProps) {
  const markers = [
    modifiers.scheduledInterview && MARKERS.scheduled,
    modifiers.inviteDate && MARKERS.invited,
    modifiers.deadline && MARKERS.deadline,
    modifiers.completedDate && MARKERS.completed,
  ].filter((marker): marker is { label: string; dot: string } =>
    Boolean(marker),
  );
  const markerDescription = markers.map((marker) => marker.label).join(", ");

  const tone = modifiers.selected
    ? "bg-brand-700 font-semibold text-white hover:bg-brand-800"
    : modifiers.today
      ? "font-semibold text-brand-700 ring-2 ring-inset ring-brand-200 hover:bg-brand-50"
      : modifiers.outside
        ? "text-subtle hover:bg-surface-2"
        : markers.length
          ? "font-semibold text-ink hover:bg-surface-3"
          : "text-body hover:bg-surface-3 hover:text-ink";

  return (
    <button
      {...buttonProps}
      title={markerDescription || undefined}
      className={`${className ?? ""} relative mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:h-10 sm:w-10 ${tone}`}
    >
      <span className={markers.length ? "-mt-1.5" : ""}>
        {children ?? day.date.getDate()}
      </span>
      {markers.length > 0 && (
        <span
          aria-hidden="true"
          className="absolute bottom-1 flex items-center justify-center gap-0.5"
        >
          {markers.slice(0, 4).map((marker) => (
            <span
              key={marker.label}
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                modifiers.selected ? "bg-white" : marker.dot
              }`}
            />
          ))}
        </span>
      )}
    </button>
  );
}

function InterviewSchedule({
  applications,
  category,
}: {
  applications: Application[];
  category: InterviewCategory;
}) {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>();

  const items = useMemo(() => {
    const interviewItems: InterviewItem[] = [];

    applications.forEach((application) => {
      if (application.aiInterview.scheduled) {
        const dates: InterviewDate[] = application.aiInterview.dateTime
          ? [
              {
                label: "Scheduled",
                value: application.aiInterview.dateTime,
                kind: "scheduled",
              },
            ]
          : [];
        interviewItems.push({
          id: `${application._id}-ai`,
          application,
          category: "ai",
          dates,
        });
      }

      const interview = application.orgInterview;
      if (interview?.status) {
        const dates: InterviewDate[] = [];
        if (interview.invitedAt) {
          dates.push({
            label: "Invitation sent",
            value: interview.invitedAt,
            kind: "invited",
          });
        }
        if (interview.startedAt) {
          dates.push({
            label: "Started",
            value: interview.startedAt,
            kind: "started",
          });
        }
        if (interview.expiresAt && !interview.completedAt) {
          dates.push({
            label: "Complete by",
            value: interview.expiresAt,
            kind: "deadline",
          });
        }
        if (interview.completedAt) {
          dates.push({
            label: "Completed",
            value: interview.completedAt,
            kind: "completed",
          });
        }
        interviewItems.push({
          id: `${application._id}-org`,
          application,
          category: "organizational",
          dates,
        });
      }
    });

    return interviewItems;
  }, [applications]);

  const filteredItems = items.filter((item) => item.category === category);
  const visibleItems = selectedDate
    ? filteredItems.filter((item) =>
        item.dates.some((date) => {
          const parsed = parseInterviewDate(date.value);
          return parsed && isSameCalendarDay(parsed, selectedDate);
        }),
      )
    : filteredItems;

  const datesFor = (kind: MarkerKind) =>
    items.flatMap((item) =>
      item.dates
        .filter((date) => date.kind === kind)
        .map((date) => parseInterviewDate(date.value))
        .filter((date): date is Date => Boolean(date)),
    );

  const modifiers = {
    scheduledInterview: datesFor("scheduled"),
    inviteDate: datesFor("invited"),
    deadline: datesFor("deadline"),
    completedDate: datesFor("completed"),
  };

  const navButtonClass = iconButtonClass({ variant: "secondary", size: "sm" });

  return (
    <div className="@container">
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 @2xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] @2xl:gap-6">
        <section className="min-w-0 rounded-xl border border-line bg-surface p-3 sm:p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink">
                Interview calendar
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                Select a marked date to view its interviews.
              </p>
            </div>
            {selectedDate && (
              <Button
                variant="soft"
                size="sm"
                onClick={() => setSelectedDate(undefined)}
              >
                Show all
              </Button>
            )}
          </div>

          <DayPicker
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selectedDate}
            onSelect={setSelectedDate}
            showOutsideDays
            fixedWeeks
            weekStartsOn={1}
            modifiers={modifiers}
            components={{
              DayButton: InterviewCalendarDayButton,
              Chevron: CalendarChevron,
            }}
            classNames={{
              root: "w-full",
              months: "relative w-full",
              month: "w-full",
              month_caption: "flex h-10 items-center justify-center px-12",
              caption_label: "font-display text-sm font-semibold text-ink",
              nav: "absolute inset-x-0 top-0 z-10 flex h-10 items-center justify-between",
              button_previous: navButtonClass,
              button_next: navButtonClass,
              chevron: "h-4 w-4",
              month_grid: "mt-2 w-full table-fixed border-collapse",
              weekdays: "",
              weekday: "h-8 pb-1 text-center text-xs font-medium text-muted",
              weeks: "",
              week: "",
              day: "h-10 p-0 text-center align-middle sm:h-11",
              day_button: "",
              today: "",
              outside: "",
              selected: "",
            }}
          />

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-line-soft pt-3">
            {Object.values(MARKERS).map((marker) => (
              <li
                key={marker.label}
                className="inline-flex items-center gap-2 text-xs text-muted"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${marker.dot}`}
                />
                {marker.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="min-w-0">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-ink">
              {selectedDate
                ? `Interviews on ${formatDate(selectedDate.toISOString())}`
                : category === "organizational"
                  ? "Organisational interviews"
                  : "AI interviews"}
            </h3>
            <p className="mt-0.5 text-xs tabular-nums text-muted">
              {visibleItems.length} interview
              {visibleItems.length === 1 ? "" : "s"}
              {selectedDate ? " on this date" : ""}
            </p>
          </div>

          <div className="min-w-0 space-y-3">
            {visibleItems.map((item) => {
              const { application } = item;
              const jobTitle =
                populated(application.jobId)?.title ?? "Job no longer available";
              const interview = application.orgInterview;
              const expired =
                interview?.status === "expired" ||
                (interview?.status === "invited" &&
                  isInviteExpired(interview.expiresAt));
              const orgStatus =
                interview?.status && expired ? "expired" : interview?.status;
              const isAi = item.category === "ai";

              return (
                <article
                  key={item.id}
                  className="min-w-0 rounded-xl border border-line bg-surface p-4"
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isAi
                            ? "bg-brand-50 text-brand-700"
                            : "bg-brand-50 text-brand-600"
                        }`}
                      >
                        {isAi ? (
                          <MessageSquareText className="h-4 w-4" />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">
                          {isAi ? "AI interview" : "Organisational interview"}
                        </p>
                        <p className="mt-0.5 break-words text-sm text-muted">
                          {jobTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex max-w-full flex-wrap items-center gap-1.5">
                      <ApplicationStatusBadge status={application.status} />
                      {orgStatus && (
                        <span className={ORG_INTERVIEW_STATUS_BADGE[orgStatus]}>
                          {ORG_INTERVIEW_STATUS_LABELS[orgStatus]}
                        </span>
                      )}
                      {isAi && <Badge tone="info">Scheduled</Badge>}
                    </div>
                  </div>

                  <dl className="mt-4 grid min-w-0 grid-cols-1 gap-x-6 gap-y-3 border-t border-line-soft pt-4 sm:grid-cols-2">
                    {item.dates.map((date) => (
                      <div key={`${item.id}-${date.kind}`} className="min-w-0">
                        <dt className="text-xs font-medium text-muted">
                          {date.label}
                        </dt>
                        <dd className="mt-0.5 break-words text-sm tabular-nums text-ink">
                          {formatDateTime(date.value)}
                          {date.kind === "deadline" &&
                            orgStatus === "invited" && (
                              <span className="ml-2 text-xs font-medium text-brand-600">
                                {timeUntil(date.value)}
                              </span>
                            )}
                        </dd>
                      </div>
                    ))}
                    <div className="min-w-0">
                      <dt className="text-xs font-medium text-muted">Role</dt>
                      <dd className="mt-0.5 break-words text-sm text-ink">
                        {jobTitle}
                      </dd>
                    </div>
                  </dl>

                  {item.category === "organizational" && interview?.notes && (
                    <div className="mt-4 border-t border-line-soft pt-4">
                      <p className="text-xs font-medium text-muted">
                        Organisation notes
                      </p>
                      <p className="mt-1 whitespace-pre-line break-words text-sm text-body">
                        {interview.notes}
                      </p>
                    </div>
                  )}

                  {isAi && application.aiInterview.message && (
                    <p className="mt-4 break-words border-t border-line-soft pt-4 text-sm text-body">
                      {application.aiInterview.message}
                    </p>
                  )}

                  {isAi && (
                    <p className="mt-4 flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-800 ring-1 ring-inset ring-brand-600/15">
                      <Mail
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                      />
                      <span className="min-w-0">
                        You&apos;ll receive the interview link by email. The AI
                        interview can only be started from that link.
                      </span>
                    </p>
                  )}

                  {item.category === "organizational" &&
                    orgStatus === "invited" && (
                      <p className="mt-4 flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-800 ring-1 ring-inset ring-brand-600/15">
                        <Info
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                        />
                        <span className="min-w-0">
                          The invite link was sent to your email. Complete the
                          interview before the deadline; this is a flexible
                          invitation window, not a fixed appointment.
                        </span>
                      </p>
                    )}

                  {((item.category === "organizational" &&
                    orgStatus === "invited" &&
                    interview?.calendarLink) ||
                    (isAi && application.aiInterview.calendarLink)) && (
                    <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                      {item.category === "organizational" &&
                        orgStatus === "invited" &&
                        interview?.calendarLink && (
                          <a
                            href={interview.calendarLink}
                            target="_blank"
                            rel="noreferrer"
                            className={wrappingLinkClass}
                          >
                            <CalendarDays aria-hidden="true" />
                            <span className="min-w-0">
                              Add invite window to calendar
                            </span>
                            <ExternalLink aria-hidden="true" />
                          </a>
                        )}
                      {isAi && application.aiInterview.calendarLink && (
                        <a
                          href={application.aiInterview.calendarLink}
                          target="_blank"
                          rel="noreferrer"
                          className={wrappingLinkClass}
                        >
                          Add to calendar
                          <ExternalLink aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  )}
                </article>
              );
            })}

            {visibleItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-line">
                <EmptyState
                  bare
                  icon={<CalendarDays />}
                  title={
                    selectedDate
                      ? "No interviews on this date"
                      : category === "organizational"
                        ? "No organisational interviews yet"
                        : "No AI interviews scheduled"
                  }
                  description={
                    selectedDate
                      ? "Choose a marked date or show all interviews."
                      : "Interview schedules and organisational invites will appear here when available."
                  }
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export function MyApplications() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const applications = useApiResource(
    (signal) => listMyApplications(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  useApplicationEvents(() => applications.reload());

  const applicationList = applications.data ?? EMPTY_APPLICATIONS;

  const counts = useMemo(
    () => ({
      all: applicationList.length,
      pending: applicationList.filter((item) => item.status === "pending")
        .length,
      shortlisted: applicationList.filter(
        (item) => item.status === "shortlisted",
      ).length,
      selected: applicationList.filter((item) => item.status === "selected")
        .length,
      rejected: applicationList.filter((item) => item.status === "rejected")
        .length,
    }),
    [applicationList],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return applicationList.filter((application) => {
      const jobTitle =
        populated(application.jobId)?.title ?? "Job no longer available";
      const matchesStatus =
        statusFilter === "all" || application.status === statusFilter;
      const matchesSearch =
        !query || jobTitle.toLocaleLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [applicationList, search, statusFilter]);

  const selectedApplication =
    filtered.find((application) => application._id === selectedId) ??
    filtered[0] ??
    null;

  const interviewStats = useMemo(() => {
    const ai = applicationList.filter(
      (item) => item.aiInterview.scheduled,
    ).length;
    const organizational = applicationList.filter((item) =>
      Boolean(item.orgInterview?.status),
    ).length;
    return { ai, organizational, total: ai + organizational };
  }, [applicationList]);

  return (
    <PortalPage>
      <PageHeader
        title="My applications"
        description="Track match scores, HR decisions and scheduled interviews."
        icon={<BriefcaseBusiness />}
        action={
          <Button
            href="/candidate/jobs"
            trailingIcon={<ArrowRight aria-hidden="true" />}
          >
            Browse jobs
          </Button>
        }
      />

      {applications.error && (
        <ErrorBlock
          message={applications.error}
          onRetry={applications.reload}
        />
      )}

      {applications.isLoading ? (
        <div
          role="status"
          aria-label="Loading your applications"
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="rounded-xl border border-line bg-surface p-4 shadow-xs sm:p-5"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-7 w-16" />
              </div>
            ))}
          </div>
          <div className={layoutGridClass}>
            <SkeletonCard lines={6} />
            <SkeletonCard lines={8} />
          </div>
        </div>
      ) : applicationList.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No applications yet"
          description="Upload your resume and apply from the job board. Your match score will be calculated when you apply."
          action={
            <Button
              href="/candidate/jobs"
              trailingIcon={<ArrowRight aria-hidden="true" />}
            >
              Browse open jobs
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Applications"
              value={counts.all}
              sub={`${counts.pending} awaiting a decision`}
              icon={<BriefcaseBusiness />}
            />
            <StatCard
              label="Interviews"
              value={interviewStats.total}
              sub={`${interviewStats.ai} AI · ${interviewStats.organizational} organisational`}
              icon={<CalendarDays />}
              tone="warning"
            />
            <StatCard
              label="Selected"
              value={counts.selected}
              sub={`${counts.rejected} rejected`}
              icon={<CheckCircle2 />}
              tone="success"
            />
          </div>

          <div className={layoutGridClass}>
            <Card
              padding="none"
              title="Applications"
              action={<Badge tone="brand">{counts.all}</Badge>}
              className="lg:sticky lg:top-6"
            >
              <div className="space-y-3 border-b border-line-soft px-5 pb-4 sm:px-6">
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search job title…"
                    aria-label="Search applications by job title"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <div
                  role="tablist"
                  aria-label="Filter applications by status"
                  className="flex flex-wrap gap-2"
                >
                  {statusFilters.map((filter) => {
                    const isActive = statusFilter === filter.value;
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                          isActive
                            ? "bg-brand-50 text-brand-700 ring-brand-200"
                            : "bg-surface text-muted ring-line hover:bg-surface-2 hover:text-ink"
                        }`}
                      >
                        {filter.label}
                        <span
                          className={`min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums ${
                            isActive
                              ? "bg-brand-100 text-brand-700"
                              : "bg-surface-3 text-muted"
                          }`}
                        >
                          {counts[filter.value]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1 p-2 sm:p-3 lg:max-h-[calc(100dvh-19rem)] lg:overflow-y-auto">
                {filtered.map((application) => {
                  const job = populated(application.jobId);
                  const isSelected =
                    selectedApplication?._id === application._id;
                  return (
                    <button
                      key={application._id}
                      type="button"
                      onClick={() => {
                        setSelectedId(application._id);
                        setActiveTab("overview");
                      }}
                      aria-pressed={isSelected}
                      className={`block w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        isSelected
                          ? "border-brand-200 bg-brand-50/60"
                          : "border-transparent hover:bg-surface-2"
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-brand-100 text-brand-700"
                              : "bg-surface-3 text-muted"
                          }`}
                        >
                          <BriefcaseBusiness className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="min-w-0 break-words text-sm font-semibold text-ink">
                              {job?.title ?? "Job no longer available"}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            Applied {formatDate(application.createdAt)}
                          </span>
                          <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <ApplicationStatusBadge
                              status={application.status}
                            />
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="px-3 py-10 text-center">
                    <p className="text-sm font-medium text-ink">
                      No applications match these filters.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {selectedApplication ? (
              <ApplicationDetail
                application={selectedApplication}
                applications={applicationList}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            ) : (
              <Card>
                <EmptyState
                  bare
                  icon={<SearchX />}
                  title="No application selected"
                  description="Select an application to view its details."
                />
              </Card>
            )}
          </div>
        </>
      )}
    </PortalPage>
  );
}

function ApplicationDetail({
  application,
  applications,
  activeTab,
  onTabChange,
}: {
  application: Application;
  applications: Application[];
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}) {
  const job = populated(application.jobId);
  const aiInterviewCount = applications.filter(
    (item) => item.aiInterview.scheduled,
  ).length;
  const organizationalInterviewCount = applications.filter(
    (item) => Boolean(item.orgInterview?.status),
  ).length;
  return (
    <div className="@container min-w-0 space-y-4 lg:space-y-6">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/10"
            >
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h2 className="break-words font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
                  {job?.title ?? "Job no longer available"}
                </h2>
                <ApplicationStatusBadge status={application.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                Application · {application._id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line-soft pt-5 @2xl:grid-cols-4">
          <DetailValue label="Applied on" icon={<CalendarDays />}>
            <span className="tabular-nums">
              {formatDateTime(application.createdAt)}
            </span>
          </DetailValue>
          <DetailValue label="Last updated" icon={<Clock3 />}>
            <span className="tabular-nums">
              {formatDateTime(application.updatedAt)}
            </span>
          </DetailValue>
        </dl>
      </Card>

      <Card padding="none">
        <Tabs
          ariaLabel="Application detail sections"
          idPrefix="application-detail"
          value={activeTab}
          onChange={onTabChange}
          className="px-5 pt-3 sm:px-6"
          tabs={detailTabs.map((tab) => ({
            id: tab.value,
            label: tab.label,
            icon: tab.icon,
            count:
              tab.value === "ai"
                ? aiInterviewCount
                : tab.value === "organizational"
                  ? organizationalInterviewCount
                  : undefined,
          }))}
        />

        <div
          id={`application-detail-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`application-detail-tab-${activeTab}`}
          className="min-h-64 p-5 sm:p-6"
        >
          {activeTab === "overview" && (
            <div className="space-y-6">
              <section>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-ink">
                    Application status
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    Where this application has reached. The employer reviews
                    your resume against the role and updates this as they go.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2.5">
                  <ApplicationStatusBadge status={application.status} />
                  <span className="text-xs text-muted">
                    Updated {formatDateTime(application.updatedAt)}
                  </span>
                </div>
              </section>

            </div>
          )}

          {(activeTab === "ai" || activeTab === "organizational") && (
            <InterviewSchedule
              applications={applications}
              category={activeTab}
            />
          )}

          {activeTab === "job" && (
            <div>
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-body"
                >
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="break-words text-base font-semibold text-ink">
                    {job?.title ?? "Job details unavailable"}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted">
                    Applied {formatDate(application.createdAt)}
                  </p>
                </div>
              </div>
              {job?.description ? (
                <p className="mt-5 whitespace-pre-line break-words border-t border-line-soft pt-5 text-sm leading-relaxed text-body">
                  {job.description}
                </p>
              ) : (
                <p className="mt-5 border-t border-line-soft pt-5 text-sm text-muted">
                  This job posting is no longer available.
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
