"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Archive,
  ArrowUpRight,
  BookmarkPlus,
  BookOpen,
  Check,
  Heart,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  EmptyState,
  ErrorBlock,
  InlineError,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { compactInputClass } from "@/components/ui/controls";
import { listActiveLearningCourses } from "@/lib/learningApi";
import { useApiResource } from "@/lib/useApiResource";

const EMPTY_COURSES: Awaited<ReturnType<typeof listActiveLearningCourses>> = [];
const EMPTY_PREFERENCES: LearningPreferences = {
  likedCourseIds: [],
  archivedCourseIds: [],
  playlists: [],
};
const PREFERENCES_STORAGE_PREFIX = "airecruitx_learning_preferences";

type LearningPlaylist = {
  id: string;
  name: string;
  courseIds: string[];
};

type LearningPreferences = {
  likedCourseIds: string[];
  archivedCourseIds: string[];
  playlists: LearningPlaylist[];
};

type LibraryView = "all" | "liked" | "archived" | "playlists";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isLearningPlaylist(value: unknown): value is LearningPlaylist {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isStringArray(value.courseIds)
  );
}

function parseLearningPreferences(value: unknown): LearningPreferences | null {
  if (
    !isRecord(value) ||
    !isStringArray(value.likedCourseIds) ||
    !isStringArray(value.archivedCourseIds) ||
    !Array.isArray(value.playlists)
  ) {
    return null;
  }
  return {
    likedCourseIds: value.likedCourseIds,
    archivedCourseIds: value.archivedCourseIds,
    playlists: value.playlists.filter(isLearningPlaylist),
  };
}

