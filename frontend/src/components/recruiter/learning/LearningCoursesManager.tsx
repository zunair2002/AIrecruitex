"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  createLearningCourse,
  deleteLearningCourse,
  listHrLearningCourses,
  updateLearningCourse,
  type LearningCourse,
  type LearningCourseInput,
} from "@/lib/learningApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDate } from "@/lib/format";
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import {
  compactInputClass,
  dangerButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  smallButtonClass,
} from "@/components/ui/controls";

const COURSE_TOPICS = [
  { id: "dsa", label: "Data structures & algorithms" },
  { id: "oop", label: "Object-oriented programming" },
  { id: "dbms", label: "Databases" },
  { id: "os", label: "Operating systems" },
  { id: "networks", label: "Computer networks" },
  { id: "web", label: "Web development" },
  { id: "programming", label: "Programming" },
  { id: "software_engineering", label: "Software engineering" },
  { id: "cloud_devops", label: "Cloud & DevOps" },
  { id: "security", label: "Security" },
  { id: "ai_ml", label: "AI & machine learning" },
  { id: "architecture", label: "Software architecture" },
  { id: "big_data", label: "Big data" },
  { id: "emerging_tech", label: "Emerging technology" },
  { id: "system_design", label: "System design" },
  { id: "general_cs", label: "General computer science" },
  { id: "self_introduction", label: "Self introduction" },
  { id: "strengths_weaknesses", label: "Strengths & weaknesses" },
  { id: "pressure_time_management", label: "Pressure & time management" },
  { id: "education_projects", label: "Education & projects" },
  { id: "adaptability", label: "Adaptability" },
  { id: "career_goals", label: "Career goals" },
  { id: "conflict_resolution", label: "Conflict resolution" },
  { id: "culture_fit", label: "Culture fit" },
  { id: "leadership", label: "Leadership" },
  { id: "motivation", label: "Motivation" },
  { id: "team_collaboration", label: "Team collaboration" },
  { id: "work_style", label: "Work style" },
] as const;

type TopicId = (typeof COURSE_TOPICS)[number]["id"];
const EMPTY_COURSES: LearningCourse[] = [];

const EMPTY_DRAFT: LearningCourseInput = {
  title: "",
  description: "",
  videoUrl: "",
  topics: [],
};

function topicLabel(topicId: string): string {
  return (
    COURSE_TOPICS.find((topic) => topic.id === topicId)?.label ??
    topicId.replace(/_/g, " ")
  );
}

