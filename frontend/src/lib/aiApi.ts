/** `/api/ai` — registered directly in the backend's app.ts */
import { apiRequest } from "./api";
import type { AnswerEvaluation, InterviewStage, InterviewLevel } from "./types";

/**
 * POST /api/ai/evaluate — scores one answer with the same model, prompt and
 * weights the interview flow uses, without creating a session. Pass either
 * `keyPoints` or a `referenceAnswer` (key points are extracted from it).
 * Answers over 5000 characters are refused with 400; 503 if the model is down.
 */
export function evaluateAnswer(
  input: {
    stage: InterviewStage;
    question: string;
    answer: string;
    keyPoints?: string[];
    referenceAnswer?: string;
    topic?: string;
    level?: InterviewLevel;
  },
  token: string | null,
  signal?: AbortSignal,
): Promise<AnswerEvaluation> {
  return apiRequest<AnswerEvaluation>("/api/ai/evaluate", {
    method: "POST",
    body: input,
    token,
    signal,
  });
}
