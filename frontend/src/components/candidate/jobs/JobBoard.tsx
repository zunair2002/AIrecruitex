"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  FileText,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { listOpenJobs } from "@/lib/jobsApi";
import { applyToJob, listMyApplications } from "@/lib/applicationsApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDate } from "@/lib/format";
import { refId, type Job, type ObjectId } from "@/lib/types";
import { ErrorBlock, InlineError } from "@/components/ui/Feedback";

type JobFilter = "all" | "not-applied" | "applied";
type SortOrder = "newest" | "oldest" | "title";

const EMPTY_JOBS: Job[] = [];

const jobFilters: { value: JobFilter; label: string }[] = [
  { value: "all", label: "All jobs" },
  { value: "not-applied", label: "Not applied" },
  { value: "applied", label: "Applied" },
];

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
  const skills = job.requiredSkills ?? [];

  return (
    <article className="flex min-w-0 flex-col border border-[#e9eaf0] bg-white p-3.5 transition-colors hover:border-[#d8d5f7] sm:p-4">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#ececf1] bg-[#fafafe] text-[#6b5ce7]">
          <BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[12px] font-semibold text-[#30323b]">
            {job.title}
          </h2>
          <p className="mt-0.5 truncate text-[9px] text-[#92949d]">
            {skills[0] ?? "Open position"}
          </p>
        </div>
        <span className="shrink-0 rounded-sm bg-[#f0efff] px-1.5 py-0.5 text-[8px] font-medium text-[#6658d9]">
          Open
        </span>
      </div>

      <div className="my-3 border-t border-dashed border-[#e9eaf0]" />

      <p
        className={`min-h-[54px] whitespace-pre-line text-[10px] leading-[1.55] text-[#777a85] ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {job.description}
      </p>
      {job.description.length > 220 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 self-start text-[9px] font-semibold text-[#6658d9] hover:text-[#5143c3]"
        >
          {expanded ? "Show less" : "Read full description"}
        </button>
      )}

      <div className="mt-3 min-h-[50px]">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="text-[8px] font-semibold uppercase tracking-[0.07em] text-[#999ba4]">
            Required skills
          </p>
          <span className="text-[8px] text-[#999ba4]">{skills.length}</span>
        </div>
        {skills.length ? (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="max-w-full truncate rounded-sm border border-[#ececf1] bg-[#fbfbfc] px-1.5 py-0.5 text-[8px] text-[#6f717b]"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="px-1 py-0.5 text-[8px] text-[#8d8f99]">
                +{skills.length - 4}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[9px] text-[#a0a2aa]">Not specified</span>
        )}
      </div>

      {job.jdFileUrl && (
        <a
          href={job.jdFileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 self-start text-[9px] font-medium text-[#7063d8] hover:text-[#5143c3]"
        >
          <FileText aria-hidden="true" className="h-3 w-3" />
          Job description
        </a>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#f0f0f3] pt-3">
        <span className="text-[8px] text-[#999ba4]">
          Posted {formatDate(job.createdAt)}
        </span>
        {hasApplied ? (
          <Link
            href="/candidate/applications"
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-2.5 text-[9px] font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <Check aria-hidden="true" className="h-3 w-3" />
            Applied
          </Link>
        ) : (
          <button
            type="button"
            onClick={onApply}
            disabled={isApplying}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded border border-[#e4e2f5] bg-white px-2.5 text-[9px] font-semibold text-[#5f53ce] transition-colors hover:border-[#6b5ce7] hover:bg-[#f5f4ff] disabled:cursor-wait disabled:opacity-60"
          >
            {isApplying ? "Applying…" : "Apply now"}
            {!isApplying && <ArrowRight aria-hidden="true" className="h-3 w-3" />}
          </button>
        )}
      </div>
    </article>
  );
}

export function JobBoard() {
  const { token } = useAuth();
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
      } catch (error) {
        setApplyError(toErrorMessage(error));
      } finally {
        setApplyingId(null);
      }
    },
    [token, applications],
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
    <div className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div className="mx-auto max-w-[1500px] space-y-3">
        <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e9eaf0] bg-white text-[#767985]">
              <BriefcaseBusiness aria-hidden="true" className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-semibold text-[#30323b]">
                Job Board
              </h1>
              <p className="hidden text-[10px] text-[#999ba4] sm:block">
                Browse open roles and apply with your uploaded resume.
              </p>
            </div>
          </div>
          <Link
            href="/candidate/applications"
            className="inline-flex h-7 shrink-0 items-center gap-1.5 self-start rounded border border-[#e7e7ed] bg-white px-2.5 text-[9px] font-medium text-[#666974] transition-colors hover:border-[#d8d5f7] hover:text-[#5f53ce] sm:self-auto"
          >
            <FileText aria-hidden="true" className="h-3 w-3" />
            My applications
          </Link>
        </header>

        <section
          aria-label="Job board filters"
          className="flex flex-col gap-2 border border-[#e9eaf0] bg-white p-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div
            role="tablist"
            aria-label="Filter jobs"
            className="flex min-w-0 items-center gap-0.5 overflow-x-auto"
          >
            {jobFilters.map((filter) => {
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
                  aria-selected={jobFilter === filter.value}
                  onClick={() => setJobFilter(filter.value)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-[9px] transition-colors ${
                    jobFilter === filter.value
                      ? "bg-[#f0efff] font-semibold text-[#5f53ce]"
                      : "text-[#777984] hover:bg-[#f7f7fa] hover:text-[#42444e]"
                  }`}
                >
                  {filter.label}
                  <span
                    className={`text-[8px] ${
                      jobFilter === filter.value
                        ? "text-[#8176df]"
                        : "text-[#a1a3ab]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="hidden h-5 border-l border-[#eeeeF2] sm:block" />
          <p className="hidden shrink-0 px-2 text-[9px] text-[#92949d] sm:block">
            {counts.applied} of {counts.all} applied
          </p>
        </section>

        {applyError && <InlineError message={applyError} />}

        {jobs.isLoading ? (
          <div
            aria-label="Loading open jobs"
            className="grid animate-pulse grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="h-56 border border-[#e9eaf0] bg-white"
              />
            ))}
          </div>
        ) : jobs.error ? (
          <ErrorBlock message={jobs.error} onRetry={jobs.reload} />
        ) : jobList.length === 0 ? (
          <div className="border border-[#e9eaf0] bg-white px-4 py-14 text-center">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f4ff] text-[#7163df]">
              <BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />
            </span>
            <h2 className="mt-3 text-[12px] font-semibold text-[#454752]">
              No open jobs right now
            </h2>
            <p className="mt-1 text-[10px] text-[#92949d]">
              New roles will appear here as soon as employers post them.
            </p>
          </div>
        ) : (
          <>
            <section className="border border-[#e9eaf0] bg-white p-2">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <label className="flex h-8 min-w-0 flex-1 items-center gap-2 border border-[#e9eaf0] px-2.5 focus-within:border-[#bdb6f0]">
                  <Search
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-[#92949d]"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search jobs by title, description or skill…"
                    className="min-w-0 flex-1 bg-transparent text-[10px] text-[#42444e] outline-none placeholder:text-[#a3a5ad]"
                    aria-label="Search jobs by title, description or skill"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="text-[9px] text-[#888a94] hover:text-[#454752]"
                    >
                      Clear
                    </button>
                  )}
                </label>

                <label className="relative flex h-8 items-center gap-1.5 border border-[#e9eaf0] px-2.5 lg:w-[170px]">
                  <SlidersHorizontal
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 text-[#92949d]"
                  />
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    aria-label="Filter jobs by required skill"
                    className="w-full appearance-none bg-transparent pr-4 text-[9px] text-[#666974] outline-none"
                  >
                    <option value="all">All skills</option>
                    {categories.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2 h-3 w-3 text-[#92949d]"
                  />
                </label>

                <label className="relative flex h-8 items-center gap-1.5 border border-[#e9eaf0] px-2.5 lg:w-[150px]">
                  <ArrowDownWideNarrow
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 text-[#92949d]"
                  />
                  <select
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value as SortOrder)
                    }
                    aria-label="Sort jobs"
                    className="w-full appearance-none bg-transparent pr-4 text-[9px] text-[#666974] outline-none"
                  >
                    <option value="newest">Most recent</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title">Job title</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2 h-3 w-3 text-[#92949d]"
                  />
                </label>
              </div>
            </section>

            <div className="flex items-center justify-between gap-3 px-0.5">
              <h2 className="text-[11px] font-semibold text-[#454752]">
                {jobFilter === "all"
                  ? "All open jobs"
                  : jobFilter === "applied"
                    ? "Jobs you’ve applied to"
                    : "Jobs to explore"}
              </h2>
              <span className="text-[9px] text-[#92949d]">
                {filtered.length} {filtered.length === 1 ? "job" : "jobs"}
              </span>
            </div>

            {filtered.length ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
              <div className="border border-[#e9eaf0] bg-white px-4 py-10 text-center">
                <p className="text-[10px] font-medium text-[#626570]">
                  No jobs match the selected filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("all");
                    setJobFilter("all");
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold text-[#6658d9] hover:text-[#5143c3]"
                >
                  Reset filters <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