export function LearningCoursesManager() {
  const { token } = useAuth();
  const courses = useApiResource(
    (signal) => listHrLearningCourses(token, signal),
    [token],
    { enabled: Boolean(token) },
  );
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<LearningCourse | null>(
    null,
  );
  const [draft, setDraft] = useState<LearningCourseInput>(EMPTY_DRAFT);
  const [formError, setFormError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const courseList = courses.data ?? EMPTY_COURSES;
  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courseList;
    return courseList.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.topics.some((topic) => topicLabel(topic).toLowerCase().includes(query)),
    );
  }, [courseList, search]);

  const openCreateForm = () => {
    setEditingCourse(null);
    setDraft({ ...EMPTY_DRAFT });
    setFormError(null);
    setMutationError(null);
    setNotice(null);
    setIsFormOpen(true);
  };

  const openEditForm = (course: LearningCourse) => {
    setEditingCourse(course);
    setDraft({
      title: course.title,
      description: course.description,
      videoUrl: course.videoUrl,
      topics: [...course.topics],
    });
    setFormError(null);
    setMutationError(null);
    setNotice(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
    setDraft({ ...EMPTY_DRAFT });
    setFormError(null);
  };

  const toggleTopic = (topicId: TopicId) => {
    setDraft((current) => ({
      ...current,
      topics: current.topics.includes(topicId)
        ? current.topics.filter((topic) => topic !== topicId)
        : [...current.topics, topicId],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setMutationError(null);
    setNotice(null);

    let parsedVideoUrl: URL;
    try {
      parsedVideoUrl = new URL(draft.videoUrl.trim());
    } catch {
      setFormError("Enter a valid HTTPS video or course URL.");
      return;
    }

    if (parsedVideoUrl.protocol !== "https:") {
      setFormError("The video or course URL must use HTTPS.");
      return;
    }
    if (draft.topics.length === 0) {
      setFormError("Select at least one topic for this course.");
      return;
    }

    const input: LearningCourseInput = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      videoUrl: draft.videoUrl.trim(),
      topics: draft.topics,
    };

    setIsSaving(true);
    try {
      if (editingCourse) {
        await updateLearningCourse(editingCourse._id, input, token);
        setNotice("Course updated.");
      } else {
        await createLearningCourse(input, token);
        setNotice("Course created and made available to candidates.");
      }
      closeForm();
      courses.reload();
    } catch (error) {
      setFormError(toErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (course: LearningCourse) => {
    if (
      !window.confirm(
        `Delete "${course.title}"? This will remove it from the candidate learning library.`,
      )
    ) {
      return;
    }

    setDeletingId(course._id);
    setMutationError(null);
    setNotice(null);
    try {
      await deleteLearningCourse(course._id, token);
      if (editingCourse?._id === course._id) closeForm();
      setNotice("Course deleted.");
      courses.reload();
    } catch (error) {
      setMutationError(toErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-5 sm:p-8">
      <PageHeader
        title="E-learning"
        description="Create and manage learning resources available to candidates."
        action={
          <button
            type="button"
            onClick={isFormOpen ? closeForm : openCreateForm}
            className={`${isFormOpen ? secondaryButtonClass : primaryButtonClass} shrink-0 text-sm`}
          >
            {isFormOpen ? "Cancel" : "Add course"}
          </button>
        }
      />

      {notice && (
        <div className="mb-5">
          <InlineSuccess message={notice} />
        </div>
      )}
      {mutationError && (
        <div className="mb-5">
          <InlineError message={mutationError} />
        </div>
      )}

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-5 rounded-2xl border border-gray-100 bg-white p-5 sm:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingCourse ? "Edit course" : "Add a learning course"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Add a secure course link and select the interview topics it
                supports.
              </p>
            </div>
          </div>

          {formError && <InlineError message={formError} />}

          <div>
            <label htmlFor="learning-course-title" className={labelClass}>
              Course title
            </label>
            <input
              id="learning-course-title"
              type="text"
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              maxLength={120}
              className={inputClass}
              placeholder="e.g. JavaScript fundamentals"
              required
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {draft.title.length}/120
            </p>
          </div>

          <div>
            <label htmlFor="learning-course-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="learning-course-description"
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              maxLength={1000}
              rows={4}
              className={`${inputClass} resize-y`}
              placeholder="Explain what candidates will learn from this resource."
              required
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {draft.description.length}/1000
            </p>
          </div>

          <div>
            <label htmlFor="learning-course-url" className={labelClass}>
              Video or course URL
            </label>
            <input
              id="learning-course-url"
              type="url"
              value={draft.videoUrl}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  videoUrl: event.target.value,
                }))
              }
              className={inputClass}
              placeholder="https://..."
              pattern="https://.*"
              title="Enter a URL that starts with https://"
              required
            />
            <p className="mt-1 text-xs text-gray-400">
              YouTube videos play inline; other links open in a new tab.
            </p>
          </div>

          <fieldset>
            <legend className={labelClass}>
              Topics <span className="text-red-500">*</span>
            </legend>
            <p className="mb-3 text-xs text-gray-500">
              Select one or more topics to help match this course to interview
              preparation.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {COURSE_TOPICS.map((topic) => (
                <label
                  key={topic.id}
                  className={`flex cursor-pointer items-center gap-2 border px-3 py-2 text-sm transition-colors ${
                    draft.topics.includes(topic.id)
                      ? "border-brand/40 bg-brand-light text-brand-dark"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={draft.topics.includes(topic.id)}
                    onChange={() => toggleTopic(topic.id)}
                    className="accent-brand"
                  />
                  {topic.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
            <button
              type="submit"
              disabled={
                isSaving ||
                !draft.title.trim() ||
                !draft.description.trim() ||
                !draft.videoUrl.trim() ||
                draft.topics.length === 0
              }
              className={`${primaryButtonClass} text-sm`}
            >
              {isSaving
                ? "Saving…"
                : editingCourse
                  ? "Save changes"
                  : "Create course"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={isSaving}
              className={`${secondaryButtonClass} text-sm`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="font-semibold text-gray-900">Course library</h2>
            <p className="mt-1 text-xs text-gray-500">
              {courseList.length} course{courseList.length === 1 ? "" : "s"} ·
              {" "}{courseList.filter((course) => course.isActive).length} active
            </p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses or topics…"
            aria-label="Search courses"
            className={`${compactInputClass} w-full sm:max-w-xs`}
          />
        </div>

        {courses.isLoading ? (
          <LoadingBlock label="Loading learning courses…" />
        ) : courses.error ? (
          <div className="p-4 sm:p-5">
            <ErrorBlock message={courses.error} onRetry={courses.reload} />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              title={courseList.length === 0 ? "No courses yet." : "No courses match your search."}
              description={
                courseList.length === 0
                  ? "Add a course to make learning resources available to candidates."
                  : undefined
              }
              action={
                courseList.length === 0 ? (
                  <button
                    type="button"
                    onClick={openCreateForm}
                    className={`${smallButtonClass} text-sm`}
                  >
                    Add first course
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCourses.map((course) => (
              <article
                key={course._id}
                className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        course.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                    {course.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {course.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-600"
                      >
                        {topicLabel(topic)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                    <a
                      href={course.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="max-w-full truncate font-medium text-brand hover:text-brand-dark"
                    >
                      Open course resource
                    </a>
                    <span>Added {formatDate(course.createdAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 lg:pt-0.5">
                  <button
                    type="button"
                    onClick={() => openEditForm(course)}
                    disabled={deletingId === course._id}
                    className={smallButtonClass}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(course)}
                    disabled={deletingId === course._id}
                    className={dangerButtonClass}
                  >
                    {deletingId === course._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}