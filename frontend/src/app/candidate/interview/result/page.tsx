import { InterviewHistory } from "@/components/candidate/interview/InterviewHistory";

export const metadata = {
  title: "Interview Results | AiRecruitex Candidate",
  description: "Scores, per-answer feedback and certificates for every interview",
};

export default function InterviewResultPage() {
  return <InterviewHistory />;
}
