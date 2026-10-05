import { Suspense } from "react";
import { OrgInterviewByToken } from "@/components/candidate/interview/OrgInterviewByToken";
import { LoadingBlock } from "@/components/ui/Feedback";

export const metadata = {
  title: "Organisational Interview | AiRecruitex",
  description: "Complete the interview you were invited to by email",
};

export default function OrgInterviewPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <OrgInterviewByToken />
    </Suspense>
  );
}
