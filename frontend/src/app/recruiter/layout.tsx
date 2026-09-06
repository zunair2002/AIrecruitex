import { RecruiterSidebar } from "@/components/recruiter/RecruiterSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth roles={["hr"]} loginPath="/login/recruiter">
      <div className="flex min-h-screen bg-gray-50">
        <RecruiterSidebar />
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </RequireAuth>
  );
}
