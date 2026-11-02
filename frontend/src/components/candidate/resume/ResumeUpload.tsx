"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  ExternalLink,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";
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
import {
  RESUME_STATUS_LABELS,
  formatDateTime,
  formatFileSize,
} from "@/lib/format";
import type { ResumeStatus } from "@/lib/types";
import { ErrorBlock } from "@/components/ui/Feedback";

const MAX_SIZE_MB = RESUME_MAX_BYTES / (1024 * 1024);

const parseStatusStyle: Record<ResumeStatus, string> = {
  parsed: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
};

export function ResumeUpload() {
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");

  const existing = useApiResource(
    (signal) => getMyResume(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

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
      existing.reload();
    } catch (uploadError) {
      setError(toErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  if (existing.isLoading) {
    return (
      <div className="min-h-full animate-pulse bg-[#f7f8fa] p-5">
        <div className="mx-auto max-w-[1500px] space-y-4">
          <div className="h-8 bg-white" />
          <div className="h-36 border border-[#e9eaf0] bg-white" />
          <div className="h-56 border border-[#e9eaf0] bg-white" />
        </div>
      </div>
    );
  }

  const resume = existing.data?.fileUrl ? existing.data : null;
  const searchValue = search.trim().toLocaleLowerCase();
  const matchesSearch =
    !searchValue ||
    ["current resume", "pdf", "docx", resume?.status ?? ""].some((value) =>
      value.toLocaleLowerCase().includes(searchValue),
    );

  return (
    <div className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div className="mx-auto max-w-[1500px] space-y-3">
        <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e9eaf0] bg-white text-[#767985]">
              <FileText aria-hidden="true" className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-semibold text-[#30323b]">
                Resume Upload
              </h1>
              <p className="hidden text-[10px] text-[#999ba4] sm:block">
                Keep your resume up to date for more relevant job matches.
              </p>
            </div>
          </div>
          <Link
            href="/candidate/jobs"
            className="inline-flex h-7 shrink-0 items-center gap-1.5 self-start rounded bg-[#6b5ce7] px-2.5 text-[9px] font-semibold text-white transition-colors hover:bg-[#5849d1] sm:self-auto"
          >
            Browse jobs <ArrowRight aria-hidden="true" className="h-3 w-3" />
          </Link>
        </header>

        {existing.error && (
          <ErrorBlock message={existing.error} onRetry={existing.reload} />
        )}

        <section className="border border-[#e9eaf0] bg-white p-2 sm:p-3">
          <ResumeDropzone
            onFileSelect={handleFileSelect}
            error={error}
            maxSizeMB={MAX_SIZE_MB}
          />
          {resume && (
            <p className="mt-2 flex items-center gap-1.5 px-1 text-[9px] text-[#92949d]">
              <ShieldCheck
                aria-hidden="true"
                className="h-3 w-3 shrink-0 text-[#6b5ce7]"
              />
              Uploading a new file replaces your current resume. Only the latest
              version is stored.
            </p>
          )}
        </section>

        {selectedFile && (
          <section className="flex flex-col gap-3 border border-[#e9eaf0] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#f0efff] text-[#6658d9]">
                <FileText aria-hidden="true" className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-[#454752]">
                  {selectedFile.name}
                </p>
                <p className="mt-0.5 text-[9px] text-[#92949d]">
                  {formatFileSize(selectedFile.size)} · Ready to upload
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setError(null);
                }}
                disabled={isUploading}
                className="h-7 px-2.5 text-[9px] font-medium text-[#777984] hover:text-[#454752] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex h-7 items-center gap-1.5 rounded bg-[#6b5ce7] px-3 text-[9px] font-semibold text-white transition-colors hover:bg-[#5849d1] disabled:cursor-wait disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <RefreshCw
                      aria-hidden="true"
                      className="h-3 w-3 animate-spin"
                    />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload aria-hidden="true" className="h-3 w-3" />
                    {resume ? "Replace resume" : "Upload resume"}
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        <section className="border border-[#e9eaf0] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-[#eeeeF2] p-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-semibold text-[#454752]">
                  Resume history
                </h2>
                <span className="rounded-full bg-[#f0efff] px-1.5 py-0.5 text-[8px] font-medium text-[#6658d9]">
                  {resume ? "1 file" : "0 files"}
                </span>
              </div>
              <p className="mt-1 text-[9px] text-[#92949d]">
                Latest resume and its last updated time.
              </p>
            </div>
            <label className="flex h-7 w-full items-center gap-1.5 border border-[#e9eaf0] px-2 sm:max-w-[190px]">
              <Search
                aria-hidden="true"
                className="h-3 w-3 shrink-0 text-[#9a9ca5]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search resume…"
                aria-label="Search resume history"
                className="min-w-0 flex-1 bg-transparent text-[9px] text-[#42444e] outline-none placeholder:text-[#a3a5ad]"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0f0f3] text-[8px] font-semibold uppercase tracking-[0.05em] text-[#999ba4]">
                  <th className="w-[36%] px-3 py-2.5">File</th>
                  <th className="w-[20%] px-3 py-2.5">Parse status</th>
                  <th className="w-[25%] px-3 py-2.5">Last modified</th>
                  <th className="w-[19%] px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resume && matchesSearch ? (
                  <tr className="border-b border-[#f3f3f6] last:border-0">
                    <td className="px-3 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#f4f3ff] text-[#6b5ce7]">
                          <FileText
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-semibold text-[#454752]">
                            Current resume
                          </p>
                          <p className="mt-0.5 text-[8px] text-[#999ba4]">
                            PDF or DOCX document
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-1 text-[8px] font-medium ${parseStatusStyle[resume.status]}`}
                      >
                        <Check aria-hidden="true" className="h-2.5 w-2.5" />
                        {RESUME_STATUS_LABELS[resume.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[9px] text-[#666974]">
                        <Clock3
                          aria-hidden="true"
                          className="h-3 w-3 text-[#999ba4]"
                        />
                        {formatDateTime(resume.updatedAt)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={resume.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-6 items-center gap-1 rounded border border-[#e9eaf0] px-2 text-[8px] font-medium text-[#666974] transition-colors hover:border-[#d8d5f7] hover:text-[#5f53ce]"
                        >
                          View
                          <ExternalLink
                            aria-hidden="true"
                            className="h-2.5 w-2.5"
                          />
                        </a>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-9 text-center">
                      <p className="text-[10px] font-medium text-[#626570]">
                        {resume
                          ? "No resume matches your search."
                          : "No resume uploaded yet."}
                      </p>
                      {!resume && (
                        <p className="mt-1 text-[9px] text-[#92949d]">
                          Upload a PDF or DOCX file to see it listed here.
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {resume && (
            <div className="border-t border-[#f0f0f3] px-3 py-2">
              <p className="text-[8px] text-[#999ba4]">
                Only the latest resume is retained. Uploading another file
                replaces this record.
              </p>
            </div>
          )}
        </section>

        {resume && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/candidate/applications"
              className="inline-flex h-7 items-center gap-1.5 border border-[#e9eaf0] bg-white px-2.5 text-[9px] font-medium text-[#666974] transition-colors hover:border-[#d8d5f7] hover:text-[#5f53ce]"
            >
              My applications <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
