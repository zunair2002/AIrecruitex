"use client";

import Link from "next/link";
import { useState } from "react";
import { ResumeDropzone } from "./ResumeDropzone";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  RESUME_ACCEPTED_MIME_TYPES,
  RESUME_MAX_BYTES,
  uploadResume,
} from "@/lib/resumeApi";
import {
  RESUME_STATUS_LABELS,
  formatFileSize,
} from "@/lib/format";
import type { ResumeUploadResult } from "@/lib/types";
import {
  Card,
  InlineError,
  PageHeader,
  SkillChips,
} from "@/components/ui/Feedback";
import { primaryButtonClass } from "@/components/ui/controls";

const MAX_SIZE_MB = RESUME_MAX_BYTES / (1024 * 1024);

export function ResumeUpload() {
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeUploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mirrors upload.middleware.ts so an invalid file is caught before the round trip.
  const handleFileSelect = (file: File) => {
    setResult(null);
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
      setResult(await uploadResume(selectedFile, token));
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Resume Upload"
          description="Upload your PDF or DOCX resume. The text is parsed for skills and used to match you against every job you apply to."
        />

        {result ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                OK
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-800">
                  Resume uploaded successfully
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedFile?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-sm text-gray-500 transition-colors hover:text-indigo-600"
              >
                Replace
              </button>
            </div>
          </div>
        ) : (
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
                    onClick={handleRemove}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`${primaryButtonClass} px-5 py-2.5 text-sm`}
                  >
                    {isUploading ? "Uploading…" : "Upload Resume"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {error && result === null && selectedFile && (
          <div className="mt-4">
            <InlineError message={error} />
          </div>
        )}

        {result && (
          <Card title="Parsed Resume" className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Parse status
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {RESUME_STATUS_LABELS[result.status]}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Stored file
                </p>
                <a
                  href={result.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block truncate font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View uploaded resume
                </a>
              </div>
              <div className="rounded-xl bg-indigo-50 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-indigo-500">
                  Skills detected ({result.skills.length})
                </p>
                <div className="mt-2">
                  <SkillChips
                    skills={result.skills}
                    emptyLabel="No known skills were detected in this resume."
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
          </Card>
        )}
      </div>
    </div>
  );
}
