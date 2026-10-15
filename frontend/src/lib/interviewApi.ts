/** `/api/interview` — candidate/interview/routes/interview.routes.ts */
import { apiRequest } from "./api";
import type {
  InterviewHistoryType,
  InterviewSessionSummary,
  InterviewSessionView,
  InterviewStage,
  InterviewTrack,
  ObjectId,
  TrackId,
} from "./types";

/** GET /api/interview/tracks — public; the practice tracks to choose from. */
export function listTracks(signal?: AbortSignal): Promise<InterviewTrack[]> {
  return apiRequest<InterviewTrack[]>("/api/interview/tracks", { signal });
}

/**
 * POST /api/interview/start — begins (or resumes) a practice round.
 * The backend resumes an unfinished session of the same stage and track, so
 * this is safe to call again. "technical" (Round 2) is refused with 400/403
 * until the latest completed Round 1 scored at least 50.
 */
export function startInterview(
  input: { stage: InterviewStage; track: TrackId },
  token: string | null,
  signal?: AbortSignal,
): Promise<InterviewSessionView> {
  return apiRequest<InterviewSessionView>("/api/interview/start", {
    method: "POST",
    body: input,
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

/**
 * GET /api/interview/mine — every session this candidate has, newest first,
 * optionally narrowed to one kind. Replaces the browser-local session index
 * the frontend previously had to keep.
 */
export function listMySessions(
  type: InterviewHistoryType | undefined,
  token: string | null,
  signal?: AbortSignal,
): Promise<InterviewSessionSummary[]> {
  return apiRequest<InterviewSessionSummary[]>("/api/interview/mine", {
    query: { type },
    token,
    signal,
  });
}
