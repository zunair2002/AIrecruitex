import { PracticeInterview } from "@/components/candidate/interview/PracticeInterview";

export const metadata = {
  title: "Advanced Practice Interview | AiRecruitex Candidate",
  description: "Practice interview at intermediate or expert difficulty",
};

export default function AdvancedInterviewPage() {
  return (
    <PracticeInterview
      levels={["intermediate", "expert"]}
      heading="Advanced Practice Interview"
      intro="Pick a difficulty and the interviewer tailors its questions and follow-ups to it. Scoring and feedback are identical to a real scheduled interview."
      icon="🚀"
    />
  );
}
