import { QuestionSetGate } from "@/components/recruiter/jobs/QuestionSetGate";
import { PortalPage } from "@/components/dashboard/primitives";

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
    <PortalPage>
      <QuestionSetGate jobId={jobId} />
    </PortalPage>
  );
}
