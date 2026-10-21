import { PracticeInterview } from "@/components/candidate/interview/PracticeInterview";

export const metadata = {
  title: "Round 2 — Technical Interview | AiRecruitex Candidate",
  description: "Practice Round 2: the technical interview on your chosen track",
};

export default function AdvancedInterviewPage() {
  return <PracticeInterview stage="technical" />;
}
