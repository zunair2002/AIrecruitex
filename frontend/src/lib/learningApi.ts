/**
 * `/api/learning` — candidate/learning/routes/learning.routes.ts
 *
 * HR authors courses; candidates see only the active ones. Both the topic
 * vocabulary and the HTTPS requirement on `videoUrl` are enforced server-side,
 * so the UI mirrors them rather than inventing its own rules.
 */
import { apiRequest } from "./api";
import type { Course, CourseInput, ObjectId } from "./types";

/** GET /api/learning/courses — candidate only; active courses, newest first. */
export function listActiveCourses(
  token: string | null,
  signal?: AbortSignal,
): Promise<Course[]> {
  return apiRequest<Course[]>("/api/learning/courses", { token, signal });
}

/** GET /api/learning/courses/hr — HR only; every course including inactive. */
export function listHrCourses(
  token: string | null,
  signal?: AbortSignal,
): Promise<Course[]> {
  return apiRequest<Course[]>("/api/learning/courses/hr", { token, signal });
}

/** POST /api/learning/courses — HR only. */
export function createCourse(
  input: CourseInput,
  token: string | null,
): Promise<Course> {
  return apiRequest<Course>("/api/learning/courses", {
    method: "POST",
    body: input,
    token,
  });
}

/** PUT /api/learning/courses/:courseId — HR only; replaces all four fields. */
export function updateCourse(
  courseId: ObjectId,
  input: CourseInput,
  token: string | null,
): Promise<Course> {
  return apiRequest<Course>(`/api/learning/courses/${courseId}`, {
    method: "PUT",
    body: input,
    token,
  });
}

/** DELETE /api/learning/courses/:courseId — HR only. */
export function deleteCourse(
  courseId: ObjectId,
  token: string | null,
): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(
    `/api/learning/courses/${courseId}`,
    { method: "DELETE", token },
  );
}
