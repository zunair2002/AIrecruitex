"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, homePathForRole } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";

/**
 * Gate for the portal areas: waits for the session check, bounces signed-out
 * visitors to the matching login page, and handles role mismatches.
 *
 * A mismatch is treated differently depending on where the session came from:
 *
 * - Signed in *here* as HR, then opened a /candidate URL → you really are HR,
 *   so you go to the HR portal.
 * - The tab merely *inherited* the last session on the origin (a fresh tab
 *   seeds itself from localStorage so links don't dump you at a login screen)
 *   → you never chose that role in this tab. Clicking "Candidate" and landing
 *   in the recruiter portal looks like the app mixed up the account, so the
 *   inherited session is dropped for this tab and you get the login page for
 *   the portal you actually asked for. Other tabs keep their own sessions.
 */
export function RequireAuth({
  roles,
  loginPath,
  children,
}: {
  roles: UserRole[];
  loginPath: string;
  children: React.ReactNode;
}) {
  const {
    user,
    isLoading,
    endTabSession,
    sessionOrigin,
    isDeactivated,
  } = useAuth();
  const router = useRouter();

  const isAllowed = user !== null && roles.includes(user.role);
  // A stable key, so the effect doesn't re-run on every render just because the
  // caller passes a fresh array literal for `roles`.
  const roleKey = roles.join(",");

  useEffect(() => {
    if (isLoading) return;
    // A deactivated account gets its own page, outside the portal shell.
    if (isDeactivated) {
      router.replace("/account-deactivated");
      return;
    }

    if (!user) {
      router.replace(loginPath);
      return;
    }

    if (!roles.includes(user.role)) {
      if (sessionOrigin() === "adopted") {
        endTabSession();
        router.replace(loginPath);
      } else {
        router.replace(homePathForRole(user.role));
      }
    }
    // `roles` is covered by `roleKey`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoading,
    isDeactivated,
    user,
    roleKey,
    loginPath,
    router,
    endTabSession,
    sessionOrigin,
  ]);

  if (isLoading || !isAllowed) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[#e9eaf0] border-t-brand"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return <>{children}</>;
}
