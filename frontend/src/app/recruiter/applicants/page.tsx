import { Suspense } from "react";
import { ApplicantsList } from "@/components/recruiter/applicants/ApplicantsList";
import { LoadingBlock } from "@/components/ui/Feedback";

export const metadata = {
  title: "Applicants | AiRecruitex HR",
  description: "Review applicants, match scores and schedule interviews",
};

export default function ApplicantsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ApplicantsList />
    </Suspense>
  );
}
