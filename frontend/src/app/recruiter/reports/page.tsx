import { Suspense } from "react";
import { InterviewReportsList } from "@/components/recruiter/reports/InterviewReportsList";
import { LoadingBlock } from "@/components/ui/Feedback";

export const metadata = {
  title: "Interview Reports | AIRecruitX HR",
  description: "AI interview scores and per-answer feedback for your applicants",
};

export default function InterviewReportsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <InterviewReportsList />
    </Suspense>
  );
}
