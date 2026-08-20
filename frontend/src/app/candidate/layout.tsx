import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth roles={["candidate"]} loginPath="/login/candidate">
      <div className="flex min-h-screen bg-gray-50">
        <CandidateSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </RequireAuth>
  );
}
