/** `/api/interview` — candidate/interview/routes/interview.routes.ts */
import { apiRequest } from "./api";
import type { InterviewLevel, InterviewSessionView, ObjectId } from "./types";

/**
 * POST /api/interview/start — begins (or resumes) the caller's practice session.
 * The backend reuses any existing non-completed session that has no
 * `applicationId`, so this is safe to call on every page load.
 */
export function startInterview(
  level: InterviewLevel | undefined,
  token: string | null,
  signal?: AbortSignal,
): Promise<InterviewSessionView> {
  return apiRequest<InterviewSessionView>("/api/interview/start", {
    method: "POST",
    body: level ? { level } : {},
    token,
    signal,
  });
}

/** POST /api/interview/answer — submits the answer to the current question. */
export function submitAnswer(
  input: { sessionId: ObjectId; answer: string },
  token: string | null,
): Promise<InterviewSessionView> {
  return apiRequest<InterviewSessionView>("/api/interview/answer", {
    method: "POST",
    body: input,
    token,
  });
}

/** GET /api/interview/report/:sessionId — the live view or the final report. */
export function getInterviewReport(
  sessionId: ObjectId,
  token: string | null,
  signal?: AbortSignal,
): Promise<InterviewSessionView> {
  return apiRequest<InterviewSessionView>(
    `/api/interview/report/${sessionId}`,
    { token, signal },
  );
}
