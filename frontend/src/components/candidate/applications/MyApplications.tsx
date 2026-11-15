"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Search,
  Target,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApplicationEvents } from "@/context/RealtimeContext";
import { listMyApplications } from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  APPLICATION_STATUS_LABELS,
  ORG_INTERVIEW_STATUS_LABELS,
  formatDate,
  formatDateTime,
  isInviteExpired,
  scoreColor,
  timeUntil,
} from "@/lib/format";
import {
  populated,
  type Application,
  type ApplicationStatus,
} from "@/lib/types";
import { ErrorBlock } from "@/components/ui/Feedback";
import { DayPicker, type DayButtonProps } from "react-day-picker";

type StatusFilter = "all" | ApplicationStatus;
type DetailTab = "overview" | "ai" | "organizational" | "job";
type InterviewCategory = "ai" | "organizational";
type InterviewDateKind = "scheduled" | "invited" | "deadline" | "completed";

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

const statusColors: Record<ApplicationStatus, string> = {
  pending: "#d99b2b",
  selected: "#279773",
  rejected: "#858995",
};

const statusStyles: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  selected: "bg-emerald-50 text-emerald-700",
  rejected: "bg-[#f3f3f6] text-[#686b77]",
};

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
];

const detailTabs: { value: DetailTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "ai", label: "AI interviews" },
  { value: "organizational", label: "Organisational" },
  { value: "job", label: "Job description" },
];

