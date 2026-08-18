import { CandidateSidebar } from "@/components/candidate/CandidateSidebar";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <CandidateSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
