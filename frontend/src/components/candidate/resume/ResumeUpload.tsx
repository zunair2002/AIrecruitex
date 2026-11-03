"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  Clock3,
  ExternalLink,
  FileText,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { ResumeDropzone } from "./ResumeDropzone";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { updateCandidateProfile } from "@/lib/authApi";
import {
  RESUME_ACCEPTED_MIME_TYPES,
  RESUME_MAX_BYTES,
  deleteMyResume,
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
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const parseStatusStyle: Record<ResumeStatus, string> = {
  parsed: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
};

export function ResumeUpload() {
  const { token, user, refresh } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [headline, setHeadline] = useState(user?.headline ?? "");
  const [about, setAbout] = useState(user?.about ?? "");
  const [interestsText, setInterestsText] = useState(
    (user?.interests ?? []).join(", "),
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const avatarPreviewRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (avatarPreviewRef.current) {
        URL.revokeObjectURL(avatarPreviewRef.current);
      }
    },
    [],
  );

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

  const handleAvatarChange = (file?: File) => {
    if (!file) return;
    if (!AVATAR_MIME_TYPES.includes(file.type)) {
      setProfileError("Profile photo must be JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setProfileError("Profile photo must be 5MB or smaller.");
      return;
    }

    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);
    }
    const preview = URL.createObjectURL(file);
    avatarPreviewRef.current = preview;
    setAvatarPreview(preview);
    setAvatarFile(file);
    setRemoveAvatar(false);
    setProfileError(null);
    setProfileSuccess(null);
  };

  const clearAvatarSelection = () => {
    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);
      avatarPreviewRef.current = null;
    }
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleSaveProfile = async () => {
    const interests = [
      ...new Set(
        interestsText
          .split(/[,\n]/)
          .map((interest) => interest.trim())
          .filter(Boolean),
      ),
    ];
    if (interests.length > 20) {
      setProfileError("You can add up to 20 interests.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      await updateCandidateProfile(
        {
          headline,
          about,
          interests,
          avatar: avatarFile ?? undefined,
          removeAvatar,
        },
        token,
      );
      await refresh();
      clearAvatarSelection();
      setRemoveAvatar(false);
      setIsEditingProfile(false);
      setProfileSuccess("Candidate profile updated successfully.");
    } catch (saveError) {
      setProfileError(toErrorMessage(saveError));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfileEdit = () => {
    setHeadline(user?.headline ?? "");
    setAbout(user?.about ?? "");
    setInterestsText((user?.interests ?? []).join(", "));
    clearAvatarSelection();
    setRemoveAvatar(false);
    setProfileError(null);
    setIsEditingProfile(false);
  };

  const handleDeleteResume = async () => {
    setIsDeletingResume(true);
    setDeleteError(null);
    try {
      await deleteMyResume(token);
      setShowDeleteConfirmation(false);
      existing.reload();
    } catch (deleteFailure) {
      setDeleteError(toErrorMessage(deleteFailure));
    } finally {
      setIsDeletingResume(false);
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
    [
      resume?.originalName ?? "current resume",
      "pdf",
      "docx",
      resume?.status ?? "",
      resume ? RESUME_STATUS_LABELS[resume.status] : "",
    ].some((value) => value.toLocaleLowerCase().includes(searchValue));
  const displayedAvatar = removeAvatar
    ? null
    : avatarPreview ?? user?.avatarUrl ?? null;

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

        <section className="border border-[#e9eaf0] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#eeeeF2] px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-2">
              <UserRound
                aria-hidden="true"
                className="h-3.5 w-3.5 text-[#6b5ce7]"
              />
              <h2 className="text-[11px] font-semibold text-[#454752]">
                Candidate profile
              </h2>
            </div>
            {!isEditingProfile && (
              <button
                type="button"
                onClick={() => {
                  setProfileError(null);
                  setProfileSuccess(null);
                  setIsEditingProfile(true);
                }}
                className="inline-flex h-7 items-center gap-1 rounded border border-[#e9eaf0] px-2.5 text-[9px] font-medium text-[#666974] transition-colors hover:border-[#d8d5f7] hover:text-[#5f53ce]"
              >
                <Pencil aria-hidden="true" className="h-3 w-3" />
                Edit profile
              </button>
            )}
          </div>

          {profileError && (
            <p
              role="alert"
              className="mx-3 mt-3 border border-rose-100 bg-rose-50 px-3 py-2 text-[10px] text-rose-700 sm:mx-4"
            >
              {profileError}
            </p>
          )}
          {profileSuccess && !isEditingProfile && (
            <p
              role="status"
              className="mx-3 mt-3 border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] text-emerald-700 sm:mx-4"
            >
              {profileSuccess}
            </p>
          )}

          {isEditingProfile ? (
            <div className="space-y-3 p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0efff] text-sm font-semibold text-[#6658d9] ring-1 ring-[#e9eaf0]">
                    {displayedAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displayedAvatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name
                        .split(/\s+/)
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() ?? "?"
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold text-[#454752]">
                      {user?.name}
                    </p>
                    <p className="truncate text-[9px] text-[#92949d]">
                      {user?.email}
                    </p>
                    <p className="mt-0.5 text-[8px] text-[#a0a2aa]">
                      JPG, PNG or WEBP · max 5MB
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <label className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded border border-[#e9eaf0] bg-white px-2.5 text-[9px] font-medium text-[#666974] transition-colors hover:border-[#d8d5f7] hover:text-[#5f53ce]">
                    <Camera aria-hidden="true" className="h-3 w-3" />
                    {displayedAvatar ? "Change photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        handleAvatarChange(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  {displayedAvatar && (
                    <button
                      type="button"
                      onClick={() => {
                        clearAvatarSelection();
                        setRemoveAvatar(true);
                      }}
                      className="inline-flex h-7 items-center gap-1 rounded border border-rose-100 px-2.5 text-[9px] font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 aria-hidden="true" className="h-3 w-3" />
                      Remove photo
                    </button>
                  )}
                  {removeAvatar && (
                    <button
                      type="button"
                      onClick={() => setRemoveAvatar(false)}
                      className="inline-flex h-7 items-center gap-1 rounded border border-[#e9eaf0] px-2.5 text-[9px] font-medium text-[#666974]"
                    >
                      <X aria-hidden="true" className="h-3 w-3" />
                      Keep current photo
                    </button>
                  )}
                </div>
              </div>

              <label className="block">
                <span className="mb-1 flex items-center justify-between text-[9px] font-medium text-[#666974]">
                  Professional headline
                  <span className="text-[#a0a2aa]">{headline.length}/120</span>
                </span>
                <input
                  type="text"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  maxLength={120}
                  placeholder="e.g. Frontend Developer | React & TypeScript"
                  className="h-8 w-full border border-[#e9eaf0] px-2.5 text-[10px] text-[#42444e] outline-none placeholder:text-[#a3a5ad] focus:border-[#bdb6f0]"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center justify-between text-[9px] font-medium text-[#666974]">
                  About
                  <span className="text-[#a0a2aa]">{about.length}/1000</span>
                </span>
                <textarea
                  value={about}
                  onChange={(event) => setAbout(event.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Share a short professional introduction…"
                  className="w-full resize-y border border-[#e9eaf0] px-2.5 py-2 text-[10px] leading-5 text-[#42444e] outline-none placeholder:text-[#a3a5ad] focus:border-[#bdb6f0]"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center justify-between text-[9px] font-medium text-[#666974]">
                  Interests and skills
                  <span className="text-[#a0a2aa]">Separate with commas</span>
                </span>
                <textarea
                  value={interestsText}
                  onChange={(event) => setInterestsText(event.target.value)}
                  rows={2}
                  placeholder="React, UI design, accessibility"
                  className="w-full resize-y border border-[#e9eaf0] px-2.5 py-2 text-[10px] leading-5 text-[#42444e] outline-none placeholder:text-[#a3a5ad] focus:border-[#bdb6f0]"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-2 border-t border-[#f0f0f3] pt-3">
                <button
                  type="button"
                  onClick={handleCancelProfileEdit}
                  disabled={isSavingProfile}
                  className="h-7 px-2.5 text-[9px] font-medium text-[#777984] hover:text-[#454752] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="inline-flex h-7 items-center gap-1.5 rounded bg-[#6b5ce7] px-3 text-[9px] font-semibold text-white transition-colors hover:bg-[#5849d1] disabled:cursor-wait disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <RefreshCw
                      aria-hidden="true"
                      className="h-3 w-3 animate-spin"
                    />
                  ) : (
                    <Check aria-hidden="true" className="h-3 w-3" />
                  )}
                  {isSavingProfile ? "Saving…" : "Save profile"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0efff] text-sm font-semibold text-[#6658d9] ring-1 ring-[#e9eaf0]">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() ?? "?"
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-[#454752]">
                  {user?.name}
                </p>
                <p className="mt-0.5 text-[9px] text-[#92949d]">
                  {user?.headline || "Add a professional headline"}
                </p>
                {user?.about && (
                  <p className="mt-2 whitespace-pre-line text-[9px] leading-4 text-[#777a85]">
                    {user.about}
                  </p>
                )}
                {user?.interests?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {user.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-sm border border-[#ececf1] bg-[#fbfbfc] px-1.5 py-0.5 text-[8px] text-[#6f717b]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  !user?.about && (
                    <p className="mt-1 text-[9px] text-[#a0a2aa]">
                      Add an about section and interests to complete your profile.
                    </p>
                  )
                )}
              </div>
            </div>
          )}
        </section>

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
                    Resume file
                </h2>
                <span className="rounded-full bg-[#f0efff] px-1.5 py-0.5 text-[8px] font-medium text-[#6658d9]">
                  {resume ? "1 file" : "0 files"}
                </span>
              </div>
              <p className="mt-1 text-[9px] text-[#92949d]">
                Your current resume and its last updated time.
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
                            {resume.originalName || "Current resume"}
                          </p>
                          <p className="mt-0.5 text-[8px] text-[#999ba4]">
                            {resume.fileSize
                              ? formatFileSize(resume.fileSize)
                              : "PDF or DOCX document"}
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
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setShowDeleteConfirmation(true);
                          }}
                          className="inline-flex h-6 items-center gap-1 rounded border border-rose-100 px-2 text-[8px] font-medium text-rose-600 transition-colors hover:bg-rose-50"
                        >
                          <Trash2 aria-hidden="true" className="h-2.5 w-2.5" />
                          Delete
                        </button>
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
                Only the latest resume is retained. Uploading another file replaces
                this one.
              </p>
            </div>
          )}
        </section>

        {deleteError && (
          <p
            role="alert"
            className="border border-rose-100 bg-rose-50 px-3 py-2 text-[10px] text-rose-700"
          >
            {deleteError}
          </p>
        )}

        {showDeleteConfirmation && resume && (
          <section
            role="alertdialog"
            aria-labelledby="delete-resume-title"
            aria-describedby="delete-resume-description"
            className="flex flex-col gap-3 border border-rose-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Shield aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <div>
                <p
                  id="delete-resume-title"
                  className="text-[10px] font-semibold text-[#454752]"
                >
                  Delete your current resume?
                </p>
                <p
                  id="delete-resume-description"
                  className="mt-0.5 text-[9px] text-[#858792]"
                >
                  This permanently removes the file from your candidate profile.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isDeletingResume}
                className="h-7 px-2.5 text-[9px] font-medium text-[#777984] hover:text-[#454752] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteResume}
                disabled={isDeletingResume}
                className="inline-flex h-7 items-center gap-1.5 rounded bg-rose-600 px-2.5 text-[9px] font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isDeletingResume ? (
                  <RefreshCw
                    aria-hidden="true"
                    className="h-3 w-3 animate-spin"
                  />
                ) : (
                  <Trash2 aria-hidden="true" className="h-3 w-3" />
                )}
                {isDeletingResume ? "Deleting…" : "Delete resume"}
              </button>
            </div>
          </section>
        )}

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
