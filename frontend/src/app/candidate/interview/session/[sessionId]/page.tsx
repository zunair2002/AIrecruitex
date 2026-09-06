import { ScheduledInterview } from "@/components/candidate/interview/ScheduledInterview";

export const metadata = {
  title: "AI Interview | AIRecruitX Candidate",
  description: "Take the AI interview scheduled for your application",
};

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <ScheduledInterview sessionId={sessionId} />;
}
