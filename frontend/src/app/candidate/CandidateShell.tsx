"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CandidatePortalShell } from "@/components/candidate/CandidateSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import {
  CANDIDATE_PROFILE_PATH,
  isCandidateProfileComplete,
} from "@/lib/candidateProfile";

/**
 * Routes under /candidate that must stay reachable without a session.
 *
 * The organisational interview is opened from a link emailed to the candidate
 * (the backend builds `${APP_BASE_URL}/candidate/interview/org?token=...`), and
 * they may open it on a device where they have never signed in. The invite
 * token is the credential, so this route renders outside the portal shell.
 */
const PUBLIC_PATHS = ["/candidate/interview/org"];

export function CandidateShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return <>{children}</>;
  }

  return (
    <RequireAuth roles={["candidate"]} loginPath="/login/candidate">
      <ProfileGate pathname={pathname}>
        <CandidatePortalShell>{children}</CandidatePortalShell>
      </ProfileGate>
    </RequireAuth>
  );
}

/**
 * Creating a profile is mandatory: until it's complete (see
 * isCandidateProfileComplete) every candidate page except the profile page
 * redirects there. Runs inside RequireAuth, so `user` is a signed-in candidate.
 * The page is never rendered while the redirect is pending, so nothing flashes,
 * and the profile page itself is exempt, so it can't loop.
 */
function ProfileGate({
  pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const onProfilePage = pathname.startsWith(CANDIDATE_PROFILE_PATH);
  const mustRedirect = !onProfilePage && !isCandidateProfileComplete(user);

  useEffect(() => {
    if (mustRedirect) router.replace(CANDIDATE_PROFILE_PATH);
  }, [mustRedirect, router]);

  if (mustRedirect) {
    return (
      <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 bg-canvas px-4">
        <div
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600"
          role="status"
          aria-label="Loading"
        />
        <p aria-hidden="true" className="text-sm text-muted">
          Loading your workspace…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
