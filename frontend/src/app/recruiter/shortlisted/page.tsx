import { Suspense } from "react";
import { ShortlistedList } from "@/components/recruiter/shortlisted/ShortlistedList";
import { LoadingBlock } from "@/components/ui/Feedback";

export const metadata = {
  title: "Selected Candidates | AIRecruitX HR",
  description: "Applicants marked Selected, ready for an organisation interview",
};

export default function ShortlistedPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ShortlistedList />
    </Suspense>
  );
}
