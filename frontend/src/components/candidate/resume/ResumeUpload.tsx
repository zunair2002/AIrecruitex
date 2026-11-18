"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileText,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
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
  badgeClass,
  formatDateTime,
  formatFileSize,
  statusTone,
} from "@/lib/format";
import {
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  InlineSuccess,
  PageHeader,
} from "@/components/ui/Feedback";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import {
  compactInputClass,
  inputClass,
  textareaClass,
} from "@/components/ui/controls";
import {
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
  trClass,
} from "@/components/ui/table";
import { PortalPage } from "@/components/dashboard/primitives";
import { useToast } from "@/context/ToastContext";

const MAX_SIZE_MB = RESUME_MAX_BYTES / (1024 * 1024);
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: string;
  hint: string;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-medium text-body">
        {children}
      </label>
      <span className="text-xs tabular-nums text-muted">{hint}</span>
    </div>
  );
}

export function ResumeUpload() {
  const { token, user, refresh } = useAuth();
  const { toast } = useToast();
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
      toast({
        title: "Resume uploaded",
        detail: "It will be matched against jobs you apply to.",
      });
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
      <PortalPage>
        <div role="status" aria-label="Loading resume" className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-3">
            <SkeletonCard lines={5} className="xl:col-span-2" />
            <SkeletonCard lines={4} />
          </div>
        </div>
      </PortalPage>
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

  const openDeleteConfirmation = () => {
    setDeleteError(null);
    setShowDeleteConfirmation(true);
  };

  const parseBadge = resume ? (
    <Badge
      tone={statusTone(resume.status)}
      icon={resume.status === "parsed" ? <Check /> : <CircleAlert />}
    >
      {RESUME_STATUS_LABELS[resume.status]}
    </Badge>
  ) : null;

  const fileSubtitle = resume?.fileSize
    ? formatFileSize(resume.fileSize)
    : "PDF or DOCX document";

  return (
    <PortalPage>
      <PageHeader
        title="Resume"
        description="Keep your resume up to date for more relevant job matches."
        icon={<FileText />}
        action={
          <>
            {resume && (
              <Button variant="secondary" href="/candidate/applications">
                My applications
              </Button>
            )}
            <Button
              href="/candidate/jobs"
              trailingIcon={<ArrowRight aria-hidden="true" />}
            >
              Browse jobs
            </Button>
          </>
        }
      />

      {existing.error && (
        <ErrorBlock message={existing.error} onRetry={existing.reload} />
      )}

      <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:space-y-6 xl:col-span-2">
          <Card
            title={resume ? "Replace your resume" : "Upload your resume"}
            description="We read your skills and experience to match you with the right jobs."
          >
            <ResumeDropzone
              onFileSelect={handleFileSelect}
              error={error}
              maxSizeMB={MAX_SIZE_MB}
            />
            {resume && (
              <p className="mt-3 flex items-start gap-2 text-sm text-muted">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-700"
                />
                Uploading a new file replaces your current resume. Only the
                latest version is stored.
              </p>
            )}

            {selectedFile && (
              <div className="mt-4 flex flex-col gap-4 rounded-xl border border-brand-200 bg-brand-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-inset ring-brand-200"
                  >
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {selectedFile.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatFileSize(selectedFile.size)} · Ready to upload
                    </p>
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:shrink-0 sm:flex-row">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedFile(null);
                      setError(null);
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    loading={isUploading}
                    leadingIcon={<Upload aria-hidden="true" />}
                  >
                    {isUploading
                      ? "Uploading…"
                      : resume
                        ? "Replace resume"
                        : "Upload resume"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card
            title={
              <span className="flex items-center gap-2">
                Resume file
                <Badge tone="brand">{resume ? "1 file" : "0 files"}</Badge>
              </span>
            }
            description="Your current resume and its last updated time."
            action={
              <div className="relative w-56 max-w-full">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search resume…"
                  aria-label="Search resume history"
                  className={`${compactInputClass} w-full pl-9`}
                />
              </div>
            }
          >
            {resume && matchesSearch ? (
              <>
                <div className={`hidden md:block ${tableWrapClass}`}>
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>File</th>
                        <th className={thClass}>Parse status</th>
                        <th className={thClass}>Last modified</th>
                        <th className={`${thClass} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={trClass}>
                        <td className={tdClass}>
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              aria-hidden="true"
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
                            >
                              <FileText className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <p className="max-w-xs truncate font-medium text-ink">
                                {resume.originalName || "Current resume"}
                              </p>
                              <p className="mt-0.5 text-xs text-muted">
                                {fileSubtitle}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={tdClass}>{parseBadge}</td>
                        <td className={`${tdClass} whitespace-nowrap text-muted`}>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3
                              aria-hidden="true"
                              className="h-4 w-4 text-subtle"
                            />
                            {formatDateTime(resume.updatedAt)}
                          </span>
                        </td>
                        <td className={tdClass}>
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={resume.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={buttonClass({
                                variant: "secondary",
                                size: "sm",
                              })}
                            >
                              View
                              <ExternalLink aria-hidden="true" />
                            </a>
                            <Button
                              variant="danger-soft"
                              size="sm"
                              leadingIcon={<Trash2 aria-hidden="true" />}
                              onClick={openDeleteConfirmation}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
                    >
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium text-ink">
                        {resume.originalName || "Current resume"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{fileSubtitle}</p>
                    </div>
                    {parseBadge}
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                    <Clock3 aria-hidden="true" className="h-4 w-4 text-subtle" />
                    Updated {formatDateTime(resume.updatedAt)}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClass({ variant: "secondary" })}
                    >
                      View
                      <ExternalLink aria-hidden="true" />
                    </a>
                    <Button
                      variant="danger-soft"
                      leadingIcon={<Trash2 aria-hidden="true" />}
                      onClick={openDeleteConfirmation}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                bare
                icon={resume ? <Search /> : <FileText />}
                title={
                  resume
                    ? "No resume matches your search."
                    : "No resume uploaded yet."
                }
                description={
                  resume
                    ? undefined
                    : "Upload a PDF or DOCX file to see it listed here."
                }
              />
            )}
            {resume && (
              <p className="mt-5 border-t border-line-soft pt-4 text-xs text-muted">
                Only the latest resume is retained. Uploading another file
                replaces this one.
              </p>
            )}
          </Card>

          {deleteError && !showDeleteConfirmation && (
            <InlineError message={deleteError} />
          )}
        </div>

        <Card
          title="Candidate profile"
          className="xl:self-start"
          action={
            !isEditingProfile ? (
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={<Pencil aria-hidden="true" />}
                onClick={() => {
                  setProfileError(null);
                  setProfileSuccess(null);
                  setIsEditingProfile(true);
                }}
              >
                Edit profile
              </Button>
            ) : undefined
          }
        >
          {(profileError || (profileSuccess && !isEditingProfile)) && (
            <div className="mb-4 space-y-3">
              <InlineError message={profileError} />
              {!isEditingProfile && <InlineSuccess message={profileSuccess} />}
            </div>
          )}

          {isEditingProfile ? (
            <div className="space-y-5">
              <div className="space-y-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    name={user?.name ?? "?"}
                    src={displayedAvatar}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user?.name}
                    </p>
                    <p className="truncate text-sm text-muted">{user?.email}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      JPG, PNG or WEBP · max 5MB
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    className={buttonClass({
                      variant: "secondary",
                      size: "sm",
                      className:
                        "cursor-pointer focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2",
                    })}
                  >
                    <Camera aria-hidden="true" />
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
                    <Button
                      variant="danger-soft"
                      size="sm"
                      leadingIcon={<Trash2 aria-hidden="true" />}
                      onClick={() => {
                        clearAvatarSelection();
                        setRemoveAvatar(true);
                      }}
                    >
                      Remove photo
                    </Button>
                  )}
                  {removeAvatar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leadingIcon={<X aria-hidden="true" />}
                      onClick={() => setRemoveAvatar(false)}
                    >
                      Keep current photo
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <FieldLabel
                  htmlFor="resume-profile-headline"
                  hint={`${headline.length}/120`}
                >
                  Professional headline
                </FieldLabel>
                <input
                  id="resume-profile-headline"
                  type="text"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  maxLength={120}
                  placeholder="e.g. Frontend Developer | React & TypeScript"
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel
                  htmlFor="resume-profile-about"
                  hint={`${about.length}/1000`}
                >
                  About
                </FieldLabel>
                <textarea
                  id="resume-profile-about"
                  value={about}
                  onChange={(event) => setAbout(event.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Share a short professional introduction…"
                  className={`${textareaClass} resize-y`}
                />
              </div>

              <div>
                <FieldLabel
                  htmlFor="resume-profile-interests"
                  hint="Separate with commas"
                >
                  Interests and skills
                </FieldLabel>
                <textarea
                  id="resume-profile-interests"
                  value={interestsText}
                  onChange={(event) => setInterestsText(event.target.value)}
                  rows={2}
                  placeholder="React, UI design, accessibility"
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-line-soft pt-5 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={handleCancelProfileEdit}
                  disabled={isSavingProfile}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  loading={isSavingProfile}
                  leadingIcon={<Check aria-hidden="true" />}
                >
                  {isSavingProfile ? "Saving…" : "Save profile"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4">
                <Avatar
                  name={user?.name ?? "?"}
                  src={user?.avatarUrl}
                  size="xl"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-ink">
                    {user?.name}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {user?.headline || "Add a professional headline"}
                  </p>
                </div>
              </div>
              {user?.about && (
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-body">
                  {user.about}
                </p>
              )}
              {user?.interests?.length ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {user.interests.map((interest) => (
                    <span key={interest} className={badgeClass("neutral")}>
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                !user?.about && (
                  <p className="mt-4 text-sm text-muted">
                    Add an about section and interests to complete your profile.
                  </p>
                )
              )}
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={showDeleteConfirmation && Boolean(resume)}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteResume}
        tone="danger"
        title="Delete your current resume?"
        description="This permanently removes the file from your candidate profile."
        confirmLabel={isDeletingResume ? "Deleting…" : "Delete resume"}
        loading={isDeletingResume}
      >
        {deleteError ? <InlineError message={deleteError} /> : null}
      </ConfirmDialog>
    </PortalPage>
  );
}
