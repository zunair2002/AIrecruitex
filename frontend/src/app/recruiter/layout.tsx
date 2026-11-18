import { RecruiterShell } from "@/components/recruiter/RecruiterSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

/**
 * Same shell as the candidate and admin portals (`PortalShell`): a fixed
 * sidebar on desktop, a top bar + slide-in drawer on smaller screens, and a
 * window-scrolling content column.
 */
export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth roles={["hr"]} loginPath="/login/recruiter">
      <RecruiterShell>{children}</RecruiterShell>
    </RequireAuth>
  );
}
