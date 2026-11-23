"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanSearch, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  AVATAR_ACCEPTED_MIME_TYPES,
  AVATAR_ACCEPT_ATTRIBUTE,
  updateCandidateProfile,
} from "@/lib/authApi";
import { RESUME_MAX_BYTES } from "@/lib/resumeApi";
import {
  CANDIDATE_HOME_PATH,
  isCandidateProfileComplete,
} from "@/lib/candidateProfile";
import { badgeClass, formatFileSize } from "@/lib/format";
import {
  Card,
  InlineError,
  InlineSuccess,
  PageHeader,
} from "@/components/ui/Feedback";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  checkboxClass,
  helpTextClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/ui/controls";
import { PortalPage } from "@/components/dashboard/primitives";
import { PlanBadge, UpgradeLink, planOf } from "@/components/candidate/plan/PlanBits";

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
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  // Set from the saved account (not the form), so the banner only clears once
  // a complete profile has actually been stored.
  const mustComplete = !isCandidateProfileComplete(user);

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
      // First-time setup: the profile gate held them here, so once the saved
      // profile is complete, carry on into the portal.
      if (
        mustComplete &&
        isCandidateProfileComplete({ headline, about, interests: parsedInterests })
      ) {
        router.replace(CANDIDATE_HOME_PATH);
        return;
      }
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
  const completed = [
    Boolean(user?.avatarUrl || avatar) && !removeAvatar,
    Boolean(headline.trim()),
    Boolean(about.trim()),
    parsedInterests.length > 0,
  ].filter(Boolean).length;
  const completion = Math.round((completed / 4) * 100);

  return (
    <PortalPage>
      <PageHeader
        title="My profile"
        description="How you present yourself. Your name and email come from your account and can't be changed here."
        icon={<UserRound />}
      />

      <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-3">
        <Card
          title="Profile details"
          description="Shown to employers alongside your applications."
          className="xl:col-span-2"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {mustComplete && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4"
              >
                <ScanSearch
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    Complete your profile to continue
                  </p>
                  <p className="mt-0.5 text-sm text-body">
                    Add a headline, an about section and at least one interest,
                    then save. You&apos;ll go straight to your dashboard.
                  </p>
                </div>
              </div>
            )}
            {error && <InlineError message={error} />}
            {success && <InlineSuccess message={success} />}

            <div className="flex items-center gap-4 rounded-xl bg-surface-2 p-4">
              <Avatar
                name={user?.name ?? "?"}
                src={showExistingAvatar ? user!.avatarUrl : null}
                size="xl"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-ink">
                  {user?.name}
                </p>
                <p className="truncate text-sm text-muted">{user?.email}</p>
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
                className="block w-full cursor-pointer rounded-lg border border-line bg-white text-sm text-muted shadow-xs transition file:mr-4 file:h-10 file:cursor-pointer file:border-0 file:border-r file:border-line file:bg-surface-2 file:px-4 file:text-sm file:font-semibold file:text-body hover:file:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              />
              <p className={helpTextClass}>
                JPG, PNG or WEBP, max {MAX_MB}MB.
                {avatar && ` Selected: ${avatar.name} · ${formatFileSize(avatar.size)}`}
              </p>
              {user?.avatarUrl && (
                <label className="mt-3 inline-flex items-center gap-2 text-sm text-body">
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
                    className={checkboxClass}
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
              <p className={`${helpTextClass} text-right tabular-nums`}>
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
                className={`${textareaClass} resize-none`}
              />
              <p className={`${helpTextClass} text-right tabular-nums`}>
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
              <p className={helpTextClass}>Comma separated.</p>
              {parsedInterests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {parsedInterests.map((item) => (
                    <span key={item} className={badgeClass("brand")}>
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-line-soft pt-5 sm:flex-row sm:justify-end">
              <Button type="submit" loading={isSaving}>
                {isSaving ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </form>
        </Card>

        <Card
          title="Profile preview"
          description="A live preview of your candidate profile."
          className="xl:sticky xl:top-6 xl:self-start"
        >
          <div className="flex items-center gap-3">
            <Avatar
              name={user?.name ?? "?"}
              src={showExistingAvatar ? user!.avatarUrl : null}
              size="lg"
            />
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-ink">
                  {user?.name}
                </p>
                <PlanBadge plan={planOf(user)} />
              </div>
              <p className="text-sm text-muted">
                {headline.trim() || "Add a headline"}
              </p>
            </div>
          </div>
          {about.trim() && (
            <p className="mt-4 line-clamp-6 whitespace-pre-line text-sm leading-6 text-body">
              {about}
            </p>
          )}
          {parsedInterests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {parsedInterests.map((item) => (
                <span key={item} className={badgeClass("neutral")}>
                  {item}
                </span>
              ))}
            </div>
          )}
          <div className="mt-5 border-t border-line-soft pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-body">Profile strength</span>
              <span className="font-semibold tabular-nums text-ink">
                {completion}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Profile strength"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completion}
              className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3"
            >
              <div
                className="h-full rounded-full bg-brand-600 transition-[width]"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              Add a photo, headline, about section and interests to stand out.
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-line-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-body">
                {planOf(user) === "premium" ? "Premium plan" : "Free plan"}
              </p>
              <p className="text-xs text-muted">
                {planOf(user) === "premium"
                  ? "All courses unlocked · 10 practice interviews a day"
                  : "Free courses · 5 practice interviews a day"}
              </p>
            </div>
            {planOf(user) === "free" && <UpgradeLink />}
          </div>
        </Card>
      </div>
    </PortalPage>
  );
}
