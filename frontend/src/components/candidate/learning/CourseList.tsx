"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { listActiveCourses } from "@/lib/learningApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDate } from "@/lib/format";
import {
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  SkillChips,
} from "@/components/ui/Feedback";
import { compactInputClass } from "@/components/ui/controls";

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
    <div className="p-8">
      <PageHeader
        title="Learning"
        description="Courses published by the hiring team. Useful when an interview report flags a weak topic."
      />

      {courses.isLoading ? (
        <LoadingBlock label="Loading courses…" />
      ) : courses.error ? (
        <ErrorBlock message={courses.error} onRetry={courses.reload} />
      ) : list.length === 0 ? (
        <EmptyState
          title="No courses published yet."
          description="When the hiring team adds learning material, it appears here."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses…"
              className={`${compactInputClass} flex-1`}
            />
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className={compactInputClass}
            >
              <option value={ALL}>All topics</option>
              {topics.map((item) => (
                <option key={item} value={item}>
                  {topicLabel(item)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.map((course) => (
              <Card key={course._id}>
                <h2 className="text-lg font-bold text-gray-900">{course.title}</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Added {formatDate(course.createdAt)}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
                  {course.description}
                </p>
                <div className="mt-4">
                  <SkillChips skills={course.topics.map(topicLabel)} />
                </div>
                <a
                  href={course.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Watch course
                </a>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-gray-500">
              No courses match those filters.
            </p>
          )}
        </>
      )}
    </div>
  );
}
