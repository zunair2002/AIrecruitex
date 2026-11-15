"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  AVATAR_ACCEPTED_MIME_TYPES,
  AVATAR_ACCEPT_ATTRIBUTE,
  updateCandidateProfile,
} from "@/lib/authApi";
import { RESUME_MAX_BYTES } from "@/lib/resumeApi";
import { formatFileSize, initials } from "@/lib/format";
import {
  Card,
  InlineError,
  InlineSuccess,
  PageHeader,
} from "@/components/ui/Feedback";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/controls";

const MAX_MB = RESUME_MAX_BYTES / (1024 * 1024);
const HEADLINE_MAX = 120;
const ABOUT_MAX = 1000;

/**
 * PATCH /api/auth/profile — candidate only.
 *
 * The endpoint replaces the whole profile rather than merging, so every field
 * is sent on each save. Interests are free text here; the backend stores them
 * as a plain string array.
 */
export function CandidateProfile() {
  const { user, token, refresh } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [headline, setHeadline] = useState(user?.headline ?? "");
  const [about, setAbout] = useState(user?.about ?? "");
  const [interests, setInterests] = useState((user?.interests ?? []).join(", "));
  const [avatar, setAvatar] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const parsedInterests = Array.from(
    new Set(
      interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!AVATAR_ACCEPTED_MIME_TYPES.includes(file.type)) {
      setError("Profile photo must be JPG, PNG or WEBP.");
      return;
    }
    if (file.size > RESUME_MAX_BYTES) {
      setError(`Profile photo must be under ${MAX_MB}MB.`);
      return;
    }
    setError(null);
    setAvatar(file);
    setRemoveAvatar(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      await updateCandidateProfile(
        {
          headline,
          about,
          interests: parsedInterests,
          avatar: avatar ?? undefined,
          removeAvatar,
        },
        token,
      );
      await refresh();
      setAvatar(null);
      setRemoveAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
      setSuccess("Profile saved.");
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const showExistingAvatar = Boolean(user?.avatarUrl) && !removeAvatar && !avatar;

  return (
    <div className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="My Profile"
          description="How you present yourself. Your name and email come from your account and can't be changed here."
        />

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <InlineError message={error} />}
            {success && <InlineSuccess message={success} />}

            <div className="flex items-center gap-4">
              {showExistingAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user!.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                  {initials(user?.name ?? "?")}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-[#292b35]">{user?.name}</p>
                <p className="truncate text-sm text-[#898b96]">{user?.email}</p>
              </div>
            </div>

            <div>
              <label htmlFor="profile-avatar" className={labelClass}>
                Profile photo
              </label>
              <input
                id="profile-avatar"
                ref={fileRef}
                type="file"
                accept={AVATAR_ACCEPT_ATTRIBUTE}
                onChange={(event) => handleFile(event.target.files?.[0])}
                className="w-full rounded border border-[#e9eaf0] bg-white px-4 py-3 text-sm text-[#686b77] file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700"
              />
              <p className="mt-2 text-xs text-[#9698a2]">
                JPG, PNG or WEBP, max {MAX_MB}MB.
                {avatar && ` Selected: ${avatar.name} · ${formatFileSize(avatar.size)}`}
              </p>
              {user?.avatarUrl && (
                <label className="mt-2 flex items-center gap-2 text-sm text-[#686b77]">
                  <input
                    type="checkbox"
                    checked={removeAvatar}
                    onChange={(event) => {
                      setRemoveAvatar(event.target.checked);
                      if (event.target.checked) {
                        setAvatar(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }
                    }}
                    className="h-4 w-4 rounded border-[#e3e4ec] text-indigo-600 focus:ring-indigo-500"
                  />
                  Remove my current photo
                </label>
              )}
            </div>

            <div>
              <label htmlFor="profile-headline" className={labelClass}>
                Headline
              </label>
              <input
                id="profile-headline"
                type="text"
                maxLength={HEADLINE_MAX}
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="e.g. Frontend developer focused on React"
                className={inputClass}
              />
              <p className="mt-2 text-xs text-[#9698a2]">
                {headline.length}/{HEADLINE_MAX}
              </p>
            </div>

            <div>
              <label htmlFor="profile-about" className={labelClass}>
                About
              </label>
              <textarea
                id="profile-about"
                rows={6}
                maxLength={ABOUT_MAX}
                value={about}
                onChange={(event) => setAbout(event.target.value)}
                placeholder="A short summary of your experience and what you're looking for."
                className={`${inputClass} resize-none`}
              />
              <p className="mt-2 text-xs text-[#9698a2]">
                {about.length}/{ABOUT_MAX}
              </p>
            </div>

            <div>
              <label htmlFor="profile-interests" className={labelClass}>
                Interests
              </label>
              <input
                id="profile-interests"
                type="text"
                value={interests}
                onChange={(event) => setInterests(event.target.value)}
                placeholder="e.g. react, system design, machine learning"
                className={inputClass}
              />
              <p className="mt-2 text-xs text-[#9698a2]">Comma separated.</p>
              {parsedInterests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {parsedInterests.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={isSaving} className={primaryButtonClass}>
              {isSaving ? "Saving…" : "Save profile"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
