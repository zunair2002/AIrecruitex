"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Clock3,
  FileText,
  Search,
  SearchX,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { listOpenJobs } from "@/lib/jobsApi";
import { applyToJob, listMyApplications } from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  JOB_STATUS_BADGE,
  JOB_STATUS_LABELS,
  badgeClass,
  formatDate,
} from "@/lib/format";
import { refId, type Job, type ObjectId } from "@/lib/types";
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  PageHeader,
} from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { inputClass, selectClass } from "@/components/ui/controls";
import { tabClass, tabCountClass, tabListClass } from "@/components/ui/Tabs";
import { PortalPage } from "@/components/dashboard/primitives";
import { useToast } from "@/context/ToastContext";

type JobFilter = "all" | "not-applied" | "applied";
type SortOrder = "newest" | "oldest" | "title";

const EMPTY_JOBS: Job[] = [];

const jobFilters: { value: JobFilter; label: string }[] = [
  { value: "all", label: "All jobs" },
  { value: "not-applied", label: "Not applied" },
  { value: "applied", label: "Applied" },
];

const SKILL_PREVIEW = 4;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

function JobCard({
  job,
  hasApplied,
  isApplying,
  onApply,
}: {
  job: Job;
  hasApplied: boolean;
  isApplying: boolean;
  onApply: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const skills = job.requiredSkills ?? [];

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-line bg-surface p-5 shadow-xs transition-colors hover:border-brand-200 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
        >
          <BriefcaseBusiness className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-ink">{job.title}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            Posted {formatDate(job.createdAt)}
          </p>
        </div>
        <span className={JOB_STATUS_BADGE.open}>{JOB_STATUS_LABELS.open}</span>
      </div>

      <p
        className={`mt-4 whitespace-pre-line text-sm leading-6 text-body ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {job.description}
      </p>
      {job.description.length > 220 && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className={`mt-1 self-start rounded-md text-sm font-medium text-brand-700 hover:text-brand-800 ${focusRing}`}
        >
          {expanded ? "Show less" : "Read full description"}
        </button>
      )}

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Required skills
          </p>
          <span className="text-xs tabular-nums text-muted">{skills.length}</span>
        </div>
        {skills.length ? (
          <div className="flex flex-wrap gap-1.5">
            {(showAllSkills ? skills : skills.slice(0, SKILL_PREVIEW)).map(
              (skill) => (
                <span
                  key={skill}
                  className={`${badgeClass("neutral")} max-w-full truncate`}
                >
                  {skill}
                </span>
              ),
            )}
            {skills.length > SKILL_PREVIEW && (
              <button
                type="button"
                aria-expanded={showAllSkills}
                onClick={() => setShowAllSkills((value) => !value)}
                className={`inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 hover:bg-brand-100 ${focusRing}`}
              >
                {showAllSkills
                  ? "Show less"
                  : `+${skills.length - SKILL_PREVIEW} more`}
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted">Not specified</span>
        )}
      </div>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
          {job.jdFileUrl ? (
            <a
              href={job.jdFileUrl}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-brand-700 hover:text-brand-800 ${focusRing}`}
            >
              <FileText aria-hidden="true" className="h-4 w-4" />
              Job description
            </a>
          ) : (
            <span />
          )}
          {hasApplied ? (
            <Link
              href="/candidate/applications"
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-brand-50 px-4 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20 transition-colors hover:bg-brand-100 ${focusRing}`}
            >
              <Check aria-hidden="true" className="h-4 w-4" />
              Applied
            </Link>
          ) : (
            <Button
              onClick={onApply}
              loading={isApplying}
              trailingIcon={
                isApplying ? undefined : <ArrowRight aria-hidden="true" />
              }
            >
              {isApplying ? "Applying…" : "Apply now"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function JobBoard() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [jobFilter, setJobFilter] = useState<JobFilter>("all");
  const [applyingId, setApplyingId] = useState<ObjectId | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const jobs = useApiResource(
    (signal) => listOpenJobs(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  const applications = useApiResource(
    (signal) => listMyApplications(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  const jobList = jobs.data ?? EMPTY_JOBS;

  const appliedJobIds = useMemo(() => {
    const ids = new Set<string>();
    for (const application of applications.data ?? []) {
      const id = refId(application.jobId);
      if (id) ids.add(id);
    }
    return ids;
  }, [applications.data]);

  const categories = useMemo(() => {
    const values = new Set<string>();
    for (const job of jobList) {
      for (const skill of job.requiredSkills ?? []) {
        if (skill.trim()) values.add(skill.trim());
      }
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [jobList]);

  const handleApply = useCallback(
    async (jobId: ObjectId) => {
      setApplyingId(jobId);
      setApplyError(null);
      try {
        await applyToJob(jobId, token);
        applications.reload();
        toast({
          title: "Application sent",
          detail: "Track it under My Applications.",
        });
      } catch (error) {
        setApplyError(toErrorMessage(error));
      } finally {
        setApplyingId(null);
      }
    },
    [token, applications, toast],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const result = jobList.filter((job) => {
      const matchesSearch =
        !query ||
        job.title.toLocaleLowerCase().includes(query) ||
        job.description.toLocaleLowerCase().includes(query) ||
        (job.requiredSkills ?? []).some((skill) =>
          skill.toLocaleLowerCase().includes(query),
        );
      const matchesCategory =
        category === "all" || (job.requiredSkills ?? []).includes(category);
      const hasApplied = appliedJobIds.has(job._id);
      const matchesFilter =
        jobFilter === "all" ||
        (jobFilter === "applied" && hasApplied) ||
        (jobFilter === "not-applied" && !hasApplied);
      return matchesSearch && matchesCategory && matchesFilter;
    });

    return result.sort((first, second) => {
      if (sortOrder === "title") return first.title.localeCompare(second.title);
      const dateDifference =
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime();
      return sortOrder === "newest" ? dateDifference : -dateDifference;
    });
  }, [jobList, search, category, sortOrder, jobFilter, appliedJobIds]);

  const counts = useMemo(
    () => ({
      all: jobList.length,
      applied: jobList.filter((job) => appliedJobIds.has(job._id)).length,
      notApplied: jobList.filter((job) => !appliedJobIds.has(job._id)).length,
    }),
    [jobList, appliedJobIds],
  );

  return (
    <PortalPage>
      <PageHeader
        title="Job board"
        description="Browse open roles and apply with your uploaded resume."
        icon={<BriefcaseBusiness />}
        action={
          <Button
            variant="secondary"
            href="/candidate/applications"
            leadingIcon={<FileText aria-hidden="true" />}
          >
            My applications
          </Button>
        }
      />

      <section
        aria-label="Job board filters"
        className="flex items-end justify-between gap-4 border-b border-line"
      >
        <div
          role="tablist"
          aria-label="Filter jobs"
          className={`${tabListClass} min-w-0`}
        >
          {jobFilters.map((filter) => {
            const isActive = jobFilter === filter.value;
            const count =
              filter.value === "all"
                ? counts.all
                : filter.value === "applied"
                  ? counts.applied
                  : counts.notApplied;
            return (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setJobFilter(filter.value)}
                className={tabClass(isActive)}
              >
                {filter.label}
                <span className={tabCountClass(isActive)}>{count}</span>
              </button>
            );
          })}
        </div>
        <p className="hidden shrink-0 pb-3 text-sm text-muted sm:block">
          <span className="font-semibold tabular-nums text-ink">
            {counts.applied}
          </span>{" "}
          of <span className="tabular-nums">{counts.all}</span> applied
        </p>
      </section>

      {applyError && <InlineError message={applyError} />}

      {jobs.isLoading ? (
        <div
          role="status"
          aria-label="Loading open jobs"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonCard key={index} lines={4} />
          ))}
        </div>
      ) : jobs.error ? (
        <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
      ) : jobList.length === 0 ? (
        <EmptyState
          icon={<BriefcaseBusiness />}
          title="No open jobs right now"
          description="New roles will appear here as soon as employers post them."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search jobs by title, description or skill…"
                className={`${inputClass} pl-9 ${search ? "pr-16" : ""}`}
                aria-label="Search jobs by title, description or skill"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-muted hover:bg-surface-3 hover:text-ink ${focusRing}`}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 md:flex md:shrink-0">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filter jobs by required skill"
                className={`${selectClass} md:w-48`}
              >
                <option value="all">All skills</option>
                {categories.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as SortOrder)
                }
                aria-label="Sort jobs"
                className={`${selectClass} md:w-44`}
              >
                <option value="newest">Most recent</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Job title</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">
                {jobFilter === "all"
                  ? "All open jobs"
                  : jobFilter === "applied"
                    ? "Jobs you’ve applied to"
                    : "Jobs to explore"}
              </h2>
              <span className="text-sm tabular-nums text-muted">
                {filtered.length} {filtered.length === 1 ? "job" : "jobs"}
              </span>
            </div>

            {filtered.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                {filtered.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    hasApplied={appliedJobIds.has(job._id)}
                    isApplying={applyingId === job._id}
                    onApply={() => handleApply(job._id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<SearchX />}
                title="No jobs match the selected filters."
                description="Try a different search term, skill or filter."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch("");
                      setCategory("all");
                      setJobFilter("all");
                    }}
                    trailingIcon={<ArrowRight aria-hidden="true" />}
                  >
                    Reset filters
                  </Button>
                }
              />
            )}
          </div>
        </>
      )}
    </PortalPage>
  );
}
