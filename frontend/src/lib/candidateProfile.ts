import type { AuthUser } from "./types";

/** Where an incomplete candidate is sent, and where they continue to after. */
export const CANDIDATE_PROFILE_PATH = "/candidate/profile";
export const CANDIDATE_HOME_PATH = "/candidate/dashboard";

/**
 * A candidate profile counts as complete once it has a headline, an about
 * section and at least one interest (the photo stays optional). Until then
 * every candidate page except the profile page redirects there.
 */
export function isCandidateProfileComplete(
  profile: Pick<AuthUser, "headline" | "about" | "interests"> | null | undefined,
): boolean {
  if (!profile) return false;
  return (
    Boolean(profile.headline?.trim()) &&
    Boolean(profile.about?.trim()) &&
    (profile.interests ?? []).some((interest) => interest.trim().length > 0)
  );
}
