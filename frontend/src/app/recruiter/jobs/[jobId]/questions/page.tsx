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
    <div className="p-8">
      <Link
        href="/recruiter/jobs"
        className="mb-6 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
      >
        ← Back to my jobs
      </Link>
      <QuestionSetGate jobId={jobId} />
    </div>
  );
}
