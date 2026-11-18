"use client";

import { useRef, useState } from "react";
import {
  Award,
  CloudUpload,
  Eye,
  EyeOff,
  FileQuestion,
  FileText,
  ListChecks,
  Shuffle,
} from "lucide-react";
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
  Badge,
  Button,
  Card,
  EmptyState,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  StatCard,
} from "@/components/ui";
import {
  helpTextClass,
  inputClass,
  labelClass,
} from "@/components/ui/controls";

const MAX_SIZE_MB = RESUME_MAX_BYTES / (1024 * 1024);

const codeClass =
  "mx-0.5 rounded bg-surface-3 px-1 py-0.5 font-mono text-xs text-ink";

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
          questionsPerInterview: perInterview
            ? Number(perInterview)
            : undefined,
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

  if (questionSet.isLoading)
    return <LoadingBlock label="Loading question pool…" />;

  // `questions` is defensive: the endpoint answers `data: null` when no pool
  // exists yet, and a partial payload shouldn't take the whole page down.
  const existing = questionSet.data;
  const questions = existing?.questions ?? [];
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="space-y-6">
      {existing && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard
            label="Questions in pool"
            value={questions.length}
            icon={<ListChecks aria-hidden="true" />}
          />
          <StatCard
            label="Asked per candidate"
            value={existing.questionsPerInterview || questions.length}
            icon={<Shuffle aria-hidden="true" />}
            tone="info"
          />
          <div className="col-span-2 grid sm:col-span-1">
            <StatCard
              label="Total marks in pool"
              value={totalMarks}
              icon={<Award aria-hidden="true" />}
              tone="success"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-6">
        {/* ---- upload (first on phones, right column on desktop) ---- */}
        <Card
          title={existing ? "Replace the pool" : "Upload a question pool"}
          description={`Question pool for ${jobTitle}.`}
          className="lg:sticky lg:top-6 lg:order-2"
        >
          <form onSubmit={handleUpload} className="space-y-5">
            {error && <InlineError message={error} />}
            {success && <InlineSuccess message={success} />}

            <div>
              <label htmlFor="questions-file" className={labelClass}>
                Questions file{" "}
                <span aria-hidden="true" className="text-rose-600">
                  *
                </span>
              </label>
              <div
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 hover:border-brand-300 hover:bg-brand-50/50 ${
                  file
                    ? "border-brand-200 bg-brand-50/50"
                    : "border-line bg-surface-2/60"
                }`}
              >
                <input
                  id="questions-file"
                  ref={fileInputRef}
                  type="file"
                  accept={RESUME_ACCEPT_ATTRIBUTE}
                  onChange={(event) => handleFile(event.target.files?.[0])}
                  aria-describedby="questions-file-help"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700 shadow-xs ring-1 ring-inset ring-line"
                >
                  {file ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <CloudUpload className="h-5 w-5" />
                  )}
                </span>
                {file ? (
                  <>
                    <p className="max-w-full break-all text-sm font-medium text-ink">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatFileSize(file.size)} · click to replace
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-body">
                      <span className="font-semibold text-brand-700">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-muted">
                      PDF or DOCX, max {MAX_SIZE_MB}MB
                    </p>
                  </>
                )}
              </div>
              <p id="questions-file-help" className={helpTextClass}>
                One block per question:
                <code className={codeClass}>Q:</code> the question,
                <code className={codeClass}>A:</code> the model answer it&apos;s
                graded against, and
                <code className={codeClass}>Marks:</code> its weight.
              </p>
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
                aria-describedby="questions-per-interview-help"
                className={inputClass}
              />
              <p id="questions-per-interview-help" className={helpTextClass}>
                Drawn at random and shuffled for each candidate — e.g. 10 from a
                pool of 20 means no two candidates get the same set.
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={!file || isUploading}
              loading={isUploading}
              leadingIcon={<CloudUpload aria-hidden="true" />}
            >
              {isUploading
                ? "Uploading…"
                : existing
                  ? "Replace pool"
                  : "Upload pool"}
            </Button>
            {existing && (
              <p className="text-xs text-muted">
                Uploading replaces the entire pool. Interviews already in
                progress keep the questions they were given.
              </p>
            )}
          </form>
        </Card>

        {/* ---- the pool ---- */}
        <div className="min-w-0 lg:order-1 lg:col-span-2">
          {questions.length > 0 && existing ? (
            <Card
              title={`Questions (${questions.length})`}
              description={`Last updated ${formatDateTime(existing.updatedAt)}.${
                existing.questionsPerInterview
                  ? " Each candidate gets a different random draw, in a different order."
                  : " Every candidate is asked the whole pool."
              }`}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  aria-pressed={showAnswers}
                  onClick={() => setShowAnswers((value) => !value)}
                  leadingIcon={
                    showAnswers ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )
                  }
                >
                  {showAnswers ? "Hide" : "Show"} model answers
                </Button>
              }
            >
              <ol className="-mx-5 divide-y divide-line-soft border-y border-line-soft sm:-mx-6">
                {questions.map((question, index) => (
                  <li
                    key={`${index}-${question.question.slice(0, 24)}`}
                    className="flex gap-3 px-5 py-4 sm:gap-4 sm:px-6"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold tabular-nums text-brand-700"
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <p className="text-sm font-medium text-ink">
                          <span className="sr-only">{index + 1}. </span>
                          {question.question}
                        </p>
                        <Badge tone="neutral" className="self-start tabular-nums">
                          {question.marks} mark{question.marks === 1 ? "" : "s"}
                        </Badge>
                      </div>
                      {showAnswers && (
                        <div className="mt-3 rounded-lg bg-surface-2 p-3 ring-1 ring-inset ring-line-soft">
                          <p className="text-xs font-medium text-muted">
                            Model answer:
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm text-body">
                            {question.referenceAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted">
                Model answers are used for grading only and are never shown to
                candidates.
              </p>
            </Card>
          ) : (
            <Card>
              <EmptyState
                bare
                icon={<FileQuestion />}
                title="No question pool yet"
                description={
                  existing
                    ? "The uploaded pool has no questions. Upload a file with Q: / A: / Marks: blocks."
                    : "Until one is uploaded, candidates can't be given an organisational interview for this job."
                }
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
