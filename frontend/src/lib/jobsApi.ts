/**
 * `/api/jobs` — served by two routers mounted on the same prefix:
 *   candidate/job-board/routes/job-board.routes.ts  (GET /open)
 *   hr/job-posting/routes/job-posting.routes.ts     (POST /, GET /mine)
 */
import { apiRequest } from "./api";
import type { Job, ObjectId, OrgInterviewQuestionSet } from "./types";

/** The multer field name the backend's `uploadJdFile` expects. */
export const JD_FILE_FIELD = "jd";

/** The multer field name `uploadQuestionPoolFile` expects. */
export const QUESTION_POOL_FILE_FIELD = "questionsFile";

/** GET /api/jobs/open — every open job, newest first. Any signed-in role. */
export function listOpenJobs(
  token: string | null,
  signal?: AbortSignal,
): Promise<Job[]> {
  return apiRequest<Job[]>("/api/jobs/open", { token, signal });
}

/** GET /api/jobs/mine — the signed-in HR user's own postings, newest first. */
export function listMyJobs(
  token: string | null,
  signal?: AbortSignal,
): Promise<Job[]> {
  return apiRequest<Job[]>("/api/jobs/mine", { token, signal });
}

/**
 * POST /api/jobs — multipart, HR only.
 *
 * `requiredSkills` is sent comma-separated (the controller splits a string or
 * accepts an array). If it's left empty AND a JD file is attached, the backend
 * suggests skills from the JD text; with neither, it rejects with a 400.
 */
export function createJob(
  input: {
    title: string;
    description: string;
    requiredSkills: string[];
    jdFile?: File | null;
  },
  token: string | null,
): Promise<Job> {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description);
  formData.append("requiredSkills", input.requiredSkills.join(","));
  if (input.jdFile) formData.append(JD_FILE_FIELD, input.jdFile);

  return apiRequest<Job>("/api/jobs", { method: "POST", formData, token });
}

/* ------------------------------ organisational interview question pool ---- */

/**
 * PUT /api/jobs/:jobId/interview-questions — replaces the job's whole question
 * pool from an uploaded PDF/DOCX of "Q: / A: / Marks:" blocks.
 *
 * `questionsPerInterview` caps how many of the pool each candidate is asked,
 * drawn at random and shuffled per candidate; omit it to ask the whole pool.
 */
export function uploadQuestionSet(
  jobId: ObjectId,
  input: { file: File; questionsPerInterview?: number },
  token: string | null,
): Promise<OrgInterviewQuestionSet> {
  const formData = new FormData();
  formData.append(QUESTION_POOL_FILE_FIELD, input.file);
  if (input.questionsPerInterview !== undefined) {
    formData.append("questionsPerInterview", String(input.questionsPerInterview));
  }
  return apiRequest<OrgInterviewQuestionSet>(
    `/api/jobs/${jobId}/interview-questions`,
    { method: "PUT", formData, token },
  );
}

/** GET /api/jobs/:jobId/interview-questions — null when no pool is set up. */
export function getQuestionSet(
  jobId: ObjectId,
  token: string | null,
  signal?: AbortSignal,
): Promise<OrgInterviewQuestionSet | null> {
  return apiRequest<OrgInterviewQuestionSet | null>(
    `/api/jobs/${jobId}/interview-questions`,
    { token, signal },
  );
}