function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 border border-[#e9eaf0] bg-white ${className}`}
    >
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-[#eeeeF2] px-3 py-2">
        <h2 className="text-[11px] font-semibold text-[#454752]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ApplicationStatus({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-1 text-[8px] font-medium ${statusStyles[status]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: statusColors[status] }}
      />
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}

function DetailValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[8px] font-semibold uppercase tracking-[0.06em] text-[#999ba4]">
        {label}
      </dt>
      <dd className="mt-1 text-[10px] leading-4 text-[#555762]">{children}</dd>
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

function InterviewCalendarDayButton({
  day,
  modifiers,
  className,
  children,
  ...buttonProps
}: DayButtonProps) {
  const markers = [
    modifiers.scheduledInterview && {
      label: "AI interview",
      color: "#6b5ce7",
    },
    modifiers.inviteDate && {
      label: "Organisation invite",
      color: "#8b83d8",
    },
    modifiers.deadline && {
      label: "Complete by",
      color: "#d99b2b",
    },
    modifiers.completedDate && {
      label: "Completed",
      color: "#279773",
    },
  ].filter(
    (marker): marker is { label: string; color: string } => Boolean(marker),
  );
  const markerDescription = markers.map((marker) => marker.label).join(", ");

  return (
    <button
      {...buttonProps}
      title={markerDescription || undefined}
      className={`${className ?? ""} relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-[9px] text-[#555762] transition-colors hover:bg-[#f3f2ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6b5ce7] ${
        modifiers.selected
          ? "bg-[#eeecff] text-[#5f53ce] ring-1 ring-[#6b5ce7]"
          : modifiers.today
            ? "font-bold text-[#5f53ce] ring-1 ring-[#d8d3fb]"
            : ""
      }`}
    >
      <span className={markers.length ? "-mt-1" : ""}>
        {children ?? day.date.getDate()}
      </span>
      {markers.length > 0 && (
        <span className="absolute bottom-1 flex max-w-[24px] items-center justify-center gap-[2px]">
          {markers.slice(0, 4).map((marker) => (
            <span
              key={marker.label}
              className="h-1 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: marker.color }}
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
        if (interview.expiresAt) {
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

  const datesFor = (kind: InterviewDateKind) =>
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

  return (
    <div className="space-y-3">
      <div className="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="border border-[#e9eaf0] bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[10px] font-semibold text-[#454752]">
                Interview calendar
              </h3>
              <p className="mt-0.5 text-[8px] text-[#999ba4]">
                Select a marked date to view its interviews.
              </p>
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(undefined)}
                className="shrink-0 text-[8px] font-medium text-[#6658d9] hover:text-[#5143c3]"
              >
                Show all
              </button>
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
            components={{ DayButton: InterviewCalendarDayButton }}
            classNames={{
              root: "w-full",
              months: "w-full",
              month: "w-full",
              month_caption:
                "relative flex h-9 items-center justify-center px-16",
              caption_label: "text-[11px] font-semibold text-[#454752]",
              nav: "absolute inset-x-0 top-0 flex h-9 items-center justify-between",
              button_previous:
                "inline-flex h-7 w-7 items-center justify-center border border-[#e9eaf0] bg-white text-[#666974] hover:bg-[#f7f7fa]",
              button_next:
                "inline-flex h-7 w-7 items-center justify-center border border-[#e9eaf0] bg-white text-[#666974] hover:bg-[#f7f7fa]",
              month_grid: "w-full table-fixed border-separate border-spacing-y-1",
              weekdays: "",
              weekday:
                "h-7 text-center text-[8px] font-medium text-[#92949d]",
              weeks: "",
              week: "",
              day: "h-9 p-0 text-center",
              day_button: "",
              today: "font-bold text-[#5f53ce]",
              outside: "text-[#c6c7ce]",
              selected: "bg-[#eeecff] text-[#5f53ce]",
            }}
          />

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#f0f0f3] pt-2">
            {[
              ["bg-[#6b5ce7]", "AI interview"],
              ["bg-[#8b83d8]", "Organisation invite"],
              ["bg-[#d99b2b]", "Complete by"],
              ["bg-[#279773]", "Completed"],
            ].map(([color, label]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 text-[7px] text-[#858792]"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[10px] font-semibold text-[#454752]">
                {selectedDate
                  ? `Interviews on ${formatDate(selectedDate.toISOString())}`
                  : category === "organizational"
                    ? "Organisational interviews"
                    : "AI interviews"}
              </h3>
              <p className="mt-0.5 text-[8px] text-[#999ba4]">
                {visibleItems.length} interview
                {visibleItems.length === 1 ? "" : "s"}
                {selectedDate ? " on this date" : ""}
              </p>
            </div>
          </div>

          <div className="min-w-0 space-y-2">
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

              return (
                <article
                  key={item.id}
                  className="min-w-0 border border-[#e9eaf0] bg-white p-3"
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-[#454752]">
                        {item.category === "organizational"
                          ? "Organisational interview"
                          : "AI interview"}
                      </p>
                      <p className="mt-1 truncate text-[9px] text-[#686b77]">
                        {jobTitle}
                      </p>
                    </div>
                    <div className="flex max-w-full flex-wrap items-center gap-1.5">
                      <ApplicationStatus status={application.status} />
                      {orgStatus && (
                        <span
                          className={`rounded px-1.5 py-1 text-[8px] font-medium ${
                            orgStatus === "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : orgStatus === "expired"
                                ? "bg-[#f3f3f6] text-[#686b77]"
                                : "bg-[#f0efff] text-[#5f53ce]"
                          }`}
                        >
                          {ORG_INTERVIEW_STATUS_LABELS[orgStatus]}
                        </span>
                      )}
                      {item.category === "ai" && (
                        <span className="rounded bg-[#f0efff] px-1.5 py-1 text-[8px] font-medium text-[#5f53ce]">
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>

                  <dl className="mt-3 grid min-w-0 gap-x-4 gap-y-2 border-t border-[#f0f0f3] pt-2.5 sm:grid-cols-2">
                    {item.dates.map((date) => (
                      <div key={`${item.id}-${date.kind}`}>
                        <dt className="text-[7px] font-semibold uppercase tracking-[0.06em] text-[#999ba4]">
                          {date.label}
                        </dt>
                        <dd className="mt-0.5 break-words text-[9px] text-[#555762]">
                          {formatDateTime(date.value)}
                          {date.kind === "deadline" &&
                            orgStatus === "invited" && (
                              <span className="ml-1.5 text-[8px] font-medium text-[#6658d9]">
                                {timeUntil(date.value)}
                              </span>
                            )}
                        </dd>
                      </div>
                    ))}
                    <div>
                      <dt className="text-[7px] font-semibold uppercase tracking-[0.06em] text-[#999ba4]">
                        Role
                      </dt>
                      <dd className="mt-0.5 text-[9px] text-[#555762]">
                        {jobTitle}
                      </dd>
                    </div>
                  </dl>

                  {item.category === "organizational" && interview?.notes && (
                    <div className="mt-2.5 border-t border-[#f0f0f3] pt-2">
                      <p className="text-[7px] font-semibold uppercase tracking-[0.06em] text-[#999ba4]">
                        Organisation notes
                      </p>
                      <p className="mt-1 whitespace-pre-line text-[9px] leading-4 text-[#686b77]">
                        {interview.notes}
                      </p>
                    </div>
                  )}

                  {item.category === "ai" && application.aiInterview.message && (
                    <p className="mt-2.5 border-t border-[#f0f0f3] pt-2 text-[9px] leading-4 text-[#686b77]">
                      {application.aiInterview.message}
                    </p>
                  )}

                  {item.category === "organizational" &&
                    orgStatus === "invited" && (
                      <p className="mt-2 text-[8px] leading-4 text-[#858792]">
                        The invite link was sent to your email. Complete the
                        interview before the deadline; this is a flexible
                        invitation window, not a fixed appointment.
                      </p>
                    )}

                  <div className="mt-2.5 flex min-w-0 flex-wrap gap-2">
                    {item.category === "organizational" &&
                      orgStatus === "invited" &&
                      interview?.calendarLink && (
                        <a
                          href={interview.calendarLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-w-0 h-7 items-center gap-1.5 border border-[#dedaf7] bg-white px-2.5 text-[8px] font-medium text-[#5f53ce] transition-colors hover:border-[#c9c3f1]"
                        >
                          <CalendarDays
                            aria-hidden="true"
                            className="h-3 w-3"
                          />
                          <span className="truncate">Add invite window to calendar</span>
                          <ExternalLink
                            aria-hidden="true"
                            className="h-2.5 w-2.5"
                          />
                        </a>
                      )}
                    {item.category === "ai" &&
                      application.interviewSessionId && (
                        <Link
                          href={`/candidate/interview/session/${application.interviewSessionId}`}
                          className="inline-flex h-7 items-center gap-1 rounded bg-[#6b5ce7] px-2.5 text-[8px] font-semibold text-white hover:bg-[#5849d1]"
                        >
                          Open AI interview
                          <ArrowRight
                            aria-hidden="true"
                            className="h-3 w-3"
                          />
                        </Link>
                      )}
                    {item.category === "ai" &&
                      application.aiInterview.calendarLink && (
                        <a
                          href={application.aiInterview.calendarLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-7 items-center gap-1 border border-[#e9eaf0] bg-white px-2.5 text-[8px] font-medium text-[#666974] hover:border-[#d8d5f7] hover:text-[#5f53ce]"
                        >
                          Add to calendar
                          <ExternalLink
                            aria-hidden="true"
                            className="h-2.5 w-2.5"
                          />
                        </a>
                      )}
                  </div>
                </article>
              );
            })}

            {visibleItems.length === 0 && (
              <div className="flex min-h-[205px] flex-col items-center justify-center border border-[#e9eaf0] bg-white px-4 text-center">
                <CalendarDays
                  aria-hidden="true"
                  className="mb-2 h-5 w-5 text-[#b2b4bd]"
                />
                <p className="text-[10px] font-semibold text-[#555762]">
                  {selectedDate
                    ? "No interviews on this date"
                    : category === "organizational"
                      ? "No organisational interviews yet"
                      : "No AI interviews scheduled"}
                </p>
                <p className="mt-1 max-w-xs text-[9px] leading-4 text-[#92949d]">
                  {selectedDate
                    ? "Choose a marked date or show all interviews."
                    : "Interview schedules and organisational invites will appear here when available."}
                </p>
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

  const summary = useMemo(() => {
    const scores = applicationList.filter(
      (application) => typeof application.matchScore === "number",
    );
    return {
      averageMatch: scores.length
        ? Math.round(
            scores.reduce(
              (total, application) => total + application.matchScore,
              0,
            ) / scores.length,
          )
        : 0,
      matched: applicationList.filter((application) => application.matched)
        .length,
      interviews: applicationList.filter(
        (application) =>
          application.aiInterview.scheduled ||
          Boolean(application.orgInterview?.status),
      ).length,
    };
  }, [applicationList]);

  return (
    <div className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div className="mx-auto max-w-[1500px] space-y-3">
        <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e9eaf0] bg-white text-[#767985]">
              <BriefcaseBusiness aria-hidden="true" className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[9px] text-[#999ba4]">
                <Link
                  href="/candidate/dashboard"
                  className="hover:text-[#6658d9]"
                >
                  Candidate portal
                </Link>
                <span aria-hidden="true">/</span>
                <span className="text-[#686b77]">Applications</span>
              </div>
              <h1 className="mt-0.5 truncate text-[13px] font-semibold text-[#30323b]">
                My Applications
              </h1>
            </div>
          </div>
          <Link
            href="/candidate/jobs"
            className="inline-flex h-7 shrink-0 items-center gap-1.5 self-start rounded bg-[#6b5ce7] px-2.5 text-[9px] font-semibold text-white transition-colors hover:bg-[#5849d1] sm:self-auto"
          >
            Browse jobs <ArrowRight aria-hidden="true" className="h-3 w-3" />
          </Link>
        </header>

        {applications.error && (
          <ErrorBlock
            message={applications.error}
            onRetry={applications.reload}
          />
        )}

        {applications.isLoading ? (
          <div
            aria-label="Loading your applications"
            className="grid animate-pulse gap-3 lg:grid-cols-[minmax(245px,0.78fr)_minmax(0,2fr)]"
          >
            <div className="h-[540px] border border-[#e9eaf0] bg-white" />
            <div className="h-[540px] border border-[#e9eaf0] bg-white" />
          </div>
        ) : applicationList.length === 0 ? (
          <div className="border border-[#e9eaf0] bg-white px-4 py-14 text-center">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f3ff] text-[#7163df]">
              <FileText aria-hidden="true" className="h-4 w-4" />
            </span>
            <h2 className="mt-3 text-[12px] font-semibold text-[#454752]">
              No applications yet
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-[10px] leading-4 text-[#92949d]">
              Upload your resume and apply from the job board. Your match score
              will be calculated when you apply.
            </p>
            <Link
              href="/candidate/jobs"
              className="mt-4 inline-flex h-7 items-center gap-1.5 rounded bg-[#6b5ce7] px-2.5 text-[9px] font-semibold text-white hover:bg-[#5849d1]"
            >
              Browse open jobs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(255px,0.78fr)_minmax(0,2fr)]">
            <Panel
              title="Applications"
              action={
                <span className="rounded-full bg-[#f0efff] px-1.5 py-0.5 text-[8px] font-medium text-[#6658d9]">
                  {counts.all}
                </span>
              }
            >
              <div className="border-b border-[#f0f0f3] p-2.5">
                <label className="flex h-7 items-center gap-1.5 border border-[#e9eaf0] px-2">
                  <Search
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 text-[#9a9ca5]"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search job title…"
                    aria-label="Search applications by job title"
                    className="min-w-0 flex-1 bg-transparent text-[9px] text-[#42444e] outline-none placeholder:text-[#a3a5ad]"
                  />
                </label>
                <div
                  role="tablist"
                  aria-label="Filter applications by status"
                  className="mt-2 flex gap-1 overflow-x-auto"
                >
                  {statusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      role="tab"
                      aria-selected={statusFilter === filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-1 text-[8px] transition-colors ${
                        statusFilter === filter.value
                          ? "bg-[#f0efff] font-semibold text-[#5f53ce]"
                          : "text-[#858792] hover:bg-[#f7f7fa]"
                      }`}
                    >
                      {filter.label}
                      <span className="text-[7px] opacity-70">
                        {counts[filter.value]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[calc(100dvh-290px)] min-h-[220px] overflow-y-auto p-1.5">
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
                      className={`mb-1.5 block w-full border p-2.5 text-left transition-colors last:mb-0 ${
                        isSelected
                          ? "border-[#dcd8fa] bg-[#f8f7ff]"
                          : "border-transparent hover:border-[#ececf1] hover:bg-[#fbfbfc]"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded ${
                            isSelected
                              ? "bg-[#eeecff] text-[#6658d9]"
                              : "bg-[#f4f5f8] text-[#888a94]"
                          }`}
                        >
                          <BriefcaseBusiness
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[10px] font-semibold text-[#454752]">
                            {job?.title ?? "Job no longer available"}
                          </span>
                          <span className="mt-1 block text-[8px] text-[#999ba4]">
                            Applied {formatDate(application.createdAt)}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 text-[9px] font-semibold tabular-nums ${scoreColor(application.matchScore)}`}
                        >
                          {application.matchScore}%
                        </span>
                      </div>
                      <span className="mt-2 flex items-center justify-between pl-9">
                        <ApplicationStatus status={application.status} />
                        {application.matched && (
                          <span className="text-[8px] text-[#279773]">
                            Match qualified
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="px-3 py-9 text-center">
                    <p className="text-[9px] font-medium text-[#626570]">
                      No applications match these filters.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                      }}
                      className="mt-2 text-[9px] font-semibold text-[#6658d9] hover:text-[#5143c3]"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </Panel>

            {selectedApplication ? (
              <ApplicationDetail
                application={selectedApplication}
                applications={applicationList}
                summary={summary}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            ) : (
              <section className="flex min-h-[320px] items-center justify-center border border-[#e9eaf0] bg-white px-5 text-center">
                <p className="text-[10px] text-[#858792]">
                  Select an application to view its details.
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationDetail({
  application,
  applications,
  summary,
  activeTab,
  onTabChange,
}: {
  application: Application;
  applications: Application[];
  summary: { averageMatch: number; matched: number; interviews: number };
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}) {
  const job = populated(application.jobId);
  const { aiInterview, orgInterview } = application;
  const hasInterviews = aiInterview.scheduled || Boolean(orgInterview?.status);
  const interviewCount = applications.reduce(
    (count, item) =>
      count +
      Number(item.aiInterview.scheduled) +
      Number(Boolean(item.orgInterview?.status)),
    0,
  );
  const aiInterviewCount = applications.filter(
    (item) => item.aiInterview.scheduled,
  ).length;
  const organizationalInterviewCount = applications.filter(
    (item) => Boolean(item.orgInterview?.status),
  ).length;

  return (
    <div className="min-w-0 space-y-3">
      <section className="border border-[#e9eaf0] bg-white p-3 sm:p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#f0efff] text-[#6658d9]">
              <BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[14px] font-semibold tracking-[-0.02em] text-[#30323b]">
                  {job?.title ?? "Job no longer available"}
                </h2>
                <ApplicationStatus status={application.status} />
              </div>
              <p className="mt-1 text-[9px] text-[#92949d]">
                Application · {application._id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(220px,0.95fr)]">
        <Panel
          title="Application details"
          action={
            <span className="text-[8px] text-[#999ba4]">
              Updated {formatDate(application.updatedAt)}
            </span>
          }
        >
          <div
            role="tablist"
            aria-label="Application detail sections"
            className="flex gap-1 overflow-x-auto border-b border-[#eeeeF2] bg-white px-2.5 py-2"
          >
            {detailTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-[9px] transition-colors ${
                  activeTab === tab.value
                    ? "bg-[#f0efff] font-semibold text-[#5f53ce]"
                    : "text-[#858792] hover:bg-[#f7f7fa] hover:text-[#50525d]"
                }`}
              >
                {tab.label}
                {(tab.value === "ai" || tab.value === "organizational") && (
                  <span className="ml-1 rounded-full bg-[#f0efff] px-1 py-0.5 text-[7px] text-[#6658d9]">
                    {tab.value === "ai"
                      ? aiInterviewCount
                      : organizationalInterviewCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[255px] space-y-3 bg-[#fcfcfd] p-3 sm:p-4">
            {activeTab === "overview" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[11px] font-semibold text-[#454752]">
                      Match overview
                    </h3>
                    <p className="mt-0.5 text-[9px] text-[#92949d]">
                      Based on the resume snapshot used when you applied.
                    </p>
                  </div>
                  <span
                    className={`text-[18px] font-bold tabular-nums ${scoreColor(application.matchScore)}`}
                  >
                    {application.matchScore}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#eeedf3]">
                  <div
                    className="h-full rounded-full bg-[#6b5ce7] transition-[width]"
                    style={{
                      width: `${Math.min(100, Math.max(0, application.matchScore))}%`,
                    }}
                  />
                </div>
                <section className="border border-[#ededf1] bg-white p-3">
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <h3 className="text-[10px] font-semibold text-[#555762]">
                      Skills found in your resume
                    </h3>
                    <span className="text-[8px] text-[#999ba4]">
                      {application.resumeSnapshotSkills.length} skills
                    </span>
                  </div>
                  {application.resumeSnapshotSkills.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {application.resumeSnapshotSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 rounded border border-[#e5f1ec] bg-[#f4faf7] px-2 py-1 text-[8px] text-[#507563]"
                        >
                          <Check
                            aria-hidden="true"
                            className="h-2.5 w-2.5 text-[#3e9a72]"
                          />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-[#92949d]">
                      No required skills were found in the resume snapshot.
                    </p>
                  )}
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
              <div className="border border-[#ededf1] bg-white p-3">
                <div className="flex items-start gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#f4f5f8] text-[#777984]">
                    <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-semibold text-[#454752]">
                      {job?.title ?? "Job details unavailable"}
                    </h3>
                    <p className="mt-1 text-[8px] text-[#999ba4]">
                      Applied {formatDate(application.createdAt)}
                    </p>
                  </div>
                </div>
                {job?.description ? (
                  <p className="mt-3 whitespace-pre-line border-t border-[#f0f0f3] pt-3 text-[10px] leading-[1.7] text-[#686b77]">
                    {job.description}
                  </p>
                ) : (
                  <p className="mt-3 border-t border-[#f0f0f3] pt-3 text-[9px] text-[#92949d]">
                    This job posting is no longer available.
                  </p>
                )}
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title="Application information"
          className="xl:sticky xl:top-3"
          action={
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4f3ff] text-[#6658d9]">
              <BriefcaseBusiness aria-hidden="true" className="h-3 w-3" />
            </span>
          }
        >
          <div className="space-y-3.5 p-3">
            <DetailValue label="Job title">
              {job?.title ?? "Job no longer available"}
            </DetailValue>
            <DetailValue label="Application status">
              <ApplicationStatus status={application.status} />
            </DetailValue>
            <DetailValue label="Match score">
              <span
                className={`inline-flex items-center gap-1 font-semibold ${scoreColor(application.matchScore)}`}
              >
                <Target aria-hidden="true" className="h-3 w-3" />
                {application.matchScore}%
              </span>
            </DetailValue>
            <DetailValue label="Shortlisting">
              <span className="inline-flex items-center gap-1">
                {application.matched ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-3 w-3 text-emerald-600"
                  />
                ) : (
                  <Clock3
                    aria-hidden="true"
                    className="h-3 w-3 text-amber-600"
                  />
                )}
                {application.matched
                  ? "Met match threshold"
                  : "Below match threshold"}
              </span>
            </DetailValue>
            <div className="border-t border-[#f0f0f3] pt-3">
              <DetailValue label="Applied on">
                {formatDateTime(application.createdAt)}
              </DetailValue>
            </div>
            <DetailValue label="Last updated">
              {formatDateTime(application.updatedAt)}
            </DetailValue>
            <DetailValue label="Interview steps">
              {hasInterviews
                ? `${Number(aiInterview.scheduled) + Number(Boolean(orgInterview?.status))} scheduled or invited`
                : "No interviews yet"}
            </DetailValue>
          </div>
          <div className="border-t border-[#eeeeF2] px-3 py-2.5">
            <p className="text-[8px] font-semibold uppercase tracking-[0.06em] text-[#999ba4]">
              Interview activity
            </p>
            <div className="mt-2 flex items-center justify-between gap-2 text-[9px]">
              <span className="text-[#686b77]">AI interviews</span>
              <span className="font-semibold tabular-nums text-[#5f53ce]">
                {aiInterviewCount}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-[9px]">
              <span className="text-[#686b77]">Organisational</span>
              <span className="font-semibold tabular-nums text-[#5f53ce]">
                {organizationalInterviewCount}
              </span>
            </div>
            <p className="mt-2 border-t border-[#f0f0f3] pt-2 text-[8px] leading-4 text-[#92949d]">
              {interviewCount} total interview
              {interviewCount === 1 ? "" : "s"} across your applications
            </p>
          </div>
          <div className="border-t border-[#eeeeF2] bg-[#fbfbfc] px-3 py-2.5">
            <p className="text-[8px] leading-4 text-[#92949d]">
              Across {summary.averageMatch}% average match on your applications
              · {summary.matched} qualified match
              {summary.matched === 1 ? "" : "es"}
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
