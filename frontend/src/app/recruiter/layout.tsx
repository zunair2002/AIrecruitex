import { RecruiterSidebar } from "@/components/recruiter/RecruiterSidebar";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <RecruiterSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
