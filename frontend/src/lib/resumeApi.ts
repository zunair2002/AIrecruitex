/** `/api/resume` — candidate/resume/routes/resume.routes.ts */
import { apiRequest } from "./api";
import type { MyResume, ResumeUploadResult } from "./types";

/** The multer field name the backend's `uploadResumeFile` expects. */
export const RESUME_FILE_FIELD = "resume";

/** upload.middleware.ts: 5MB cap, PDF or DOCX only. */
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const RESUME_ACCEPT_ATTRIBUTE = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * POST /api/resume/upload — multipart. Uploading again overwrites the previous
 * resume (the model has a unique index on `userId`).
 *
 * The response is just the file link and parse status: extracted text and
 * detected skills are no longer stored, they're re-derived when matching runs.
 */
export function uploadResume(
  file: File,
  token: string | null,
): Promise<ResumeUploadResult> {
  const formData = new FormData();
  formData.append(RESUME_FILE_FIELD, file);
  return apiRequest<ResumeUploadResult>("/api/resume/upload", {
    method: "POST",
    formData,
    token,
  });
}

/** GET /api/resume/mine — the resume on file, or null if none uploaded yet. */
export function getMyResume(
  token: string | null,
  signal?: AbortSignal,
): Promise<MyResume> {
  return apiRequest<MyResume>("/api/resume/mine", { token, signal });
}
