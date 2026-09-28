import { PracticeInterview } from "@/components/candidate/interview/PracticeInterview";

export const metadata = {
  title: "Beginner Practice Interview | AiRecruitex Candidate",
  description: "Practice interview at the backend's beginner difficulty level",
};

export default function BasicInterviewPage() {
  return (
    <PracticeInterview
      levels={["beginner"]}
      heading="Beginner Practice Interview"
      intro="A live AI interview at the beginner difficulty level. Each answer is scored out of 10 as you go, and the interviewer adapts its next question to what you said."
      icon="🎤"
    />
  );
}
