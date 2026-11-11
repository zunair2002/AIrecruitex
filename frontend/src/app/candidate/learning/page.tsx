import { Suspense } from "react";
import { CourseList } from "@/components/candidate/learning/CourseList";
import { LoadingBlock } from "@/components/ui/Feedback";

export const metadata = {
  title: "Learning | AiRecruitex Candidate",
  description: "Courses published by the hiring team",
};

export default function LearningPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <CourseList />
    </Suspense>
  );
}
