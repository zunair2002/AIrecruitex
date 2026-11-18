"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { listActiveCourses } from "@/lib/learningApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDate } from "@/lib/format";
import { CalendarDays, GraduationCap, PlayCircle, Search, SearchX } from "lucide-react";
import { PortalPage } from "@/components/dashboard/primitives";
import { buttonClass } from "@/components/ui/Button";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  SkillChips,
} from "@/components/ui/Feedback";
import { inputClass, selectClass } from "@/components/ui/controls";

const ALL = "all";

/** Humanises the backend's topic slugs ("cloud_devops" -> "cloud devops"). */
const topicLabel = (topic: string) => topic.replace(/_/g, " ");

/**
 * GET /api/learning/courses — the active courses HR has published. Candidates
 * only ever see active ones; the backend filters them out server-side.
 */
export function CourseList() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  // A failed interview links here with ?topic=<weak topic>, so the list opens
  // already filtered to what the candidate needs to work on.
  const [topic, setTopic] = useState<string>(searchParams.get("topic") ?? ALL);

  const courses = useApiResource(
    (signal) => listActiveCourses(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  // Memoised so the two useMemos below don't see a new array identity each render.
  const list = useMemo(() => courses.data ?? [], [courses.data]);

  const topics = useMemo(() => {
    const seen = new Set<string>();
    list.forEach((course) => course.topics.forEach((t) => seen.add(t)));
    return Array.from(seen).sort();
  }, [list]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return list.filter((course) => {
      const matchesTopic = topic === ALL || course.topics.includes(topic);
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query);
      return matchesTopic && matchesSearch;
    });
  }, [list, search, topic]);

  return (
    <PortalPage>
      <PageHeader
        title="Learning"
        description="Courses published by the hiring team. Useful when an interview report flags a weak topic."
        icon={<GraduationCap />}
      />

      {courses.isLoading ? (
        <LoadingBlock label="Loading courses…" variant="skeleton" rows={4} />
      ) : courses.error ? (
        <ErrorBlock message={courses.error} onRetry={courses.reload} />
      ) : list.length === 0 ? (
        <EmptyState
          title="No courses published yet."
          description="When the hiring team adds learning material, it appears here."
          icon={<GraduationCap />}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:max-w-sm sm:flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search courses…"
                aria-label="Search courses"
                className={`${inputClass} pl-9`}
              />
            </div>
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              aria-label="Filter by topic"
              className={`${selectClass} capitalize sm:w-56`}
            >
              <option value={ALL}>All topics</option>
              {topics.map((item) => (
                <option key={item} value={item}>
                  {topicLabel(item)}
                </option>
              ))}
            </select>
            <p className="text-sm tabular-nums text-muted sm:ml-auto">
              {filtered.length} of {list.length} course{list.length === 1 ? "" : "s"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No courses match those filters."
              description="Try a different search or pick another topic."
              icon={<SearchX />}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
              {filtered.map((course) => (
                <article
                  key={course._id}
                  className="flex min-w-0 flex-col rounded-xl border border-line bg-surface p-5 shadow-xs transition-colors hover:border-brand-200 sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
                    >
                      <PlayCircle className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold leading-6 text-ink">
                        {course.title}
                      </h2>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                        <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                        Added {formatDate(course.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-6 text-muted">
                    {course.description}
                  </p>
                  <div className="mt-4">
                    <SkillChips skills={course.topics.map(topicLabel)} />
                  </div>
                  <div className="mt-5 border-t border-line-soft pt-4">
                    <a
                      href={course.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClass({
                        variant: "soft",
                        className: "w-full sm:w-auto",
                      })}
                    >
                      <PlayCircle aria-hidden="true" />
                      Watch course
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </PortalPage>
  );
}
