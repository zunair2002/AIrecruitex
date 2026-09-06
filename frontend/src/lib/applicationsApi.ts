/**
 * `/api/applications` — served by two routers mounted on the same prefix:
 *   candidate/applications/routes/application.routes.ts (POST /:jobId/apply, GET /mine)
 *   hr/applicant-review/routes/applicant-review.routes.ts (the rest)
 */
import { apiRequest } from "./api";
import type {
  Application,
  ApplicationReport,
  ApplicationStatus,
  ObjectId,
} from "./types";

/* ----------------------------------------------------------- candidate */

/**
 * POST /api/applications/:jobId/apply — candidate only.
 * Requires an uploaded resume (400 otherwise) and 409s on a repeat apply.
 * The backend computes `matchScore` from the job's `requiredSkills` against
 * the resume text and sets `matched` from the admin `matchThreshold` setting.
 */
export function applyToJob(
  jobId: ObjectId,
  token: string | null,
): Promise<Application> {
  return apiRequest<Application>(`/api/applications/${jobId}/apply`, {
    method: "POST",
    token,
  });
}

/** GET /api/applications/mine — candidate's applications, `jobId` populated. */
export function listMyApplications(
  token: string | null,
  signal?: AbortSignal,
): Promise<Application[]> {
  return apiRequest<Application[]>("/api/applications/mine", { token, signal });
}

/* ------------------------------------------------------------------ HR */

/** GET /api/applications/job/:jobId — all applicants, best match first. */
export function listApplicationsForJob(
  jobId: ObjectId,
  token: string | null,
  signal?: AbortSignal,
): Promise<Application[]> {
  return apiRequest<Application[]>(`/api/applications/job/${jobId}`, {
    token,
    signal,
  });
}

/** GET /api/applications/job/:jobId/matched — only `matched: true` applicants. */
export function listMatchedApplicationsForJob(
  jobId: ObjectId,
  token: string | null,
  signal?: AbortSignal,
): Promise<Application[]> {
  return apiRequest<Application[]>(`/api/applications/job/${jobId}/matched`, {
    token,
    signal,
  });
}

/** GET /api/applications/:applicationId/report — application + AI session. */
export function getApplicationReport(
  applicationId: ObjectId,
  token: string | null,
  signal?: AbortSignal,
): Promise<ApplicationReport> {
  return apiRequest<ApplicationReport>(
    `/api/applications/${applicationId}/report`,
    { token, signal },
  );
}

/** PATCH /api/applications/:applicationId/status — pending|selected|rejected. */
export function updateApplicationStatus(
  applicationId: ObjectId,
  status: ApplicationStatus,
  token: string | null,
): Promise<Application> {
  return apiRequest<Application>(
    `/api/applications/${applicationId}/status`,
    { method: "PATCH", body: { status }, token },
  );
}

/**
 * POST /api/applications/:applicationId/ai-interview — matched applicants only.
 * Creates the real interview session and returns a Google Calendar link.
 */
export function scheduleAiInterview(
  applicationId: ObjectId,
  input: { dateTime: string; message?: string },
  token: string | null,
): Promise<Application> {
  return apiRequest<Application>(
    `/api/applications/${applicationId}/ai-interview`,
    { method: "POST", body: input, token },
  );
}

/**
 * POST /api/applications/:applicationId/org-interview — the backend rejects
 * this unless the application's status is already `selected`.
 */
export function scheduleOrgInterview(
  applicationId: ObjectId,
  input: { dateTime: string; location?: string; notes?: string },
  token: string | null,
): Promise<Application> {
  return apiRequest<Application>(
    `/api/applications/${applicationId}/org-interview`,
    { method: "POST", body: input, token },
  );
}
