"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { getQuestionSet, uploadQuestionSet } from "@/lib/jobsApi";
import { useApiResource } from "@/lib/useApiResource";
import {
  RESUME_ACCEPTED_MIME_TYPES,
  RESUME_ACCEPT_ATTRIBUTE,
  RESUME_MAX_BYTES,
} from "@/lib/resumeApi";
import { formatDateTime, formatFileSize } from "@/lib/format";
import type { ObjectId } from "@/lib/types";
import {
  Card,
  InlineError,
  InlineSuccess,
  LoadingBlock,
} from "@/components/ui/Feedback";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/controls";

const MAX_SIZE_MB = RESUME_MAX_BYTES / (1024 * 1024);

/**
 * The organisational-interview question pool for one job.
 *
 * HR authors it as a PDF/DOCX of "Q: / A: / Marks:" blocks and uploads the
 * whole thing — PUT replaces the pool wholesale rather than appending.
 * `questionsPerInterview` caps how many each candidate is actually asked, drawn
 * at random and shuffled per candidate so simultaneous interviewees can't
 * compare notes.
 */
export function QuestionSetPanel({
  jobId,
  jobTitle,
}: {
  jobId: ObjectId;
  jobTitle: string;
}) {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [perInterview, setPerInterview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const questionSet = useApiResource(
    (signal) => getQuestionSet(jobId, token, signal),
    [jobId, token],
    { enabled: Boolean(token) },
  );

  const handleFile = (chosen: File | undefined) => {
    if (!chosen) return;
    if (!RESUME_ACCEPTED_MIME_TYPES.includes(chosen.type)) {
      setError("The questions file must be a PDF or DOCX.");
      return;
    }
    if (chosen.size > RESUME_MAX_BYTES) {
      setError(`The questions file must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    setError(null);
    setFile(chosen);
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const saved = await uploadQuestionSet(
        jobId,
        {
          file,
          questionsPerInterview: perInterview ? Number(perInterview) : undefined,
        },
        token,
      );
      questionSet.setData(saved);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess(
        `Saved ${saved.questions?.length ?? 0} question${saved.questions?.length === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  if (questionSet.isLoading) return <LoadingBlock label="Loading question pool…" />;

  // `questions` is defensive: the endpoint answers `data: null` when no pool
  // exists yet, and a partial payload shouldn't take the whole page down.
  const existing = questionSet.data;
  const questions = existing?.questions ?? [];
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="space-y-6">
      <Card title={`Question pool — ${jobTitle}`}>
        {existing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Questions in pool" value={questions.length} />
              <Stat
                label="Asked per candidate"
                value={existing.questionsPerInterview || questions.length}
              />
              <Stat label="Total marks in pool" value={totalMarks} />
            </div>
            <p className="text-xs text-gray-400">
              Last updated {formatDateTime(existing.updatedAt)}.
              {existing.questionsPerInterview
                ? " Each candidate gets a different random draw, in a different order."
                : " Every candidate is asked the whole pool."}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            No question pool yet. Until one is uploaded, candidates can&apos;t be
            given an organisational interview for this job.
          </p>
        )}
      </Card>

      <Card title={existing ? "Replace the pool" : "Upload a question pool"}>
        <form onSubmit={handleUpload} className="space-y-5">
          {error && <InlineError message={error} />}
          {success && <InlineSuccess message={success} />}

          <div>
            <label htmlFor="questions-file" className={labelClass}>
              Questions file <span className="text-red-500">*</span>
            </label>
            <input
              id="questions-file"
              ref={fileInputRef}
              type="file"
              accept={RESUME_ACCEPT_ATTRIBUTE}
              onChange={(event) => handleFile(event.target.files?.[0])}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700"
            />
            <p className="mt-2 text-xs text-gray-400">
              PDF or DOCX, max {MAX_SIZE_MB}MB. One block per question:
              <code className="mx-1 rounded bg-gray-100 px-1">Q:</code> the question,
              <code className="mx-1 rounded bg-gray-100 px-1">A:</code> the model
              answer it&apos;s graded against, and
              <code className="mx-1 rounded bg-gray-100 px-1">Marks:</code> its weight.
            </p>
            {file && (
              <p className="mt-2 text-xs font-medium text-gray-600">
                {file.name} · {formatFileSize(file.size)}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="questions-per-interview" className={labelClass}>
              Questions asked per candidate
            </label>
            <input
              id="questions-per-interview"
              type="number"
              min={1}
              value={perInterview}
              onChange={(event) => setPerInterview(event.target.value)}
              placeholder="Leave empty to ask the whole pool"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-gray-400">
              Drawn at random and shuffled for each candidate — e.g. 10 from a pool of
              20 means no two candidates get the same set.
            </p>
          </div>

          <button
            type="submit"
            disabled={!file || isUploading}
            className={primaryButtonClass}
          >
            {isUploading
              ? "Uploading…"
              : existing
                ? "Replace pool"
                : "Upload pool"}
          </button>
          {existing && (
            <p className="text-xs text-gray-400">
              Uploading replaces the entire pool. Interviews already in progress keep
              the questions they were given.
            </p>
          )}
        </form>
      </Card>

      {questions.length > 0 && (
        <Card
          title={`Questions (${questions.length})`}
          action={
            <button
              type="button"
              onClick={() => setShowAnswers((value) => !value)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {showAnswers ? "Hide" : "Show"} model answers
            </button>
          }
        >
          <ol className="space-y-3">
            {questions.map((question, index) => (
              <li
                key={`${index}-${question.question.slice(0, 24)}`}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {index + 1}. {question.question}
                  </p>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-indigo-600">
                    {question.marks} mark{question.marks === 1 ? "" : "s"}
                  </span>
                </div>
                {showAnswers && (
                  <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                    <span className="font-semibold text-gray-500">
                      Model answer:{" "}
                    </span>
                    {question.referenceAnswer}
                  </p>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-gray-400">
            Model answers are used for grading only and are never shown to candidates.
          </p>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
