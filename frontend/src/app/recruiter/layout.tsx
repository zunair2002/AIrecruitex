import { RecruiterSidebar } from "@/components/recruiter/RecruiterSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

/**
 * Same shell as the candidate and admin portals: a fixed-height sidebar beside a
 * single scrolling pane, so the nav never scrolls away with the content.
 */
export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth roles={["hr"]} loginPath="/login/recruiter">
      <div className="flex h-dvh overflow-hidden">
        <RecruiterSidebar />
        <main className="h-dvh min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#f7f8fa]">
          {children}
        </main>
      </div>
    </RequireAuth>
  );
}
