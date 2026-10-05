"use client";

import { usePathname } from "next/navigation";
import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

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
      <div className="flex min-h-screen bg-gray-50">
        <CandidateSidebar />
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </RequireAuth>
  );
}
