"use client";

import { useState } from "react";
import {
  CirclePlay,
  ExternalLink,
  GraduationCap,
  Pencil,
  Trash2,
} from "lucide-react";
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
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  InlineSuccess,
  PageHeader,
  SkeletonCard,
  SkillChips,
} from "@/components/ui";
import {
  errorTextClass,
  helpTextClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/ui/controls";
import { PortalPage } from "@/components/dashboard/primitives";
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

function Required() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-rose-600">
      *
    </span>
  );
}

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
  const showVideoError = Boolean(form.videoUrl.trim()) && !isHttps;

  return (
    <PortalPage>
      <PageHeader
        title="Learning courses"
        description="Material candidates see under Learning. Useful for the weak topics interview reports flag."
        icon={<GraduationCap />}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:gap-6 xl:grid-cols-5">
        {/* ---- create / edit form ---- */}
        <Card
          title={editingId ? "Edit course" : "Publish a course"}
          description={
            editingId
              ? "Changes replace the course for every candidate."
              : "It appears in every candidate's Learning tab."
          }
          action={editingId ? <Badge tone="brand">Editing</Badge> : undefined}
          className="xl:sticky xl:top-6 xl:col-span-2"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <InlineError message={error} />}
            {success && <InlineSuccess message={success} />}

            <div>
              <label htmlFor="course-title" className={labelClass}>
                Title <Required />
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
              <p className={`${helpTextClass} text-right tabular-nums`}>
                {form.title.length}/{TITLE_MAX}
              </p>
            </div>

            <div>
              <label htmlFor="course-description" className={labelClass}>
                Description <Required />
              </label>
              <textarea
                id="course-description"
                rows={4}
                maxLength={DESCRIPTION_MAX}
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="What the course covers and who it's for."
                className={`${textareaClass} resize-y`}
              />
              <p className={`${helpTextClass} text-right tabular-nums`}>
                {form.description.length}/{DESCRIPTION_MAX}
              </p>
            </div>

            <div>
              <label htmlFor="course-video" className={labelClass}>
                Video URL <Required />
              </label>
              <input
                id="course-video"
                type="url"
                value={form.videoUrl}
                onChange={(event) => update("videoUrl", event.target.value)}
                placeholder="https://…"
                aria-invalid={showVideoError}
                className={inputClass}
              />
              {showVideoError && (
                <p className={errorTextClass}>Must start with https://</p>
              )}
            </div>

            <fieldset>
              <legend className={labelClass}>
                Topics <Required />
              </legend>
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
              <p className={helpTextClass}>
                Pick at least one. These match the topics interviews are scored
                against.
              </p>
            </fieldset>

            <div className="flex flex-col-reverse gap-3 border-t border-line-soft pt-5 sm:flex-row sm:justify-end">
              {editingId && (
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={!isValid || isSaving}
                loading={isSaving}
              >
                {isSaving
                  ? "Saving…"
                  : editingId
                    ? "Save changes"
                    : "Publish course"}
              </Button>
            </div>
          </form>
        </Card>

        {/* ---- library ---- */}
        <section aria-label="Your courses" className="min-w-0 space-y-4 xl:col-span-3">
          {courses.isLoading ? (
            <div
              role="status"
              aria-label="Loading courses…"
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : courses.error ? (
            <ErrorBlock message={courses.error} onRetry={courses.reload} />
          ) : list.length === 0 ? (
            <EmptyState
              icon={<GraduationCap />}
              title="No courses yet."
              description="Publish one and it appears in every candidate's Learning tab."
            />
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-base font-semibold text-ink">Your courses</h2>
                <span className="text-sm text-muted tabular-nums">
                  {list.length} course{list.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {list.map((course) => {
                  const isEditing = editingId === course._id;
                  return (
                    <article
                      key={course._id}
                      className={`flex min-w-0 flex-col rounded-xl border bg-surface p-5 shadow-xs transition-colors ${
                        isEditing
                          ? "border-brand-300 ring-2 ring-brand-500/20"
                          : "border-line hover:border-brand-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
                        >
                          <CirclePlay className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-ink">
                            {course.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-muted">
                            Added {formatDate(course.createdAt)}
                          </p>
                        </div>
                        {!course.isActive && (
                          <Badge tone="neutral" title="Hidden from candidates">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      {!course.isActive && (
                        <span className="sr-only">Hidden from candidates.</span>
                      )}

                      <p className="mt-4 line-clamp-3 whitespace-pre-line text-sm text-muted">
                        {course.description}
                      </p>
                      <div className="mt-4 flex-1">
                        <SkillChips
                          skills={course.topics.map(topicLabel)}
                          tone="gray"
                        />
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line-soft pt-4">
                        <a
                          href={course.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mr-auto inline-flex h-8 items-center gap-1.5 rounded-lg text-sm font-medium text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          Open video
                          <ExternalLink aria-hidden="true" className="h-4 w-4" />
                        </a>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEditing(course)}
                          disabled={busyId === course._id}
                          leadingIcon={<Pencil aria-hidden="true" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger-soft"
                          size="sm"
                          onClick={() => handleDelete(course)}
                          disabled={busyId === course._id}
                          loading={busyId === course._id}
                          leadingIcon={<Trash2 aria-hidden="true" />}
                        >
                          {busyId === course._id ? "Deleting…" : "Delete"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </PortalPage>
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
      <p className="mb-2 text-xs font-medium text-muted">{heading}</p>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => {
          const isOn = selected.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(topic)}
              className={`inline-flex min-h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isOn
                  ? "border-brand-700 bg-brand-700 text-white hover:bg-brand-800"
                  : "border-line bg-white text-body hover:border-brand-200 hover:bg-brand-50"
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
