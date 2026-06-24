import { LearningRecommendations } from "@/components/candidate/recommendations/LearningRecommendations";

export const metadata = {
  title: "Learning Recommendations | AIRecruitX Candidate",
  description: "AI-powered learning recommendations based on your interview performance",
};

export default function RecommendationsPage() {
  return <LearningRecommendations />;
}
