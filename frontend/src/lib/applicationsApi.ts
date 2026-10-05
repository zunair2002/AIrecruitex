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
  InterviewSessionView,
  ObjectId,
  OrgInterviewInvite,
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
  minMatchScore?: number,
): Promise<Application[]> {
  return apiRequest<Application[]>(`/api/applications/job/${jobId}`, {
    query: { minMatchScore },
    token,
    signal,
  });
}

/** GET /api/applications/job/:jobId/matched — only `matched: true` applicants. */
export function listMatchedApplicationsForJob(
  jobId: ObjectId,
  token: string | null,
  signal?: AbortSignal,
  minMatchScore?: number,
): Promise<Application[]> {
  return apiRequest<Application[]>(`/api/applications/job/${jobId}/matched`, {
    query: { minMatchScore },
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
 * POST /api/applications/:applicationId/org-interview-invite
 *
 * Emails the candidate a token link to the organisational interview, valid for
 * `validityDays` (server default 2). The backend rejects this unless the
 * application's status is already `selected`.
 */
export function inviteToOrgInterview(
  applicationId: ObjectId,
  input: { validityDays?: number },
  token: string | null,
): Promise<Application> {
  return apiRequest<Application>(
    `/api/applications/${applicationId}/org-interview-invite`,
    { method: "POST", body: input, token },
  );
}

/* --------------------------------------------------------- HR bulk actions */

/** PATCH /api/applications/bulk/status */
export function bulkUpdateStatus(
  applicationIds: ObjectId[],
  status: ApplicationStatus,
  token: string | null,
): Promise<Application[]> {
  return apiRequest<Application[]>("/api/applications/bulk/status", {
    method: "PATCH",
    body: { applicationIds, status },
    token,
  });
}

/** POST /api/applications/bulk/ai-interview — matched applicants only. */
export function bulkTriggerAiInterview(
  applicationIds: ObjectId[],
  token: string | null,
): Promise<Application[]> {
  return apiRequest<Application[]>("/api/applications/bulk/ai-interview", {
    method: "POST",
    body: { applicationIds },
    token,
  });
}

/** POST /api/applications/bulk/org-interview-invite — selected applicants only. */
export function bulkInviteToOrgInterview(
  applicationIds: ObjectId[],
  input: { validityDays?: number },
  token: string | null,
): Promise<Application[]> {
  return apiRequest<Application[]>(
    "/api/applications/bulk/org-interview-invite",
    { method: "POST", body: { applicationIds, ...input }, token },
  );
}

/* ------------------------------------------- candidate, by invite token ---- */
/*
 * These three are authenticated by the token in the emailed link, NOT by a
 * session — the candidate may open it on a device where they aren't signed in.
 * They deliberately pass no bearer token.
 */

/** GET /api/applications/org-interview/:token */
export function getOrgInterviewInvite(
  inviteToken: string,
  signal?: AbortSignal,
): Promise<OrgInterviewInvite> {
  return apiRequest<OrgInterviewInvite>(
    `/api/applications/org-interview/${inviteToken}`,
    { signal },
  );
}

/** POST /api/applications/org-interview/:token/start */
export function startOrgInterviewByToken(
  inviteToken: string,
): Promise<InterviewSessionView> {
  return apiRequest<InterviewSessionView>(
    `/api/applications/org-interview/${inviteToken}/start`,
    { method: "POST" },
  );
}

/** POST /api/applications/org-interview/:token/answer */
export function submitOrgInterviewAnswerByToken(
  inviteToken: string,
  answer: string,
): Promise<InterviewSessionView> {
  return apiRequest<InterviewSessionView>(
    `/api/applications/org-interview/${inviteToken}/answer`,
    { method: "POST", body: { answer } },
  );
}