function topicLabel(topicId: string): string {
  return topicId
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function youtubeEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.toLowerCase();
    let videoId: string | null = null;

    if (host === "youtu.be" || host === "www.youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com" ||
      host === "www.youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else {
        const parts = url.pathname.split("/").filter(Boolean);
        const markerIndex = parts.findIndex((part) =>
          ["embed", "shorts", "live"].includes(part),
        );
        if (markerIndex >= 0) videoId = parts[markerIndex + 1] ?? null;
      }
    }

    if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export function CandidateLearningLibrary() {
  const { token, user } = useAuth();
  const courses = useApiResource(
    (signal) => listActiveLearningCourses(token, signal),
    [token],
    { enabled: Boolean(token) },
  );
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [libraryView, setLibraryView] = useState<LibraryView>("all");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  );
  const [preferences, setPreferences] =
    useState<LearningPreferences>(EMPTY_PREFERENCES);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(
    null,
  );
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [playlistDraft, setPlaylistDraft] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(
    null,
  );
  const [showPlaylistCoursePicker, setShowPlaylistCoursePicker] =
    useState(false);
  const [playlistCourseSearch, setPlaylistCourseSearch] = useState("");

  const courseList = courses.data ?? EMPTY_COURSES;
  const storageKey = user?.id
    ? `${PREFERENCES_STORAGE_PREFIX}:${user.id}`
    : null;

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
    if (!storageKey) {
      setPreferences(EMPTY_PREFERENCES);
      setHydratedStorageKey(null);
      setPreferencesError(null);
      return;
    }

    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) {
        setPreferences(EMPTY_PREFERENCES);
      } else {
        setPreferences(
          parseLearningPreferences(JSON.parse(saved)) ?? EMPTY_PREFERENCES,
        );
      }
      setPreferencesError(null);
    } catch {
      setPreferences(EMPTY_PREFERENCES);
      setPreferencesError(
        "Your saved learning preferences could not be read from this browser.",
      );
    }
    setHydratedStorageKey(storageKey);
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || hydratedStorageKey !== storageKey) return;
    Promise.resolve().then(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(preferences));
        setPreferencesError(null);
      } catch {
        setPreferencesError(
          "Could not save your learning preferences. Check your browser storage settings.",
        );
      }
    });
  }, [hydratedStorageKey, preferences, storageKey]);

  const topics = useMemo(
    () => Array.from(new Set(courseList.flatMap((course) => course.topics))).sort(),
    [courseList],
  );
  const selectedPlaylist =
    preferences.playlists.find(
      (playlist) => playlist.id === selectedPlaylistId,
    ) ?? null;
  const coursesToAddToPlaylist = useMemo(() => {
    if (!selectedPlaylist) return [];
    const query = playlistCourseSearch.trim().toLowerCase();
    return courseList.filter(
      (course) =>
        !preferences.archivedCourseIds.includes(course._id) &&
        !selectedPlaylist.courseIds.includes(course._id) &&
        (!query ||
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.topics.some((topic) =>
            topicLabel(topic).toLowerCase().includes(query),
          )),
    );
  }, [
    courseList,
    playlistCourseSearch,
    preferences.archivedCourseIds,
    selectedPlaylist,
  ]);
  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courseList.filter((course) => {
      const matchesTopic =
        topicFilter === "all" || course.topics.includes(topicFilter);
      const isArchived = preferences.archivedCourseIds.includes(course._id);
      const matchesView =
        libraryView === "liked"
          ? preferences.likedCourseIds.includes(course._id) && !isArchived
          : libraryView === "archived"
            ? isArchived
            : libraryView === "playlists"
              ? Boolean(
                  selectedPlaylist?.courseIds.includes(course._id) &&
                    !isArchived,
                )
              : !isArchived;
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.topics.some((topic) => topicLabel(topic).toLowerCase().includes(query));
      return matchesTopic && matchesSearch && matchesView;
    });
  }, [
    courseList,
    libraryView,
    preferences.archivedCourseIds,
    preferences.likedCourseIds,
    search,
    selectedPlaylist,
    topicFilter,
  ]);

  const toggleCoursePreference = (
    key: "likedCourseIds" | "archivedCourseIds",
    courseId: string,
  ) => {
    setPreferences((current) => {
      const hasCourse = current[key].includes(courseId);
      return {
        ...current,
        [key]: hasCourse
          ? current[key].filter((id) => id !== courseId)
          : [...current[key], courseId],
      };
    });
  };

  const savePlaylist = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = playlistDraft.trim();
    if (!name) return;

    if (editingPlaylistId) {
      setPreferences((current) => ({
        ...current,
        playlists: current.playlists.map((playlist) =>
          playlist.id === editingPlaylistId ? { ...playlist, name } : playlist,
        ),
      }));
    } else {
      const id = crypto.randomUUID();
      setPreferences((current) => ({
        ...current,
        playlists: [...current.playlists, { id, name, courseIds: [] }],
      }));
      setSelectedPlaylistId(id);
      setLibraryView("playlists");
      setShowPlaylistCoursePicker(true);
    }
    setPlaylistDraft("");
    setEditingPlaylistId(null);
  };

  const startEditingPlaylist = (playlist: LearningPlaylist) => {
    setEditingPlaylistId(playlist.id);
    setPlaylistDraft(playlist.name);
  };

  const deletePlaylist = (playlist: LearningPlaylist) => {
    if (!window.confirm(`Delete the "${playlist.name}" playlist?`)) return;
    setPreferences((current) => ({
      ...current,
      playlists: current.playlists.filter((item) => item.id !== playlist.id),
    }));
    if (selectedPlaylistId === playlist.id) setSelectedPlaylistId(null);
    if (editingPlaylistId === playlist.id) {
      setEditingPlaylistId(null);
      setPlaylistDraft("");
    }
  };

  const togglePlaylistCourse = (playlistId: string, courseId: string) => {
    setPreferences((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        const containsCourse = playlist.courseIds.includes(courseId);
        return {
          ...playlist,
          courseIds: containsCourse
            ? playlist.courseIds.filter((id) => id !== courseId)
            : [...playlist.courseIds, courseId],
        };
      }),
    }));
  };

  return (
    <div className="min-h-full bg-[#f7f8fa] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          title="E-learning"
          description="Explore courses and resources selected to help you prepare for interviews."
        />

        <section
          aria-label="Course library"
          className="overflow-hidden border border-[#e9eaf0] bg-white"
        >
          <div className="flex flex-col gap-3 border-b border-[#eeeeF2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center bg-[#f0efff] text-[#6b5ce7]">
                <BookOpen aria-hidden="true" className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-[#30323b]">
                  Learning library
                </h2>
                <p className="text-[11px] text-[#92949e]">
                  {courseList.length} available course
                  {courseList.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <span className="sr-only">Search courses</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#92949e]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search courses…"
                  className={`${compactInputClass} h-9 w-full pl-8 text-xs sm:w-52`}
                />
              </label>
              <label>
                <span className="sr-only">Filter by topic</span>
                <select
                  value={topicFilter}
                  onChange={(event) => setTopicFilter(event.target.value)}
                  className={`${compactInputClass} h-9 w-full text-xs sm:w-48`}
                >
                  <option value="all">All topics</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topicLabel(topic)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#eeeeF2] px-3 py-2.5 sm:px-5">
            {(
              [
                ["all", "All courses", courseList.length],
                [
                  "liked",
                  "Liked",
                  preferences.likedCourseIds.filter(
                    (id) => !preferences.archivedCourseIds.includes(id),
                  ).length,
                ],
                ["archived", "Archived", preferences.archivedCourseIds.length],
                ["playlists", "Playlists", preferences.playlists.length],
              ] as const
            ).map(([view, label, count]) => (
              <button
                key={view}
                type="button"
                onClick={() => setLibraryView(view)}
                aria-pressed={libraryView === view}
                className={`inline-flex h-7 items-center gap-1.5 border px-2.5 text-[10px] font-medium transition-colors ${
                  libraryView === view
                    ? "border-[#d8d5f7] bg-[#f0efff] text-[#5f53ce]"
                    : "border-transparent text-[#777a85] hover:bg-[#f7f7fa]"
                }`}
              >
                {view === "liked" ? (
                  <Heart aria-hidden="true" className="h-3 w-3" />
                ) : view === "archived" ? (
                  <Archive aria-hidden="true" className="h-3 w-3" />
                ) : view === "playlists" ? (
                  <BookmarkPlus aria-hidden="true" className="h-3 w-3" />
                ) : null}
                {label}
                <span className="text-[9px] opacity-70">{count}</span>
              </button>
            ))}
          </div>

          {libraryView === "playlists" && (
            <div className="space-y-3 border-b border-[#eeeeF2] bg-[#fcfcfd] p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                {preferences.playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className={`inline-flex items-center border text-[10px] ${
                      selectedPlaylistId === playlist.id
                        ? "border-[#d8d5f7] bg-[#f0efff] text-[#5f53ce]"
                        : "border-[#ececf1] bg-white text-[#666974]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlaylistId(playlist.id);
                        setEditingPlaylistId(null);
                        setPlaylistDraft("");
                        setShowPlaylistCoursePicker(false);
                        setPlaylistCourseSearch("");
                      }}
                      className="px-2.5 py-1.5 font-medium"
                    >
                      {playlist.name} ({playlist.courseIds.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditingPlaylist(playlist)}
                      className="border-l border-inherit px-2 py-1.5 hover:bg-white/70"
                      aria-label={`Rename ${playlist.name}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePlaylist(playlist)}
                      className="border-l border-inherit px-1.5 py-1.5 text-[#a34c4c] hover:bg-red-50"
                      aria-label={`Delete ${playlist.name}`}
                    >
                      <Trash2 aria-hidden="true" className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <form
                onSubmit={savePlaylist}
                className="flex max-w-lg flex-wrap gap-2"
              >
                <label className="sr-only" htmlFor="learning-playlist-name">
                  {editingPlaylistId ? "Rename playlist" : "New playlist name"}
                </label>
                <input
                  id="learning-playlist-name"
                  value={playlistDraft}
                  onChange={(event) => setPlaylistDraft(event.target.value)}
                  maxLength={60}
                  placeholder={
                    editingPlaylistId ? "Rename playlist…" : "New playlist name…"
                  }
                  className={`${compactInputClass} h-8 min-w-[180px] flex-1 text-[10px]`}
                  required
                />
                <button
                  type="submit"
                  disabled={!playlistDraft.trim()}
                  className="inline-flex h-8 items-center gap-1 bg-[#6b5ce7] px-2.5 text-[10px] font-semibold text-white hover:bg-[#5849d1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editingPlaylistId ? (
                    <Check aria-hidden="true" className="h-3 w-3" />
                  ) : (
                    <Plus aria-hidden="true" className="h-3 w-3" />
                  )}
                  {editingPlaylistId ? "Save name" : "Create playlist"}
                </button>
                {editingPlaylistId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlaylistId(null);
                      setPlaylistDraft("");
                    }}
                    className="h-8 border border-[#e9eaf0] bg-white px-2.5 text-[10px] text-[#666974]"
                  >
                    Cancel
                  </button>
                )}
              </form>
              {preferences.playlists.length > 0 && !selectedPlaylist && (
                <p className="text-[10px] text-[#777a85]">
                  Select a playlist to view and organize its courses.
                </p>
              )}
              {selectedPlaylist && (
                <div className="border-t border-[#eeeeF2] pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold text-[#454752]">
                        Organizing: {selectedPlaylist.name}
                      </p>
                      <p className="mt-0.5 text-[9px] text-[#92949e]">
                        Add any available course, or remove one from this
                        playlist.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setShowPlaylistCoursePicker((visible) => !visible)
                      }
                      className="inline-flex h-7 items-center gap-1 border border-[#d8d5f7] bg-white px-2.5 text-[9px] font-semibold text-[#5f53ce] hover:bg-[#f7f6ff]"
                    >
                      <Plus aria-hidden="true" className="h-3 w-3" />
                      {showPlaylistCoursePicker ? "Done adding" : "Add courses"}
                    </button>
                  </div>
                  {showPlaylistCoursePicker && (
                    <div className="mt-3 space-y-2 border border-[#ececf1] bg-white p-2.5">
                      <label className="relative block max-w-sm">
                        <span className="sr-only">
                          Search available courses to add
                        </span>
                        <Search
                          aria-hidden="true"
                          className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#92949e]"
                        />
                        <input
                          type="search"
                          value={playlistCourseSearch}
                          onChange={(event) =>
                            setPlaylistCourseSearch(event.target.value)
                          }
                          placeholder="Find courses to add…"
                          className={`${compactInputClass} h-7 w-full pl-7 text-[9px]`}
                        />
                      </label>
                      {coursesToAddToPlaylist.length > 0 ? (
                        <div className="max-h-44 divide-y divide-[#f1f1f4] overflow-y-auto">
                          {coursesToAddToPlaylist.map((course) => (
                            <div
                              key={course._id}
                              className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-[10px] font-medium text-[#454752]">
                                  {course.title}
                                </p>
                                <p className="truncate text-[9px] text-[#92949e]">
                                  {course.topics.map(topicLabel).join(" · ")}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  togglePlaylistCourse(
                                    selectedPlaylist.id,
                                    course._id,
                                  )
                                }
                                className="inline-flex h-6 shrink-0 items-center gap-1 border border-[#d8d5f7] px-2 text-[9px] font-semibold text-[#5f53ce] hover:bg-[#f0efff]"
                              >
                                <Plus aria-hidden="true" className="h-3 w-3" />
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-2 text-[9px] text-[#92949e]">
                          {courseList.length === 0
                            ? "No courses are available yet."
                            : "No available courses match your search."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {preferencesError && (
            <div className="p-3 sm:px-5">
              <InlineError message={preferencesError} />
            </div>
          )}

          {courses.isLoading ? (
            <LoadingBlock label="Loading courses…" />
          ) : courses.error ? (
            <div className="p-4 sm:p-5">
              <ErrorBlock message={courses.error} onRetry={courses.reload} />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-4 sm:p-5">
              <EmptyState
                title={
                  libraryView === "playlists" && !selectedPlaylist
                    ? "Create or select a playlist."
                    : courseList.length === 0
                      ? "No learning courses available yet."
                      : libraryView === "liked"
                        ? "No liked courses yet."
                        : libraryView === "archived"
                          ? "No archived courses."
                          : libraryView === "playlists"
                            ? "This playlist has no courses yet."
                            : "No courses match your filters."
                }
                description={
                  courseList.length === 0
                    ? "New resources added by your hiring team will appear here."
                    : libraryView === "playlists" && selectedPlaylist
                      ? "Add courses to this playlist from All courses."
                      : libraryView === "liked"
                        ? "Use the heart button on a course to save it here."
                        : libraryView === "archived"
                          ? "Archived courses will appear here."
                          : "Try another search or choose a different topic."
                }
              />
            </div>
          ) : (
            <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
              {filteredCourses.map((course) => {
                const embedUrl = youtubeEmbedUrl(course.videoUrl);
                return (
                  <article
                    key={course._id}
                    className="flex min-w-0 flex-col overflow-hidden border border-[#ececf1] bg-white transition-shadow hover:shadow-sm"
                  >
                    {embedUrl ? (
                      <div className="aspect-video w-full bg-[#f3f4f6]">
                        <iframe
                          src={embedUrl}
                          title={course.title}
                          className="h-full w-full"
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={course.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex aspect-video items-center justify-center bg-[#f4f3ff] text-[#6658d9] transition-colors hover:bg-[#eeecff]"
                        aria-label={`Open learning resource: ${course.title}`}
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-105">
                          <Play aria-hidden="true" className="ml-0.5 h-5 w-5" />
                        </span>
                      </a>
                    )}

                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.07em] text-[#777a85]">
                          <BookOpen aria-hidden="true" className="h-3 w-3" />
                          Learning resource
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              toggleCoursePreference(
                                "likedCourseIds",
                                course._id,
                              )
                            }
                            aria-pressed={preferences.likedCourseIds.includes(
                              course._id,
                            )}
                            aria-label={
                              preferences.likedCourseIds.includes(course._id)
                                ? `Unlike ${course.title}`
                                : `Like ${course.title}`
                            }
                            title={
                              preferences.likedCourseIds.includes(course._id)
                                ? "Remove from liked"
                                : "Add to liked"
                            }
                            className={`flex h-7 w-7 items-center justify-center border transition-colors ${
                              preferences.likedCourseIds.includes(course._id)
                                ? "border-rose-100 bg-rose-50 text-rose-600"
                                : "border-[#ececf1] text-[#858793] hover:border-rose-100 hover:text-rose-500"
                            }`}
                          >
                            <Heart
                              aria-hidden="true"
                              className="h-3.5 w-3.5"
                              fill={
                                preferences.likedCourseIds.includes(course._id)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              toggleCoursePreference(
                                "archivedCourseIds",
                                course._id,
                              )
                            }
                            aria-label={
                              preferences.archivedCourseIds.includes(course._id)
                                ? `Restore ${course.title} from archive`
                                : `Archive ${course.title}`
                            }
                            title={
                              preferences.archivedCourseIds.includes(course._id)
                                ? "Restore from archive"
                                : "Archive course"
                            }
                            className="flex h-7 w-7 items-center justify-center border border-[#ececf1] text-[#858793] transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                          >
                            {preferences.archivedCourseIds.includes(
                              course._id,
                            ) ? (
                              <BookOpen
                                aria-hidden="true"
                                className="h-3.5 w-3.5"
                              />
                            ) : (
                              <Archive
                                aria-hidden="true"
                                className="h-3.5 w-3.5"
                              />
                            )}
                          </button>
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold leading-5 text-[#30323b]">
                        {course.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 whitespace-pre-line text-xs leading-5 text-[#70727d]">
                        {course.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {course.topics.map((topic) => (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => setTopicFilter(topic)}
                            className="border border-[#ececf1] bg-[#fafafe] px-2 py-1 text-[9px] font-medium text-[#686b77] transition-colors hover:border-[#d8d5f7] hover:text-[#5f53ce]"
                            aria-label={`Filter courses by ${topicLabel(topic)}`}
                          >
                            {topicLabel(topic)}
                          </button>
                        ))}
                      </div>
                      {libraryView === "playlists" && selectedPlaylist ? (
                        <button
                          type="button"
                          onClick={() =>
                            togglePlaylistCourse(
                              selectedPlaylist.id,
                              course._id,
                            )
                          }
                          className="mt-3 inline-flex items-center gap-1 self-start text-[10px] font-medium text-[#777a85] hover:text-[#5f53ce]"
                        >
                          <Trash2 aria-hidden="true" className="h-3 w-3" />
                          Remove from playlist
                        </button>
                      ) : preferences.playlists.length > 0 ? (
                        <label className="mt-3 flex items-center gap-1.5 text-[9px] text-[#777a85]">
                          <BookmarkPlus
                            aria-hidden="true"
                            className="h-3 w-3"
                          />
                          <span className="sr-only">
                            Add {course.title} to playlist
                          </span>
                          <select
                            value=""
                            onChange={(event) => {
                              if (event.target.value) {
                                togglePlaylistCourse(
                                  event.target.value,
                                  course._id,
                                );
                              }
                            }}
                            className="max-w-[200px] border-0 bg-transparent py-1 text-[9px] text-[#666974] outline-none focus:ring-1 focus:ring-[#d8d5f7]"
                          >
                            <option value="">Add to playlist…</option>
                            {preferences.playlists.map((playlist) => (
                              <option
                                key={playlist.id}
                                value={playlist.id}
                                disabled={playlist.courseIds.includes(
                                  course._id,
                                )}
                              >
                                {playlist.courseIds.includes(course._id)
                                  ? `Added: ${playlist.name}`
                                  : playlist.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      {!embedUrl && (
                        <a
                          href={course.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-1 self-start text-[11px] font-semibold text-[#6658d9] hover:text-[#5143c3]"
                        >
                          Open course
                          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}