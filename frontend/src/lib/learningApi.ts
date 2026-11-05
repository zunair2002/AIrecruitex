import { apiRequest } from "./api";
import type { ObjectId } from "./types";

/** Mirrors the Course document returned by the backend learning routes. */
export type LearningCourse = {
  _id: ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  topics: string[];
  isActive: boolean;
  createdBy: ObjectId;
  createdAt: string;
  updatedAt: string;
};

/** Writable fields accepted by POST /api/learning/courses and PUT by id. */
export type LearningCourseInput = Pick<
  LearningCourse,
  "title" | "description" | "videoUrl" | "topics"
>;

/** GET /api/learning/courses/hr — all courses, newest first; HR only. */
export function listHrLearningCourses(
  token: string | null,
  signal?: AbortSignal,
): Promise<LearningCourse[]> {
  return apiRequest<LearningCourse[]>("/api/learning/courses/hr", {
    token,
    signal,
  });
}

/** GET /api/learning/courses — active courses only; candidate access. */
export function listActiveLearningCourses(
  token: string | null,
  signal?: AbortSignal,
): Promise<LearningCourse[]> {
  return apiRequest<LearningCourse[]>("/api/learning/courses", {
    token,
    signal,
  });
}

/** POST /api/learning/courses — creates an active course owned by this HR. */
export function createLearningCourse(
  input: LearningCourseInput,
  token: string | null,
): Promise<LearningCourse> {
  return apiRequest<LearningCourse>("/api/learning/courses", {
    method: "POST",
    body: input,
    token,
  });
}

/** PUT /api/learning/courses/:courseId — updates the writable course fields. */
export function updateLearningCourse(
  courseId: ObjectId,
  input: LearningCourseInput,
  token: string | null,
): Promise<LearningCourse> {
  return apiRequest<LearningCourse>(`/api/learning/courses/${courseId}`, {
    method: "PUT",
    body: input,
    token,
  });
}

/** DELETE /api/learning/courses/:courseId. */
export function deleteLearningCourse(
  courseId: ObjectId,
  token: string | null,
): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(
    `/api/learning/courses/${courseId}`,
    { method: "DELETE", token },
  );
}