import Link from "next/link";
import { QuestionSetGate } from "@/components/recruiter/jobs/QuestionSetGate";

export const metadata = {
  title: "Interview Questions | AiRecruitex HR",
  description: "Upload and review the organisational interview question pool",
};

export default async function JobQuestionsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return (
    <div className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
      <Link
        href="/recruiter/jobs"
        className="mb-6 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
      >
        ← Back to my jobs
      </Link>
      <QuestionSetGate jobId={jobId} />
    </div>
  );
}
