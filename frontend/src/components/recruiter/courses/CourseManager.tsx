"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  createCourse,
  deleteCourse,
  listHrCourses,
  updateCourse,
} from "@/lib/learningApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  COURSE_BASIC_TOPICS,
  COURSE_TECH_TOPICS,
  type Course,
  type CourseInput,
  type ObjectId,
} from "@/lib/types";
import { formatDate } from "@/lib/format";
import {
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  PageHeader,
  SkillChips,
} from "@/components/ui/Feedback";
import {
  dangerButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  smallButtonClass,
} from "@/components/ui/controls";
import { useToast } from "@/context/ToastContext";

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 1000;
const topicLabel = (topic: string) => topic.replace(/_/g, " ");

const EMPTY: CourseInput = {
  title: "",
  description: "",
  videoUrl: "",
  topics: [],
};

/**
 * HR's course library. `PUT` replaces every field, so editing loads the course
 * into the same form the create flow uses. Topics are restricted to the
 * backend's fixed vocabulary and `videoUrl` must be HTTPS — both are validated
 * server-side and mirrored here so mistakes are caught before the round trip.
 */
export function CourseManager() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<CourseInput>(EMPTY);
  const [editingId, setEditingId] = useState<ObjectId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<ObjectId | null>(null);

  const courses = useApiResource(
    (signal) => listHrCourses(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  const update = <K extends keyof CourseInput>(key: K, value: CourseInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleTopic = (topic: string) =>
    setForm((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));

  const isHttps = form.videoUrl.trim().toLowerCase().startsWith("https://");
  const isValid =
    form.title.trim().length > 0 &&
    form.description.trim().length > 0 &&
    isHttps &&
    form.topics.length > 0;

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError(null);
  };

  const startEditing = (course: Course) => {
    setForm({
      title: course.title,
      description: course.description,
      videoUrl: course.videoUrl,
      topics: course.topics,
    });
    setEditingId(course._id);
    setSuccess(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: CourseInput = {
        title: form.title.trim(),
        description: form.description.trim(),
        videoUrl: form.videoUrl.trim(),
        topics: form.topics,
      };
      if (editingId) {
        await updateCourse(editingId, payload, token);
        setSuccess("Course updated.");
        toast({ title: "Course updated", detail: payload.title });
      } else {
        await createCourse(payload, token);
        setSuccess("Course published.");
        toast({ title: "Course published", detail: payload.title });
      }
      resetForm();
      courses.reload();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setBusyId(course._id);
    setError(null);
    try {
      await deleteCourse(course._id, token);
      if (editingId === course._id) resetForm();
      courses.reload();
      toast({ title: "Course deleted", detail: course.title });
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const list = courses.data ?? [];

  return (
    <div className="p-8">
      <PageHeader
        title="Learning Courses"
        description="Material candidates see under Learning. Useful for the weak topics interview reports flag."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card title={editingId ? "Edit course" : "Publish a course"}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <InlineError message={error} />}
              {success && <InlineSuccess message={success} />}

              <div>
                <label htmlFor="course-title" className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="course-title"
                  type="text"
                  maxLength={TITLE_MAX}
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="e.g. React hooks in depth"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-gray-400">
                  {form.title.length}/{TITLE_MAX}
                </p>
              </div>

              <div>
                <label htmlFor="course-description" className={labelClass}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="course-description"
                  rows={4}
                  maxLength={DESCRIPTION_MAX}
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                  placeholder="What the course covers and who it's for."
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-1 text-xs text-gray-400">
                  {form.description.length}/{DESCRIPTION_MAX}
                </p>
              </div>

              <div>
                <label htmlFor="course-video" className={labelClass}>
                  Video URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="course-video"
                  type="url"
                  value={form.videoUrl}
                  onChange={(event) => update("videoUrl", event.target.value)}
                  placeholder="https://…"
                  className={inputClass}
                />
                {form.videoUrl.trim() && !isHttps && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    Must start with https://
                  </p>
                )}
              </div>

              <div>
                <span className={labelClass}>
                  Topics <span className="text-red-500">*</span>
                </span>
                <TopicPicker
                  heading="Technical"
                  topics={[...COURSE_TECH_TOPICS]}
                  selected={form.topics}
                  onToggle={toggleTopic}
                />
                <TopicPicker
                  heading="Behavioural"
                  topics={[...COURSE_BASIC_TOPICS]}
                  selected={form.topics}
                  onToggle={toggleTopic}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Pick at least one. These match the topics interviews are scored
                  against.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!isValid || isSaving}
                  className={primaryButtonClass}
                >
                  {isSaving
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Publish course"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className={secondaryButtonClass}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {courses.isLoading ? (
            <LoadingBlock label="Loading courses…" />
          ) : courses.error ? (
            <ErrorBlock message={courses.error} onRetry={courses.reload} />
          ) : list.length === 0 ? (
            <EmptyState
              title="No courses yet."
              description="Publish one and it appears in every candidate's Learning tab."
            />
          ) : (
            <div className="space-y-4">
              {list.map((course) => (
                <Card key={course._id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-bold text-gray-900">{course.title}</h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Added {formatDate(course.createdAt)}
                        {!course.isActive && " · hidden from candidates"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(course)}
                        disabled={busyId === course._id}
                        className={smallButtonClass}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(course)}
                        disabled={busyId === course._id}
                        className={dangerButtonClass}
                      >
                        {busyId === course._id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
                    {course.description}
                  </p>
                  <div className="mt-3">
                    <SkillChips skills={course.topics.map(topicLabel)} />
                  </div>
                  <a
                    href={course.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Open video
                  </a>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TopicPicker({
  heading,
  topics,
  selected,
  onToggle,
}: {
  heading: string;
  topics: string[];
  selected: string[];
  onToggle: (topic: string) => void;
}) {
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {heading}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {topics.map((topic) => {
          const isOn = selected.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              onClick={() => onToggle(topic)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                isOn
                  ? "border-indigo-300 bg-indigo-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {topicLabel(topic)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
