"use client";

import Link from "next/link";
import { useState } from "react";
import { ResumeDropzone } from "./ResumeDropzone";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  RESUME_ACCEPTED_MIME_TYPES,
  RESUME_MAX_BYTES,
  getMyResume,
  uploadResume,
} from "@/lib/resumeApi";
import { useApiResource } from "@/lib/useApiResource";
import { RESUME_STATUS_LABELS, formatDateTime, formatFileSize } from "@/lib/format";
import {
  Card,
  InlineError,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";

const MAX_SIZE_MB = RESUME_MAX_BYTES / (1024 * 1024);

/**
 * Upload / replace the candidate's resume.
 *
 * The backend no longer stores extracted text or detected skills on the Resume
 * document — matching re-extracts from the stored file when you apply — so the
 * only things to show are the file itself and whether it parsed.
 */
export function ResumeUpload() {
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  const existing = useApiResource(
    (signal) => getMyResume(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  // Mirrors upload.middleware.ts so an invalid file is caught before the round trip.
  const handleFileSelect = (file: File) => {
    if (!RESUME_ACCEPTED_MIME_TYPES.includes(file.type)) {
      setError("Only PDF or DOCX files are allowed.");
      setSelectedFile(null);
      return;
    }
    if (file.size > RESUME_MAX_BYTES) {
      setError(`File must be under ${MAX_SIZE_MB}MB.`);
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    try {
      await uploadResume(selectedFile, token);
      setSelectedFile(null);
      setIsReplacing(false);
      existing.reload();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  if (existing.isLoading) return <LoadingBlock label="Loading your resume…" />;

  // Same shape as the question pool: `data: null` means "nothing uploaded yet".
  const resume = existing.data?.fileUrl ? existing.data : null;
  const showDropzone = !resume || isReplacing;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Resume Upload"
          description="Upload your PDF or DOCX resume. It's matched against each job's required skills when you apply."
        />

        {resume && !isReplacing && (
          <Card className="mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-emerald-800">
                  You have a resume on file
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Parse status: {RESUME_STATUS_LABELS[resume.status]} · updated{" "}
                  {formatDateTime(resume.updatedAt)}
                </p>
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View uploaded resume
                </a>
              </div>
              <button
                type="button"
                onClick={() => setIsReplacing(true)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Replace
              </button>
            </div>
          </Card>
        )}

        {showDropzone && (
          <>
            <ResumeDropzone
              onFileSelect={handleFileSelect}
              error={error}
              maxSizeMB={MAX_SIZE_MB}
            />

            {selectedFile && (
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-600">
                    {selectedFile.name.toLowerCase().endsWith(".docx")
                      ? "DOCX"
                      : "PDF"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (resume) setIsReplacing(false);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`${primaryButtonClass} px-5 py-2.5 text-sm`}
                  >
                    {isUploading
                      ? "Uploading…"
                      : resume
                        ? "Replace resume"
                        : "Upload resume"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {error && selectedFile && (
          <div className="mt-4">
            <InlineError message={error} />
          </div>
        )}

        {resume && !isReplacing && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/candidate/jobs"
              className={`${primaryButtonClass} text-center text-sm`}
            >
              Browse open jobs
            </Link>
            <Link
              href="/candidate/applications"
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              My applications
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
